import { type ReactNode, Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LuArrowLeft, LuShieldAlert } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { createServerSupabase, isAdmin } from '@/lib/supabase-server';
import { cn } from '@/lib/utils';
import { SETTING_BASE_PATH } from '../utils';

/** Chỉ admin vào được khu quản trị đề. proxy.ts đã đẩy khách về /login; RLS vẫn là lớp bảo vệ dữ liệu cuối cùng. */
export default function ExamManagementLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense
            fallback={
                <div
                    className="flex flex-col gap-6 mx-auto w-full max-w-360"
                    aria-busy="true"
                    aria-label="Đang kiểm tra quyền truy cập"
                >
                    <Skeleton className="w-72 h-12" />
                    <Skeleton className="rounded-xl w-full h-96" />
                </div>
            }
        >
            <AdminGate>{children}</AdminGate>
        </Suspense>
    );
}

async function AdminGate({ children }: { children: ReactNode }) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) redirect('/login');

    // Lỗi kết nối ném lên error boundary (có nút thử lại)
    if (await isAdmin(supabase, data.claims.sub)) return children;

    return (
        <div
            role="alert"
            className="flex flex-col items-center gap-3 bg-card shadow-sm mx-auto px-4 py-12 border border-sub2/30 rounded-xl w-full max-w-360 text-center"
        >
            <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                <LuShieldAlert className="size-6" aria-hidden="true" />
            </span>
            <h1 className="font-semibold text-main text-base">Bạn không có quyền truy cập</h1>
            <p className="max-w-md text-subText text-xs">Khu quản trị đề thi chỉ dành cho tài khoản quản trị viên.</p>
            <Link
                href={SETTING_BASE_PATH}
                className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'gap-2 mt-2 text-xs')}
            >
                <LuArrowLeft className="size-4" aria-hidden="true" />
                Về trang cài đặt
            </Link>
        </div>
    );
}
