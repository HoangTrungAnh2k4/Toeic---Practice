/** Envelope chung backend trả về (xem pkg/response của Toeic-backend). */
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
    /** Mã lỗi máy đọc được, chỉ có khi request thất bại (vd. INVALID_CREDENTIALS). */
    error?: string;
    errors?: ApiFieldError[];
}

export interface ApiFieldError {
    field: string;
    message: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
}
