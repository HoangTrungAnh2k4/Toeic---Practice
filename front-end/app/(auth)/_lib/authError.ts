import type { AuthError } from '@supabase/supabase-js';

const MESSAGES: Record<string, string> = {
    invalid_credentials: 'Email hoặc mật khẩu không đúng',
    user_already_exists: 'Email này đã được đăng ký, hãy đăng nhập',
    email_exists: 'Email này đã được đăng ký, hãy đăng nhập',
    weak_password: 'Mật khẩu quá yếu, hãy dùng tối thiểu 8 ký tự gồm chữ và số',
    same_password: 'Mật khẩu mới phải khác mật khẩu cũ',
    otp_expired: 'Mã xác thực sai hoặc đã hết hạn',
    over_email_send_rate_limit: 'Bạn gửi mã quá nhiều lần, hãy thử lại sau ít phút',
    over_request_rate_limit: 'Bạn thao tác quá nhanh, hãy thử lại sau ít phút',
};

/** Không đưa message gốc của server ra UI, chỉ map theo code. */
export function authErrorMessage(error: AuthError) {
    return (error.code && MESSAGES[error.code]) || 'Có lỗi xảy ra, vui lòng thử lại';
}
