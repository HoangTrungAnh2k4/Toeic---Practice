import { beforeEach, describe, expect, it, vi } from 'vitest';

const { from, getSession } = vi.hoisted(() => ({ from: vi.fn(), getSession: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { from, auth: { getSession } } }));

import { listResponses, saveResponse, startAttempt } from './user-data';

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
