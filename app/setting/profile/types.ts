import type { IconType } from 'react-icons';

export type ProfileSkill = 'speaking' | 'writing';

export interface CurrentUser {
    name: string;
    /** Chữ hiển thị trong avatar khi chưa có ảnh. */
    initials: string;
    email: string;
    avatarUrl?: string;
    role: string;
    joinedAt: string;
}

export interface ProfileField {
    id: string;
    label: string;
    value: string;
    hint?: string;
    Icon: IconType;
}

/** Một ô chỉ số trong hàng KPI. */
export interface ProfileStat {
    id: string;
    label: string;
    value: string;
    unit?: string;
    hint: string;
    Icon: IconType;
}

/** Điểm của một bài thi thử, dùng cho biểu đồ xu hướng. */
export interface ScorePoint {
    label: string;
    speaking: number;
    writing: number;
}

/** Số phút học trong một ngày. */
export interface StudyDay {
    id: string;
    label: string;
    minutes: number;
    isToday?: boolean;
}

/** Điểm trung bình của một Part theo thang ETS. */
export interface PartScore {
    id: string;
    skill: ProfileSkill;
    part: string;
    name: string;
    score: number;
    max: number;
}

export interface StudyPreference {
    preferredTime: string;
    reminder: string;
}
