import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ProviderQuotaError } from './errors';
import { transcribe, WHISPER_MODELS } from './groq';

const [ACCURATE, TURBO] = WHISPER_MODELS;
const ok = () =>
    Response.json({ text: ' Hi.', duration: 5, segments: [{ start: 1, end: 2, text: ' Hi.', no_speech_prob: 0.01 }] });
const limited = () => new Response('', { status: 429, headers: { 'retry-after': '30' } });
const audio = new Blob(['x'], { type: 'audio/webm' });

function mockFetch(...responses: (() => Response)[]) {
    const fetch = vi.fn();
    for (const response of responses) fetch.mockImplementationOnce(async () => response());
    vi.stubGlobal('fetch', fetch);
    vi.stubEnv('GROQ_API_KEY', 'test');
    return fetch;
}

// Mỗi test lùi đồng hồ một ngày để cooldown 429 của test trước hết hạn
let now = Date.UTC(2026, 0, 1);
beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime((now += 86_400_000));
});
afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

test('Whisper chính xác 429 → turbo chép, lần sau bỏ qua model đang cooldown', async () => {
    mockFetch(limited, ok);
    expect(await transcribe(audio)).toMatchObject({ transcript: 'Hi.', model: TURBO });

    const fetch = mockFetch(ok);
    expect((await transcribe(audio)).model).toBe(TURBO);
    expect(fetch).toHaveBeenCalledTimes(1);

    vi.setSystemTime(Date.now() + 31_000);
    mockFetch(ok);
    expect((await transcribe(audio)).model).toBe(ACCURATE);
});

test('mọi model 429 → ProviderQuotaError; lỗi khác → Error', async () => {
    mockFetch(limited, limited);
    await expect(transcribe(audio)).rejects.toBeInstanceOf(ProviderQuotaError);

    vi.setSystemTime(Date.now() + 86_400_000);
    mockFetch(() => new Response('', { status: 500 }), limited);
    await expect(transcribe(audio)).rejects.toThrow('Groq transcription failed');
});
