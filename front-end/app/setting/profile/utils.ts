import { toDayKey, UserStats } from '@/lib/data/user-stats';
import type { Skill } from '@/lib/domain/types';
import { ScorePoint, StudyDay } from './types';

/** Class dùng chung cho mọi thẻ trên trang hồ sơ. */
export const PROFILE_CARD_CLASS =
    'gap-0 bg-card shadow-sm hover:shadow-md py-0 border border-sub2/30 ring-0 text-main transition-shadow';

/** Thang điểm tối đa của mỗi kỹ năng TOEIC Speaking & Writing. */
export const MAX_SKILL_SCORE = 200;

/** Màu thanh theo kỹ năng: Speaking = main, Writing = sub2 (đồng bộ vạch nhấn của card). */
export const SKILL_BAR_CLASS: Record<Skill, string> = {
    speaking: 'bg-main',
    writing: 'bg-sub2',
};

/** Một Part được coi là điểm mạnh khi đạt từ ngưỡng này trở lên. */
export const STRONG_PART_RATIO = 0.7;

/** Số bài làm cả đề gần nhất hiện trên biểu đồ xu hướng. */
const TREND_LENGTH = 8;

const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** Số ngày còn lại tới ngày `YYYY-MM-DD`; âm nếu đã qua. */
export function getDaysUntil(date: string, now: Date = new Date()): number {
    const target = new Date(`${date}T00:00:00`);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** 460 → "7 giờ 40 phút". */
export function formatDuration(totalMinutes: number): { value: string; unit: string } {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return { value: String(minutes), unit: 'phút' };
    return { value: String(hours), unit: minutes ? `giờ ${minutes} phút` : 'giờ' };
}

/** Các bài làm cả đề gần nhất, cũ → mới, nhãn theo ngày chấm. */
export function getScoreTrend(stats: UserStats): ScorePoint[] {
    return stats.fullTestScores.slice(-TREND_LENGTH).map(({ skill, score, scored_at }) => {
        const date = new Date(scored_at);
        return { label: `${date.getDate()}/${date.getMonth() + 1}`, [skill]: score };
    });
}

/** Mức tăng điểm trung bình mỗi bài làm cả đề, gộp các kỹ năng có ít nhất 2 bài. */
export function getAverageGain(stats: UserStats): number {
    const gains = (['speaking', 'writing'] as const).flatMap((skill) => {
        const scores = stats.fullTestScores.filter((item) => item.skill === skill).map((item) => item.score);
        return scores.length < 2 ? [] : [(scores[scores.length - 1] - scores[0]) / (scores.length - 1)];
    });
    return gains.length ? Math.round(gains.reduce((sum, gain) => sum + gain, 0) / gains.length) : 0;
}

/** Số phút học 7 ngày gần nhất, cũ → mới. */
export function getRecentStudyDays(stats: UserStats, now: Date = new Date()): StudyDay[] {
    return Array.from({ length: 7 }, (_, index) => {
        const offset = 6 - index;
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
        const key = toDayKey(date);
        return {
            id: key,
            label: offset === 0 ? 'Nay' : WEEKDAY[date.getDay()],
            minutes: stats.minutesByDay[key] ?? 0,
            isToday: offset === 0,
        };
    });
}

export function toPercent(value: number, max: number): number {
    if (max <= 0) return 0;
    return Math.min(100, Math.max(0, (value / max) * 100));
}
