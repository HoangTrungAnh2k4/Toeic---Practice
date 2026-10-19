import { describe, expect, it } from 'vitest';
import { summarizeWriting } from './scale';
import { locateAnnotations, parseWritingGrade } from './writing';

const annotation = (quote: string) => ({
    quote,
    correction: 'x',
    explanation: 'Sai.',
    criterion: 'grammar' as const,
    severity: 'low' as const,
});

describe('parseWritingGrade', () => {
    const json = (value: object) => '```json\n' + JSON.stringify(value) + '\n```';

    it('accepts a grade within the question scale and rounds half points', () => {
        const grade = parseWritingGrade(json({ score: 2.5, feedback: 'Tốt.', annotations: [annotation('He go')] }), 3);
        expect(grade?.score).toBe(3);
        expect(grade?.annotations).toHaveLength(1);
    });

    it('defaults missing annotations to none', () => {
        expect(parseWritingGrade(json({ score: 4, feedback: 'Tốt.' }), 4)?.annotations).toEqual([]);
    });

    it('rejects scores above the scale, unknown criteria and broken JSON', () => {
        expect(parseWritingGrade(json({ score: 4, feedback: 'Tốt.' }), 3)).toBeNull();
        expect(
            parseWritingGrade(json({ score: 1, feedback: 'Tốt.', annotations: [{ ...annotation('a'), criterion: 'pronunciation' }] }), 3),
        ).toBeNull();
        expect(parseWritingGrade('{"score": 1,', 3)).toBeNull();
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
