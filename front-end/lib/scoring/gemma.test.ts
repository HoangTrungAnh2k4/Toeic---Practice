import { afterEach, describe, expect, test, vi } from 'vitest';
import { ProviderQuotaError } from './errors';
import { FALLBACK_MODEL, GEMMA_MODEL, gradeAnswer, type GradeInput } from './gemma';

const input: GradeInput = {
    questionNumber: 5,
    task: 'Respond to questions',
    prompt: 'How often do you work from home?',
    context: null,
    image: null,
    imageAlt: null,
    transcript: 'Two days a week.',
    fluency: { words: 4, words_per_minute: 120, long_pauses: 0, silence_ratio: 0.1, response_delay_sec: 0 },
};
const grade = { fluency: 6, vocabulary: 6, grammar: 6, task_response: 7, feedback: 'Tốt.' };
const ok = () => Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(grade) }] } }] });

function mockFetch(...responses: (() => Response)[]) {
    const fetch = vi.fn();
    for (const response of responses) fetch.mockImplementationOnce(async () => response());
    vi.stubGlobal('fetch', fetch);
    vi.stubEnv('GEMINI_API_KEY', 'test');
    return fetch;
}
const calledModel = (fetch: ReturnType<typeof vi.fn>, index: number) => String(fetch.mock.calls[index][0]);

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe('gradeAnswer', () => {
    test('Gemma chấm được thì không gọi model dự phòng', async () => {
        const fetch = mockFetch(ok);
        expect(await gradeAnswer(input)).toEqual({ ...grade, model: GEMMA_MODEL });
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('Gemma 500 → chuyển model dự phòng', async () => {
        const fetch = mockFetch(() => new Response('', { status: 500 }), ok);
        expect(await gradeAnswer(input)).toEqual({ ...grade, model: FALLBACK_MODEL });
        expect(calledModel(fetch, 1)).toContain(FALLBACK_MODEL);
    });

    test('Gemma sai schema → chuyển model dự phòng', async () => {
        const invalid = () => Response.json({ candidates: [{ content: { parts: [{ text: '{"fluency": 12}' }] } }] });
        mockFetch(invalid, ok);
        expect((await gradeAnswer(input)).model).toBe(FALLBACK_MODEL);
    });

    test('mọi lượt 429 → ProviderQuotaError; lỗi khác → Error', async () => {
        const limited = () => new Response('', { status: 429 });
        mockFetch(limited, limited, limited);
        await expect(gradeAnswer(input)).rejects.toBeInstanceOf(ProviderQuotaError);

        mockFetch(limited, () => new Response('', { status: 500 }), limited);
        await expect(gradeAnswer(input)).rejects.not.toBeInstanceOf(ProviderQuotaError);
    });

    test('429 kèm lý do vẫn là ProviderQuotaError; lỗi 400 ghi lý do của Google', async () => {
        const limited = () => Response.json({ error: { message: 'Quota exceeded' } }, { status: 429 });
        mockFetch(limited, limited, limited);
        await expect(gradeAnswer(input)).rejects.toBeInstanceOf(ProviderQuotaError);

        const badKey = () => Response.json({ error: { message: 'API key not valid' } }, { status: 400 });
        mockFetch(badKey, badKey, badKey);
        await expect(gradeAnswer(input)).rejects.toThrow('400 API key not valid');
    });
});
