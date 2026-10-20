import type { Metadata } from 'next';
import AuthCard from '../_components/AuthCard';
import ForgotPasswordForm from '../_components/ForgotPasswordForm';

export const metadata: Metadata = {
    title: 'Quên mật khẩu | Toeco',
};

export default function ForgotPasswordPage() {
    return (
        <AuthCard
            title="Quên mật khẩu"
            description="Nhập email đã đăng ký, Toeco sẽ gửi mã 6 chữ số để bạn đặt mật khẩu mới."
            alternate={{ prompt: 'Nhớ ra mật khẩu?', label: 'Đăng nhập', href: '/login' }}
        >
            <ForgotPasswordForm />
        </AuthCard>
    );
}
