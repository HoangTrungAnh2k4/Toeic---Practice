/** WAV PCM 16-bit mono: định dạng Azure Speech nhận (16 kHz). */

const HEADER_BYTES = 44;

export function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(HEADER_BYTES + samples.length * 2);
    const view = new DataView(buffer);
    const writeText = (offset: number, text: string) =>
        [...text].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));

    writeText(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeText(8, 'WAVE');
    writeText(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeText(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    samples.forEach((sample, i) => {
        const clamped = Math.max(-1, Math.min(1, sample));
        view.setInt16(HEADER_BYTES + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    });
    return buffer;
}

/** Phần dữ liệu PCM của file WAV dạng `encodeWav` tạo ra; `null` khi không đúng PCM 16-bit mono `sampleRate`. */
export function readPcm16Mono(buffer: ArrayBuffer, sampleRate: number): ArrayBuffer | null {
    if (buffer.byteLength <= HEADER_BYTES) return null;
    const view = new DataView(buffer);
    const text = (offset: number) => String.fromCharCode(...new Uint8Array(buffer, offset, 4));
    const dataBytes = view.getUint32(40, true);
    const valid =
        text(0) === 'RIFF' &&
        text(8) === 'WAVE' &&
        text(12) === 'fmt ' &&
        view.getUint16(20, true) === 1 &&
        view.getUint16(22, true) === 1 &&
        view.getUint32(24, true) === sampleRate &&
        view.getUint16(34, true) === 16 &&
        text(36) === 'data' &&
        dataBytes <= buffer.byteLength - HEADER_BYTES;
    return valid ? buffer.slice(HEADER_BYTES, HEADER_BYTES + dataBytes) : null;
}

/** Trình duyệt: giải mã bản ghi (WebM/Ogg/MP4) rồi resample về WAV 16 kHz mono. */
export async function toWav16k(audio: Blob): Promise<Blob> {
    const context = new AudioContext();
    let decoded: AudioBuffer;
    try {
        decoded = await context.decodeAudioData(await audio.arrayBuffer());
    } finally {
        void context.close();
    }
    const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(decoded.duration * 16000)), 16000);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return new Blob([encodeWav(rendered.getChannelData(0), 16000)], { type: 'audio/wav' });
}
