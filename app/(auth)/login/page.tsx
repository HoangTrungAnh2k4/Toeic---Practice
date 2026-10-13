import type { Metadata } from 'next';
import AuthCard from '../_components/AuthCard';
import LoginForm from '../_components/LoginForm';

export const metadata: Metadata = {
    title: 'Đăng nhập | Toeco',
};

export default function LoginPage() {
    return (
        <AuthCard
            title="Chào mừng trở lại"
            description="Đăng nhập để tiếp tục lộ trình luyện TOEIC Speaking & Writing của bạn."
            alternate={{ prompt: 'Chưa có tài khoản?', label: 'Đăng ký ngay', href: '/register' }}
        >
            <LoginForm />
        </AuthCard>
    );
}
