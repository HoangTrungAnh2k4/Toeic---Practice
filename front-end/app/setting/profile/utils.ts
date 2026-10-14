import { LuCalendarDays, LuMail, LuUserRound } from 'react-icons/lu';
import { CurrentUser, PartScore, ProfileField, ProfileSkill, ScorePoint, StudyDay, StudyPreference } from './types';

/**
 * Người dùng đang đăng nhập, dùng chung cho sidebar và trang hồ sơ.
 * TODO: thay bằng session thật khi có hệ thống đăng nhập.
 */
export const CURRENT_USER: CurrentUser = {
    name: 'Nguyễn Minh Thư',
    initials: 'MT',
    email: 'minhthu@example.com',
    role: 'Học viên',
    joinedAt: '02/03/2026',
};

/** Class dùng chung cho mọi thẻ trên trang hồ sơ. */
export const PROFILE_CARD_CLASS =
    'gap-0 bg-card shadow-sm hover:shadow-md py-0 border border-sub2/30 ring-0 text-main transition-shadow';

/** Thang điểm tối đa của mỗi kỹ năng TOEIC Speaking & Writing. */
export const MAX_SKILL_SCORE = 200;

/** Màu thanh theo kỹ năng: Speaking = main, Writing = sub2 (đồng bộ vạch nhấn của card). */
export const SKILL_BAR_CLASS: Record<ProfileSkill, string> = {
    speaking: 'bg-main',
    writing: 'bg-sub2',
};

/** Một Part được coi là điểm mạnh khi đạt từ ngưỡng này trở lên. */
export const STRONG_PART_RATIO = 0.7;

// TODO: các số liệu dưới đây là dữ liệu mẫu, thay bằng API thống kê học tập khi có.

/** Chuỗi ngày học dài nhất từ trước đến nay. */
export const BEST_STREAK_DAYS = 18;

/** Tổng số phút luyện trong tháng hiện tại. */
export const MONTHLY_STUDY_MINUTES = 460;

/** Điểm 6 bài thi thử gần nhất, cũ → mới; bài cuối khớp điểm hiện tại ở SKILL_PROGRESS. */
export const SCORE_HISTORY: ScorePoint[] = [
    { label: 'Bài 1', speaking: 110, writing: 120 },
    { label: 'Bài 2', speaking: 120, writing: 130 },
    { label: 'Bài 3', speaking: 120, writing: 135 },
    { label: 'Bài 4', speaking: 130, writing: 140 },
    { label: 'Bài 5', speaking: 130, writing: 140 },
    { label: 'Bài 6', speaking: 135, writing: 145 },
];

/** Số bài luyện đã hoàn thành theo kỹ năng. */
export const COMPLETED_EXERCISES: Record<ProfileSkill, number> = {
    speaking: 52,
    writing: 34,
};

/** Số phút học 7 ngày gần nhất, cũ → mới. */
export const RECENT_STUDY_DAYS: StudyDay[] = [
    { id: 'd-6', label: 'T4', minutes: 50 },
    { id: 'd-5', label: 'T5', minutes: 45 },
    { id: 'd-4', label: 'T6', minutes: 20 },
    { id: 'd-3', label: 'T7', minutes: 15 },
    { id: 'd-2', label: 'CN', minutes: 60 },
    { id: 'd-1', label: 'T2', minutes: 45 },
    { id: 'd-0', label: 'Nay', minutes: 50, isToday: true },
];

export const STUDY_PREFERENCE: StudyPreference = {
    preferredTime: '20:00 – 21:00',
    reminder: 'Bật · 19:45',
};

/** Điểm trung bình từng Part theo thang ETS (Speaking 0–3 / 0–5, Writing 0–4 / 0–5). */
export const PART_SCORES: PartScore[] = [
    { id: 's1', skill: 'speaking', part: 'Part 1', name: 'Đọc to đoạn văn', score: 2.6, max: 3 },
    { id: 's2', skill: 'speaking', part: 'Part 2', name: 'Mô tả tranh', score: 2.4, max: 3 },
    { id: 's3', skill: 'speaking', part: 'Part 3', name: 'Trả lời câu hỏi', score: 2.1, max: 3 },
    { id: 's4', skill: 'speaking', part: 'Part 4', name: 'Trả lời theo thông tin', score: 1.8, max: 3 },
    { id: 's5', skill: 'speaking', part: 'Part 5', name: 'Bày tỏ ý kiến', score: 3.1, max: 5 },
    { id: 'w1', skill: 'writing', part: 'Part 1', name: 'Viết câu theo tranh', score: 2.6, max: 3 },
    { id: 'w2', skill: 'writing', part: 'Part 2', name: 'Phản hồi email', score: 2.6, max: 4 },
    { id: 'w3', skill: 'writing', part: 'Part 3', name: 'Bài luận nêu ý kiến', score: 3.2, max: 5 },
];

/** Thông tin tài khoản hiển thị ở cuối trang. */
export const ACCOUNT_FIELDS: ProfileField[] = [
    { id: 'email', label: 'Email đăng nhập', value: CURRENT_USER.email, Icon: LuMail },
    { id: 'role', label: 'Vai trò', value: CURRENT_USER.role, Icon: LuUserRound },
    { id: 'joined', label: 'Ngày tham gia', value: CURRENT_USER.joinedAt, Icon: LuCalendarDays },
];

/** Đổi chuỗi `dd/mm/yyyy` thành Date (giờ địa phương), trả về null nếu sai định dạng. */
export function parseVnDate(value: string): Date | null {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
    if (!match) return null;
    const [, day, month, year] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 ? date : null;
}

/** Số ngày còn lại tới một ngày `dd/mm/yyyy`; âm nếu đã qua, null nếu sai định dạng. */
export function getDaysUntil(value: string, now: Date = new Date()): number | null {
    const target = parseVnDate(value);
    if (!target) return null;
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

/** Mức tăng điểm trung bình mỗi bài thi thử, tính gộp hai kỹ năng. */
export function getAverageGain(history: ScorePoint[]): number {
    if (history.length < 2) return 0;
    const first = history[0];
    const last = history[history.length - 1];
    const gain = (last.speaking - first.speaking + (last.writing - first.writing)) / 2;
    return Math.round(gain / (history.length - 1));
}

export function toPercent(value: number, max: number): number {
    if (max <= 0) return 0;
    return Math.min(100, Math.max(0, (value / max) * 100));
}
