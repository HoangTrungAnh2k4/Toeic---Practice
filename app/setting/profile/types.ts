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
