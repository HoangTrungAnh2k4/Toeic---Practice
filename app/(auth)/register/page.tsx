import type { Metadata } from 'next';
import AuthCard from '../_components/AuthCard';
import RegisterForm from '../_components/RegisterForm';

export const metadata: Metadata = {
    title: 'Đăng ký | Toeco',
};

export default function RegisterPage() {
    return (
        <AuthCard
            title="Tạo tài khoản"
            description="Bắt đầu luyện TOEIC Speaking & Writing sát format ETS, chấm theo đúng tiêu chí."
            alternate={{ prompt: 'Đã có tài khoản?', label: 'Đăng nhập', href: '/login' }}
        >
            <RegisterForm />
        </AuthCard>
    );
}
