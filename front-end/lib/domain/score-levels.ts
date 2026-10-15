import type { ScoreLevel, Skill } from './types';

/** Quy đổi điểm thang 0-200 ra Level theo bảng mô tả năng lực của ETS: Speaking 8 Level, Writing 9 Level. */
export const SCORE_LEVELS: ScoreLevel[] = [
    { skill: 'speaking', min_score: 0, level: 1 },
    { skill: 'speaking', min_score: 40, level: 2 },
    { skill: 'speaking', min_score: 60, level: 3 },
    { skill: 'speaking', min_score: 80, level: 4 },
    { skill: 'speaking', min_score: 110, level: 5 },
    { skill: 'speaking', min_score: 130, level: 6 },
    { skill: 'speaking', min_score: 160, level: 7 },
    { skill: 'speaking', min_score: 190, level: 8 },
    { skill: 'writing', min_score: 0, level: 1 },
    { skill: 'writing', min_score: 40, level: 2 },
    { skill: 'writing', min_score: 50, level: 3 },
    { skill: 'writing', min_score: 70, level: 4 },
    { skill: 'writing', min_score: 90, level: 5 },
    { skill: 'writing', min_score: 110, level: 6 },
    { skill: 'writing', min_score: 140, level: 7 },
    { skill: 'writing', min_score: 170, level: 8 },
    { skill: 'writing', min_score: 200, level: 9 },
];

/** Level tương ứng với điểm: mức cao nhất có `min_score` ≤ điểm. */
export function getScoreLevel(skill: Skill, score: number): number {
    return SCORE_LEVELS.filter((row) => row.skill === skill && row.min_score <= score).reduce(
        (level, row) => Math.max(level, row.level),
        1,
    );
}
