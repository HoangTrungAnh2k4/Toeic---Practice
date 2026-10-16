import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthCard from '../_components/AuthCard';
import VerifyOtpForm from '../_components/VerifyOtpForm';

export const metadata: Metadata = {
    title: 'Xác thực email | Toeco',
};

export default function VerifyEmailPage() {
    return (
        <AuthCard
            title="Xác thực email"
            description="Nhập mã 6 chữ số Toeco vừa gửi tới email của bạn. Mã có hiệu lực trong 10 phút."
            alternate={{ prompt: 'Nhập nhầm email?', label: 'Đăng ký lại', href: '/register' }}
        >
            {/* useSearchParams cần Suspense (cacheComponents) */}
            <Suspense>
                <VerifyOtpForm />
            </Suspense>
        </AuthCard>
    );
}
