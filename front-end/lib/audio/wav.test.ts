import { expect, test } from 'vitest';
import { encodeWav, readPcm16Mono } from './wav';

test('encodeWav tạo WAV PCM 16-bit mono mà readPcm16Mono đọc lại được', () => {
    const wav = encodeWav(new Float32Array([0, 1, -1, 2]), 16000);
    expect(wav.byteLength).toBe(44 + 8);

    const pcm = readPcm16Mono(wav, 16000);
    expect(pcm && [...new Int16Array(pcm)]).toEqual([0, 0x7fff, -0x8000, 0x7fff]);
    expect(readPcm16Mono(wav, 44100)).toBeNull();
    expect(readPcm16Mono(new ArrayBuffer(100), 16000)).toBeNull();
});
