import type { AudioMetrics, BandEnergy } from '@/types';

const FFT_SIZE = 2048;
const LOW_LIMIT_HZ = 250;
const MID_LIMIT_HZ = 4000;

export interface AudioBufferLike {
  numberOfChannels: number;
  sampleRate: number;
  length: number;
  duration: number;
  getChannelData(channel: number): Float32Array;
}

export type ProgressCallback = (fraction: number) => void;

function toDbfs(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round(20 * Math.log10(value) * 100) / 100;
}

function fftMagnitudes(samples: Float32Array): Float64Array {
  const size = samples.length;
  const real = new Float64Array(size);
  const imag = new Float64Array(size);

  for (let index = 0; index < size; index += 1) {
    const window = 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (size - 1));
    real[index] = (samples[index] ?? 0) * window;
  }

  for (let index = 1, bit = size >> 1; index < size; index += 1) {
    if (index < bit) {
      const value = real[index]!;
      real[index] = real[bit]!;
      real[bit] = value;
    }

    let mask = size >> 1;
    while (bit & mask) {
      bit ^= mask;
      mask >>= 1;
    }
    bit ^= mask;
  }

  for (let length = 2; length <= size; length <<= 1) {
    const angle = (-2 * Math.PI) / length;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);

    for (let offset = 0; offset < size; offset += length) {
      let cos = 1;
      let sin = 0;

      for (let step = 0; step < length / 2; step += 1) {
        const evenIndex = offset + step;
        const oddIndex = evenIndex + length / 2;
        const oddReal = real[oddIndex]! * cos - imag[oddIndex]! * sin;
        const oddImag = real[oddIndex]! * sin + imag[oddIndex]! * cos;

        real[oddIndex] = real[evenIndex]! - oddReal;
        imag[oddIndex] = imag[evenIndex]! - oddImag;
        real[evenIndex] = real[evenIndex]! + oddReal;
        imag[evenIndex] = imag[evenIndex]! + oddImag;

        const nextCos = cos * cosine - sin * sine;
        sin = cos * sine + sin * cosine;
        cos = nextCos;
      }
    }
  }

  const magnitudes = new Float64Array(size / 2);
  for (let index = 0; index < magnitudes.length; index += 1) {
    magnitudes[index] = Math.hypot(real[index]!, imag[index]!);
  }

  return magnitudes;
}

export function computeBandEnergyFromChannels(
  channels: Float32Array[],
  sampleRate: number,
): BandEnergy {
  const length = channels[0]?.length ?? 0;
  const windowSize = Math.min(FFT_SIZE, length);
  if (windowSize < 8) {
    return { low: 0, mid: 0, high: 0 };
  }

  const start = Math.max(0, Math.floor((length - windowSize) / 2));
  const channelCount = Math.min(2, channels.length);
  const mono = new Float32Array(windowSize);

  for (let channel = 0; channel < channelCount; channel += 1) {
    const data = channels[channel]!;
    for (let index = 0; index < windowSize; index += 1) {
      mono[index] = (mono[index] ?? 0) + (data[start + index] ?? 0) / channelCount;
    }
  }

  const magnitudes = fftMagnitudes(mono);
  const binWidth = sampleRate / windowSize;
  let low = 0;
  let mid = 0;
  let high = 0;

  for (let bin = 1; bin < magnitudes.length; bin += 1) {
    const frequency = bin * binWidth;
    const power = magnitudes[bin]! ** 2;

    if (frequency < LOW_LIMIT_HZ) {
      low += power;
    } else if (frequency < MID_LIMIT_HZ) {
      mid += power;
    } else {
      high += power;
    }
  }

  const total = low + mid + high;
  if (total <= 0) {
    return { low: 0, mid: 0, high: 0 };
  }

  return {
    low: Math.round((low / total) * 1000) / 1000,
    mid: Math.round((mid / total) * 1000) / 1000,
    high: Math.round((high / total) * 1000) / 1000,
  };
}

export function computeBandEnergy(buffer: AudioBufferLike): BandEnergy {
  const channels = Array.from({ length: Math.min(2, buffer.numberOfChannels) }, (_, channel) =>
    buffer.getChannelData(channel),
  );
  return computeBandEnergyFromChannels(channels, buffer.sampleRate);
}

/** Computes numeric metrics from raw channel data. Pure and worker-safe. */
export function computeMetricsFromChannels(
  channels: Float32Array[],
  sampleRate: number,
  duration: number,
  onProgress?: ProgressCallback,
): AudioMetrics {
  const usedChannels = Math.min(2, Math.max(1, channels.length));
  const channelCount = usedChannels > 1 ? 2 : 1;
  const channelData = channels.slice(0, usedChannels);

  let peak = 0;
  let sumSquares = 0;
  let leftSquares = 0;
  let rightSquares = 0;

  for (let channel = 0; channel < channelData.length; channel += 1) {
    const data = channelData[channel]!;
    let channelSquares = 0;

    for (let index = 0; index < data.length; index += 1) {
      const sample = data[index] ?? 0;
      const magnitude = Math.abs(sample);
      if (magnitude > peak) {
        peak = magnitude;
      }
      const square = sample * sample;
      sumSquares += square;
      channelSquares += square;
    }

    if (channel === 0) {
      leftSquares = channelSquares;
    } else {
      rightSquares = channelSquares;
    }

    onProgress?.((channel + 1) / (channelData.length + 2));
  }

  const samplesPerChannel = Math.max(1, channelData[0]?.length ?? 0);

  let correlation = 0;
  if (channelCount === 2) {
    const left = channelData[0]!;
    const right = channelData[1]!;
    let product = 0;
    const length = Math.min(left.length, right.length);

    for (let index = 0; index < length; index += 1) {
      product += (left[index] ?? 0) * (right[index] ?? 0);
    }

    const denominator = Math.sqrt(leftSquares * rightSquares);
    correlation = denominator > 0 ? product / denominator : 0;
  }

  const peakDbfs = toDbfs(peak);
  const rms = Math.sqrt(sumSquares / (samplesPerChannel * channelCount));
  const rmsDbfs = toDbfs(rms);
  const bandEnergy = computeBandEnergyFromChannels(channelData, sampleRate);

  onProgress?.(1);

  return {
    channels: channelCount,
    durationSeconds: Math.round(duration * 1000) / 1000,
    samplePeakDbfs: peakDbfs,
    rmsDbfs,
    crestFactorDb:
      peakDbfs !== null && rmsDbfs !== null ? Math.round((peakDbfs - rmsDbfs) * 100) / 100 : null,
    bandEnergy,
    stereoCorrelation:
      channelCount === 2 && Number.isFinite(correlation)
        ? Math.round(correlation * 1000) / 1000
        : null,
  };
}

export function computeMetrics(buffer: AudioBufferLike): AudioMetrics {
  const channels = Array.from({ length: Math.min(2, buffer.numberOfChannels) }, (_, channel) =>
    buffer.getChannelData(channel),
  );
  return computeMetricsFromChannels(channels, buffer.sampleRate, buffer.duration);
}
