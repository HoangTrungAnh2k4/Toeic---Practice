import { describe, expect, it } from 'vitest';
import { PART_TEMPLATES } from '@/lib/domain/parts';
import type { Attempt } from '@/lib/domain/types';
import { findKeywordUsage, getQuestionDeadline } from './utils';

const START = Date.parse('2026-11-02T00:00:00Z');
const attemptFor = (endsAfterSec: number | null) =>
    ({
        started_at: new Date(START).toISOString(),
        ends_at: endsAfterSec === null ? null : new Date(START + endsAfterSec * 1000).toISOString(),
    }) as Attempt;
const template = (id: number) => PART_TEMPLATES.find((part) => part.id === id)!;

describe('getQuestionDeadline', () => {
    it('shares the section deadline across Part 1', () => {
        expect(getQuestionDeadline(attemptFor(480), template(6), 0)).toBe(START + 480_000);
        expect(getQuestionDeadline(attemptFor(480), template(6), 4)).toBe(START + 480_000);
    });

    it('ends each Part 2 question after its cumulative response time', () => {
        expect(getQuestionDeadline(attemptFor(1200), template(7), 0)).toBe(START + 600_000);
        expect(getQuestionDeadline(attemptFor(1200), template(7), 1)).toBe(START + 1_200_000);
    });

    it('gives the Part 3 essay its full 30 minutes', () => {
        expect(getQuestionDeadline(attemptFor(1800), template(8), 0)).toBe(START + 1_800_000);
    });

    it('never passes the server deadline', () => {
        expect(getQuestionDeadline(attemptFor(900), template(7), 1)).toBe(START + 900_000);
    });

    it('has no deadline in guided mode', () => {
        expect(getQuestionDeadline(attemptFor(null), template(7), 0)).toBeNull();
    });
});

describe('findKeywordUsage', () => {
    it('nhận từ gốc kèm hậu tố khi đề chỉ có từ gốc', () => {
        expect(findKeywordUsage('He is carrying two desks.', { word: 'carry', forms: [] })).toBe('carrying');
        expect(findKeywordUsage('Two desks are empty.', { word: 'desk', forms: [] })).toBe('desks');
        expect(findKeywordUsage('He carried a box.', { word: 'carry', forms: [] })).toBeNull();
    });

    it('nhận biến thể có sẵn trong forms và cụm nhiều từ', () => {
        expect(findKeywordUsage('He carried a box.', { word: 'carry', forms: ['carried'] })).toBe('carried');
        expect(findKeywordUsage('She sits in  front of the desk.', { word: 'in front of', forms: [] })).toBe('in  front of');
    });
});
