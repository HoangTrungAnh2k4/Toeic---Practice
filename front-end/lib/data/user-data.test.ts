import { beforeEach, describe, expect, it, vi } from 'vitest';

const { from, getSession } = vi.hoisted(() => ({ from: vi.fn(), getSession: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from, auth: { getSession } } }));

import { getAttempt, listAnnotations, listResponses, saveResponse, scoreWritingAttempt, startAttempt, updateAttempt } from './user-data';

const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
});

describe('guest attempt after signing in elsewhere', () => {
    beforeEach(() => {
        store.clear();
        from.mockReset();
        getSession.mockResolvedValue({ data: { session: null } });
    });

    it('keeps saving the guest attempt in localStorage', async () => {
        const attempt = await startAttempt({ exam_id: 'exam', part_template_id: 6, mode: 'cbt', duration_sec: 480 });
        // Đăng nhập ở tab khác: phiên dùng chung nên lượt gọi sau đã có user
        getSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } });

        await saveResponse(attempt.id, 'q1', { text_answer: 'hello' });

        expect(from).not.toHaveBeenCalled();
        expect((await listResponses(attempt.id)).map((row) => row.text_answer)).toEqual(['hello']);
    });
});

describe('scoreWritingAttempt for a guest', () => {
    const questions = [
        { id: 'q6', number: 6 },
        { id: 'q7', number: 7 },
    ];
    const result = (score: number) => ({
        score,
        max_score: 4,
        feedback: 'Ổn.',
        metrics: { words: 3 },
        scoring_model: 'm',
        annotations: [{ quote: 'I goes', correction: 'I go', explanation: 'Sai.', criterion: 'grammar', severity: 'high', mistake_pattern_id: 'p1', start_offset: 0, end_offset: 6 }],
    });

    beforeEach(() => {
        store.clear();
        getSession.mockResolvedValue({ data: { session: null } });
    });

    async function submittedAttempt() {
        const attempt = await startAttempt({ exam_id: 'exam', part_template_id: 7, mode: 'cbt', duration_sec: 1200 });
        await saveResponse(attempt.id, 'q6', { text_answer: 'I goes home' });
        await updateAttempt(attempt.id, { status: 'submitted' });
        return attempt;
    }

    it('stores scores and annotations locally, then totals the part', async () => {
        const attempt = await submittedAttempt();
        const fetch = vi.fn(async () =>
            Response.json({ outcomes: [{ questionId: 'q6', result: result(4) }, { questionId: 'q7', result: { ...result(0), annotations: [] } }] }),
        );
        vi.stubGlobal('fetch', fetch);

        await scoreWritingAttempt(attempt, questions);

        const sent = JSON.parse((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
        expect(sent.answers).toEqual([
            { questionId: 'q6', text: 'I goes home' },
            { questionId: 'q7', text: '' },
        ]);
        const responses = await listResponses(attempt.id);
        expect(responses.map((row) => row.score)).toEqual([4, 0]);
        expect(await listAnnotations(responses.map((row) => row.id))).toEqual([expect.objectContaining({ mistake_pattern_id: 'p1' })]);
        expect(await getAttempt(attempt.id)).toMatchObject({ status: 'scored', score: 100, scoring_error: null });
    });

    it('keeps the attempt rescorable when the daily limit is hit', async () => {
        const attempt = await submittedAttempt();
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json({ outcomes: [{ questionId: 'q6', error: 'daily_limit' }] }, { status: 429 })),
        );

        await scoreWritingAttempt(attempt, questions);

        expect(await getAttempt(attempt.id)).toMatchObject({ status: 'submitted', scoring_error: expect.stringContaining('Hết lượt') });
    });
});
