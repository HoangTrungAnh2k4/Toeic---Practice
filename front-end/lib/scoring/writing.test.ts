import { describe, expect, it } from 'vitest';
import { canRescore, summarizeWriting } from './scale';
import { locateAnnotations, parseWritingGrade, writingPatternsFor } from './writing';
import type { MistakePattern } from '@/lib/domain/types';

const annotation = (quote: string) => ({
    quote,
    correction: 'x',
    explanation: 'Sai.',
    criterion: 'grammar' as const,
    severity: 'low' as const,
    mistake_pattern_id: null,
});

describe('parseWritingGrade', () => {
    const json = (value: object) => '```json\n' + JSON.stringify(value) + '\n```';

    it('accepts a grade within the question scale and rounds half points', () => {
        const grade = parseWritingGrade(json({ score: 2.5, feedback: 'Tốt.', annotations: [annotation('He go')] }), 3, []);
        expect(grade?.score).toBe(3);
        expect(grade?.annotations).toHaveLength(1);
    });

    it('defaults missing annotations to none', () => {
        expect(parseWritingGrade(json({ score: 4, feedback: 'Tốt.' }), 4, [])?.annotations).toEqual([]);
    });

    it('rejects scores above the scale, unknown criteria and broken JSON', () => {
        expect(parseWritingGrade(json({ score: 4, feedback: 'Tốt.' }), 3, [])).toBeNull();
        expect(
            parseWritingGrade(json({ score: 1, feedback: 'Tốt.', annotations: [{ ...annotation('a'), criterion: 'pronunciation' }] }), 3, []),
        ).toBeNull();
        expect(parseWritingGrade('{"score": 1,', 3, [])).toBeNull();
    });

    it('maps the pattern number to its uuid and keeps unmatched annotations without one', () => {
        const patterns = [1, null, 3, 0, 1.5, '1', undefined].map((pattern) => ({ ...annotation('a'), pattern }));
        const grade = parseWritingGrade(json({ score: 1, feedback: 'Tốt.', annotations: patterns }), 3, ['uuid-1', 'uuid-2']);
        expect(grade?.annotations.map((a) => a.mistake_pattern_id)).toEqual(['uuid-1', null, null, null, null, null, null]);
    });
});

describe('writingPatternsFor', () => {
    const pattern = (id: string, skill: MistakePattern['skill'], part_template_id: number | null) =>
        ({ id, skill, part_template_id }) as MistakePattern;

    it('keeps only Writing patterns of the part plus shared Writing patterns', () => {
        const patterns = [
            pattern('part', 'writing', 7),
            pattern('other-part', 'writing', 8),
            pattern('shared', 'writing', null),
            pattern('speaking', 'speaking', null),
        ];
        expect(writingPatternsFor(patterns, 7).map((p) => p.id)).toEqual(['part', 'shared']);
    });
});

describe('locateAnnotations', () => {
    it('finds each quote at its first free occurrence', () => {
        const answer = 'He go to work. He go home.';
        expect(locateAnnotations(answer, [annotation('He go'), annotation('He go')]).map((a) => a.start_offset)).toEqual([0, 15]);
    });

    it('drops quotes that are not in the answer and keeps special characters literal', () => {
        const located = locateAnnotations('Cost is $5 (approx.)', [annotation('missing'), annotation('$5 (approx.)')]);
        expect(located).toHaveLength(1);
        expect(located[0]).toMatchObject({ start_offset: 8, end_offset: 20 });
    });
});

describe('summarizeWriting', () => {
    const q = (id: string, number: number) => ({ id, number });

    it('scales one part and the whole test linearly to 0–200', () => {
        const part1 = [1, 2, 3, 4, 5].map((n) => q(`q${n}`, n));
        const all = [...part1, q('q6', 6), q('q7', 7), q('q8', 8)];
        const full = all.map(({ id }) => ({ question_id: id, score: id === 'q8' ? 5 : id <= 'q5' ? 3 : 4, feedback: null }));
        expect(summarizeWriting(part1, full).score).toBe(200);
        expect(summarizeWriting(all, full)).toMatchObject({ score: 200, scoringError: null });
    });

    it('counts unscored questions as 0 and reports them', () => {
        const summary = summarizeWriting([q('q8', 8)], []);
        expect(summary.score).toBe(0);
        expect(summary.scoringError).toContain('1 câu chưa có điểm');
    });
});

describe('canRescore', () => {
    const NOW = Date.parse('2026-11-02T00:10:00Z');
    const ago = (ms: number) => new Date(NOW - ms).toISOString();
    const attempt = (patch: Partial<Parameters<typeof canRescore>[0]>) => ({
        status: 'submitted' as const,
        scoring_error: null,
        scoring_started_at: null,
        submitted_at: ago(1000),
        ...patch,
    });

    // Mốc stale theo spec là 2 phút, gõ tay thay vì import SCORING_STALE_MS
    const STALE_MS = 120_000;

    it('waits while a fresh submission or scoring run is in flight', () => {
        expect(canRescore(attempt({ submitted_at: ago(STALE_MS - 1) }), NOW)).toBe(false);
        expect(canRescore(attempt({ status: 'scoring', scoring_started_at: ago(STALE_MS - 1) }), NOW)).toBe(false);
    });

    it('allows rescoring after an error or once a run is stale', () => {
        expect(canRescore(attempt({ scoring_error: 'Lỗi' }), NOW)).toBe(true);
        expect(canRescore(attempt({ submitted_at: ago(STALE_MS) }), NOW)).toBe(true);
        expect(canRescore(attempt({ status: 'scoring', scoring_started_at: ago(STALE_MS) }), NOW)).toBe(true);
    });

    it('never rescores attempts that are scored or still open', () => {
        expect(canRescore(attempt({ status: 'scored' }), NOW)).toBe(false);
        expect(canRescore(attempt({ status: 'in_progress', scoring_error: 'x' }), NOW)).toBe(false);
    });
});
