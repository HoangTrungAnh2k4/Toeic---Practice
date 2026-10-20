import { describe, expect, it } from 'vitest';
import { getScoreLevel, SCORE_LEVELS } from './score-levels';

describe('getScoreLevel', () => {
    it('lấy đúng Level tại mọi mốc và ngay dưới mốc', () => {
        for (const { skill, min_score, level } of SCORE_LEVELS) {
            expect(getScoreLevel(skill, min_score)).toBe(level);
            if (min_score > 0) expect(getScoreLevel(skill, min_score - 10)).toBe(level - 1);
        }
    });

    it('Speaking tối đa Level 8, Writing tối đa Level 9', () => {
        expect(getScoreLevel('speaking', 200)).toBe(8);
        expect(getScoreLevel('writing', 200)).toBe(9);
        expect(getScoreLevel('writing', 190)).toBe(8);
    });

    it('điểm ngoài thang vẫn ra Level hợp lệ', () => {
        expect(getScoreLevel('speaking', -10)).toBe(1);
        expect(getScoreLevel('writing', 250)).toBe(9);
    });

    it('mốc mỗi kỹ năng tăng dần, Level liên tiếp từ 1', () => {
        for (const skill of ['speaking', 'writing'] as const) {
            const rows = SCORE_LEVELS.filter((row) => row.skill === skill);
            rows.forEach((row, index) => {
                expect(row.level).toBe(index + 1);
                if (index > 0) expect(row.min_score).toBeGreaterThan(rows[index - 1].min_score);
            });
        }
    });
});
