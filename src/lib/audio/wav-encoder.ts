export type WavBitDepth = 16 | 24;
export type ChannelMode = 'keep' | 'mono' | 'stereo';

export interface WavEncodeOptions {
  sampleRate: number;
  bitDepth: WavBitDepth;
}

function clampSample(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

export function mixToMono(channels: Float32Array[]): Float32Array {
  const first = channels[0];
  if (!first) {
    return new Float32Array(0);
  }
  if (channels.length === 1) {
    return first.slice();
  }

  const mono = new Float32Array(first.length);
  for (let channel = 0; channel < channels.length; channel += 1) {
    const data = channels[channel]!;
    for (let index = 0; index < mono.length; index += 1) {
      mono[index] = (mono[index] ?? 0) + (data[index] ?? 0) / channels.length;
    }
  }

  return mono;
}

export function adaptChannels(channels: Float32Array[], mode: ChannelMode): Float32Array[] {
  if (mode === 'mono') {
    return [mixToMono(channels)];
  }

  if (mode === 'stereo') {
    if (channels.length >= 2) {
      return [channels[0]!.slice(), channels[1]!.slice()];
    }

    const mono = channels[0]?.slice() ?? new Float32Array(0);
    return [mono, mono.slice()];
  }

  return channels.slice(0, 2).map((channel) => channel.slice());
}

/** Linear-interpolation resampling. Honest and dependency-free, not a studio SRC. */
export function resampleChannels(
  channels: Float32Array[],
  fromRate: number,
  toRate: number,
): Float32Array[] {
  if (fromRate === toRate || channels.length === 0) {
    return channels.map((channel) => channel.slice());
  }

  const ratio = toRate / fromRate;
  const sourceLength = channels[0]?.length ?? 0;
  const targetLength = Math.max(1, Math.round(sourceLength * ratio));

  return channels.map((data) => {
    const output = new Float32Array(targetLength);
    for (let index = 0; index < targetLength; index += 1) {
      const position = index / ratio;
      const lower = Math.floor(position);
      const upper = Math.min(lower + 1, data.length - 1);
      const fraction = position - lower;
      output[index] = (data[lower] ?? 0) * (1 - fraction) + (data[upper] ?? 0) * fraction;
    }
    return output;
  });
}

export function peakOfChannels(channels: Float32Array[]): number {
  let peak = 0;
  for (const data of channels) {
    for (let index = 0; index < data.length; index += 1) {
      const magnitude = Math.abs(data[index] ?? 0);
      if (magnitude > peak) {
        peak = magnitude;
      }
    }
  }
  return peak;
}

export function normalizeChannels(channels: Float32Array[], targetDbfs: number): Float32Array[] {
  const peak = peakOfChannels(channels);
  if (peak <= 0 || !Number.isFinite(targetDbfs)) {
    return channels.map((channel) => channel.slice());
  }

  const target = 10 ** (targetDbfs / 20);
  const gain = target / peak;

  return channels.map((data) => {
    const output = new Float32Array(data.length);
    for (let index = 0; index < data.length; index += 1) {
      output[index] = clampSample((data[index] ?? 0) * gain);
    }
    return output;
  });
}

function writeString(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

/** Encodes channel data as a canonical little-endian PCM WAV file. */
export function encodeWav(channels: Float32Array[], options: WavEncodeOptions): ArrayBuffer {
  const channelCount = Math.max(1, Math.min(2, channels.length));
  const frameCount = channels[0]?.length ?? 0;
  const bytesPerSample = options.bitDepth / 8;
  const blockAlign = channelCount * bytesPerSample;
  const dataSize = frameCount * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, options.sampleRate, true);
  view.setUint32(28, options.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, options.bitDepth, true);

  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = clampSample(channels[channel]![frame] ?? 0);

      if (options.bitDepth === 16) {
        view.setInt16(offset, Math.round(sample * 32767), true);
        offset += 2;
      } else {
        const value = Math.round(sample * 8388607);
        view.setUint8(offset, value & 0xff);
        view.setUint8(offset + 1, (value >> 8) & 0xff);
        view.setUint8(offset + 2, (value >> 16) & 0xff);
        offset += 3;
      }
    }
  }

  return buffer;
}
