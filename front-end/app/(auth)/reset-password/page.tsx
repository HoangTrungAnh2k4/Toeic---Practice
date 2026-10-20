import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthCard from '../_components/AuthCard';
import ResetPasswordForm from '../_components/ResetPasswordForm';

export const metadata: Metadata = {
    title: 'Đặt lại mật khẩu | Toeco',
};

export default function ResetPasswordPage() {
    return (
        <AuthCard
            title="Đặt lại mật khẩu"
            description="Nhập mã 6 chữ số vừa gửi tới email và mật khẩu mới. Mã có hiệu lực trong 10 phút."
            alternate={{ prompt: 'Chưa nhận được mã?', label: 'Gửi lại', href: '/forgot-password' }}
        >
            {/* useSearchParams cần Suspense (cacheComponents) */}
            <Suspense>
                <ResetPasswordForm />
            </Suspense>
        </AuthCard>
    );
}
