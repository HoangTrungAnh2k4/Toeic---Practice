export interface CurrentUser {
    name: string;
    /** Chữ hiển thị trong avatar khi chưa có ảnh. */
    initials: string;
    email: string;
    avatarUrl?: string;
    role: string;
    isAdmin: boolean;
    joinedAt: string;
}

/** Một điểm trên biểu đồ xu hướng: mỗi lượt làm cả đề chỉ có điểm của kỹ năng của đề. */
export interface ScorePoint {
    label: string;
    speaking?: number;
    writing?: number;
}

