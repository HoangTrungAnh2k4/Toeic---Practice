import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({ supabase: {} }));

import type { Attempt } from '@/lib/domain/types';
import { combineWritingScores, type AttemptDetails } from './user-stats';

// Q1–5 tối đa 3, Q6–7 tối đa 4, Q8 tối đa 5
const parts = [6, 7, 8].map((part_template_id) => ({ part_template_id }));
const questions = [1, 2, 3, 4, 5, 6, 7, 8].map((number) => ({ id: `q${number}`, number }));
const partQuestions: Record<number, number[]> = { 6: [1, 2, 3, 4, 5], 7: [6, 7], 8: [8] };
const maxOf = (number: number) => (number <= 5 ? 3 : number <= 7 ? 4 : 5);

function scoredPart(id: string, part: number, scoredAt: string, full: boolean) {
    const attempt = { id, exam_id: 'exam', part_template_id: part, scored_at: scoredAt } as Attempt;
    const responses = partQuestions[part].map((number) => ({
        question_id: `q${number}`,
        score: full ? maxOf(number) : 0,
        feedback: null,
    }));
    return [attempt, { responses, parts, questions } as unknown as AttemptDetails] as const;
}

describe('combineWritingScores', () => {
    it('scores the whole test only once every part has a scored attempt, using the latest of each part', () => {
        const rows = [
            scoredPart('p1', 6, '2026-10-01T00:00:00Z', true),
            scoredPart('p2', 7, '2026-10-02T00:00:00Z', true),
            scoredPart('p3', 8, '2026-10-03T00:00:00Z', true),
            scoredPart('p1-redo', 6, '2026-10-04T00:00:00Z', false),
        ];
        const details = new Map(rows.map(([attempt, detail]) => [attempt.id, detail]));
        // Thứ tự đầu vào ngược để chắc hàm tự sắp theo scored_at
        const scores = combineWritingScores(rows.map(([attempt]) => attempt).reverse(), details);

        expect(scores.map((item) => item.attempt_id)).toEqual(['p3', 'p1-redo']);
        expect(scores[0].score).toBe(200);
        expect(scores[1].score).toBeLessThan(200);
    });

    it('returns nothing while a part is missing', () => {
        const rows = [scoredPart('p1', 6, '2026-10-01T00:00:00Z', true), scoredPart('p2', 7, '2026-10-02T00:00:00Z', true)];
        const details = new Map(rows.map(([attempt, detail]) => [attempt.id, detail]));

        expect(combineWritingScores(rows.map(([attempt]) => attempt), details)).toEqual([]);
    });
});
