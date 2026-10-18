import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ProviderQuotaError } from './errors';
import { gradeAnswer, MODELS, type GradeInput } from './grade';

const [STRONG, VISION, SMALL] = MODELS.map(({ model }) => model);
const input: GradeInput = {
    questionNumber: 5,
    task: 'Respond to questions',
    prompt: 'How often do you work from home?',
    context: null,
    imageAlt: null,
    transcript: 'Two days a week.',
    fluency: { words: 4, words_per_minute: 120, long_pauses: 0, silence_ratio: 0.1, response_delay_sec: 0 },
};
const grade = { fluency: 6, vocabulary: 6, grammar: 6, task_response: 7, feedback: 'Tốt.' };
const ok = () => Response.json({ choices: [{ message: { content: JSON.stringify(grade) } }] });
const limited = () => new Response('', { status: 429, headers: { 'retry-after': '30' } });

function mockFetch(...responses: (() => Response)[]) {
    const fetch = vi.fn();
    for (const response of responses) fetch.mockImplementationOnce(async () => response());
    vi.stubGlobal('fetch', fetch);
    vi.stubEnv('GROQ_API_KEY', 'test');
    return fetch;
}
const calledModel = (fetch: ReturnType<typeof vi.fn>, index: number) => JSON.parse(fetch.mock.calls[index][1].body).model;

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

describe('gradeAnswer', () => {
    test('model mạnh nhất chấm được thì không gọi model khác', async () => {
        const fetch = mockFetch(ok);
        expect(await gradeAnswer(input)).toEqual({ ...grade, model: STRONG });
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('429 / 500 / sai schema → chuyển model kế theo thứ tự', async () => {
        const invalid = () => Response.json({ choices: [{ message: { content: '{"fluency": 12}' } }] });
        const fetch = mockFetch(limited, invalid, ok);
        expect((await gradeAnswer(input)).model).toBe(SMALL);
        expect([0, 1, 2].map((i) => calledModel(fetch, i))).toEqual([STRONG, VISION, SMALL]);
    });

    test('model vừa 429 bị bỏ qua tới hết retry-after', async () => {
        mockFetch(limited, ok);
        await gradeAnswer(input);

        const fetch = mockFetch(ok);
        expect((await gradeAnswer(input)).model).toBe(VISION);
        expect(fetch).toHaveBeenCalledTimes(1);

        vi.setSystemTime(Date.now() + 31_000);
        const later = mockFetch(ok);
        expect((await gradeAnswer(input)).model).toBe(STRONG);
        expect(later).toHaveBeenCalledTimes(1);
    });

    test('Part 2 gửi mô tả ảnh dạng text, không gửi ảnh', async () => {
        const fetch = mockFetch(ok);
        await gradeAnswer({ ...input, imageAlt: 'A man at a desk' });
        const { content } = JSON.parse(fetch.mock.calls[0][1].body).messages[0];
        expect(content).toContain('A man at a desk');
        expect(content).toContain('do not penalize details it does not mention');
    });

    test('mọi model 429 → ProviderQuotaError; lỗi khác → Error kèm lý do', async () => {
        mockFetch(limited, limited, limited);
        await expect(gradeAnswer(input)).rejects.toBeInstanceOf(ProviderQuotaError);

        vi.setSystemTime(Date.now() + 86_400_000);
        mockFetch(limited, () => new Response('', { status: 500 }), limited);
        await expect(gradeAnswer(input)).rejects.not.toBeInstanceOf(ProviderQuotaError);

        vi.setSystemTime(Date.now() + 86_400_000);
        const badKey = () => Response.json({ error: { message: 'Invalid API Key' } }, { status: 401 });
        mockFetch(badKey, badKey, badKey);
        await expect(gradeAnswer(input)).rejects.toThrow('401 Invalid API Key');
    });
});
