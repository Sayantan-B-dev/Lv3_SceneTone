import { describe, expect, it } from 'vitest';
import {
  adaptChannels,
  encodeWav,
  mixToMono,
  normalizeChannels,
  peakOfChannels,
  resampleChannels,
} from './wav-encoder';

function ascii(view: DataView, offset: number, length: number): string {
  let text = '';
  for (let index = 0; index < length; index += 1) {
    text += String.fromCharCode(view.getUint8(offset + index));
  }
  return text;
}

describe('wav encoder', () => {
  it('writes a valid 16-bit PCM header and samples', () => {
    const wav = encodeWav([new Float32Array([0, 1, -1])], {
      sampleRate: 44100,
      bitDepth: 16,
    });
    const view = new DataView(wav);

    expect(ascii(view, 0, 4)).toBe('RIFF');
    expect(ascii(view, 8, 4)).toBe('WAVE');
    expect(ascii(view, 12, 4)).toBe('fmt ');
    expect(ascii(view, 36, 4)).toBe('data');
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(44100);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(6);
    expect(view.getInt16(44, true)).toBe(0);
    expect(view.getInt16(46, true)).toBe(32767);
    expect(view.getInt16(48, true)).toBe(-32767);
  });

  it('writes 24-bit stereo data at three bytes per sample', () => {
    const wav = encodeWav([new Float32Array([1]), new Float32Array([-1])], {
      sampleRate: 48000,
      bitDepth: 24,
    });
    const view = new DataView(wav);

    expect(view.getUint16(22, true)).toBe(2);
    expect(view.getUint16(34, true)).toBe(24);
    expect(view.getUint32(40, true)).toBe(6);
    expect(view.getUint8(44)).toBe(0xff);
    expect(view.getUint8(45)).toBe(0xff);
    expect(view.getUint8(46)).toBe(0x7f);
    expect(view.getUint8(47)).toBe(0x01);
    expect(view.getUint8(48)).toBe(0x00);
    expect(view.getUint8(49)).toBe(0x80);
  });

  it('mixes stereo to mono and duplicates mono to stereo', () => {
    const left = new Float32Array([1, 0.5]);
    const right = new Float32Array([0, -0.5]);

    expect(Array.from(mixToMono([left, right]))).toEqual([0.5, 0]);

    const stereo = adaptChannels([new Float32Array([0.25])], 'stereo');
    expect(stereo).toHaveLength(2);
    expect(stereo[1]![0]).toBe(0.25);
  });

  it('normalizes the peak to the target level without clipping', () => {
    const channels = [new Float32Array([0.1, -0.2]), new Float32Array([0.05, 0])];
    const normalized = normalizeChannels(channels, -6);

    expect(peakOfChannels(normalized)).toBeCloseTo(10 ** (-6 / 20), 4);
  });

  it('leaves silence untouched when normalizing', () => {
    const silent = [new Float32Array([0, 0])];
    expect(Array.from(normalizeChannels(silent, -1)[0]!)).toEqual([0, 0]);
  });

  it('resamples to the requested length with interpolation', () => {
    const input = [new Float32Array([0, 0.5, 1, 0.5])];
    const output = resampleChannels(input, 44100, 88200);

    expect(output[0]).toHaveLength(8);
    expect(output[0]![0]).toBe(0);
    expect(output[0]![2]).toBeCloseTo(0.5, 5);
  });
});
