import { describe, expect, it } from 'vitest';
import { getScoreLevel } from './score-levels';
import type { Skill } from './types';

describe('getScoreLevel', () => {
    // Bảng Level của ETS gõ tay, không lấy từ SCORE_LEVELS: [kỹ năng, Level, điểm thấp nhất, điểm cao nhất]
    it.each<[Skill, number, number, number]>([
        ['speaking', 1, 0, 30],
        ['speaking', 2, 40, 50],
        ['speaking', 3, 60, 70],
        ['speaking', 4, 80, 100],
        ['speaking', 5, 110, 120],
        ['speaking', 6, 130, 150],
        ['speaking', 7, 160, 180],
        ['speaking', 8, 190, 200],
        ['writing', 1, 0, 30],
        ['writing', 2, 40, 40],
        ['writing', 3, 50, 60],
        ['writing', 4, 70, 80],
        ['writing', 5, 90, 100],
        ['writing', 6, 110, 130],
        ['writing', 7, 140, 160],
        ['writing', 8, 170, 190],
        ['writing', 9, 200, 200],
    ])('%s Level %i: %i–%i', (skill, level, low, high) => {
        expect(getScoreLevel(skill, low)).toBe(level);
        expect(getScoreLevel(skill, high)).toBe(level);
    });

    it('điểm ngoài thang vẫn ra Level hợp lệ', () => {
        expect(getScoreLevel('speaking', -10)).toBe(1);
        expect(getScoreLevel('writing', 250)).toBe(9);
    });
});
