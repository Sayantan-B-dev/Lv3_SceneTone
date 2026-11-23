import { decodeAudioFile } from '@/lib/audio-analysis';
import {
  adaptChannels,
  encodeWav,
  normalizeChannels,
  resampleChannels,
  type ChannelMode,
  type WavBitDepth,
} from './wav-encoder';

export interface ConvertOptions {
  bitDepth: WavBitDepth;
  channelMode: ChannelMode;
  /** When omitted, the source sample rate is kept. */
  sampleRate?: number;
  /** When null or omitted, no normalization is applied. */
  normalizeToDbfs?: number | null;
}

/** Decode → adapt channels → optional resample/normalize → PCM WAV, all in the browser. */
export async function convertFileToWav(file: File, options: ConvertOptions): Promise<Blob> {
  const buffer = await decodeAudioFile(file);

  const sourceChannels = Array.from(
    { length: Math.min(2, buffer.numberOfChannels) },
    (_, channel) => buffer.getChannelData(channel).slice(),
  );

  let channels = adaptChannels(sourceChannels, options.channelMode);

  let sampleRate = buffer.sampleRate;
  if (options.sampleRate && options.sampleRate !== sampleRate) {
    channels = resampleChannels(channels, sampleRate, options.sampleRate);
    sampleRate = options.sampleRate;
  }

  if (options.normalizeToDbfs !== null && options.normalizeToDbfs !== undefined) {
    channels = normalizeChannels(channels, options.normalizeToDbfs);
  }

  const wav = encodeWav(channels, { sampleRate, bitDepth: options.bitDepth });
  return new Blob([wav], { type: 'audio/wav' });
}
