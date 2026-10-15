import type { IconType } from 'react-icons';

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

/** Một điểm trên biểu đồ xu hướng: mỗi lượt làm cả đề chỉ có điểm của kỹ năng của đề. */
export interface ScorePoint {
    label: string;
    speaking?: number;
    writing?: number;
}

/** Số phút học trong một ngày. */
export interface StudyDay {
    id: string;
    label: string;
    minutes: number;
    isToday?: boolean;
}
