'use client';

import { type ReactNode, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { LuArrowLeft, LuRotateCw, LuShieldAlert } from 'react-icons/lu';
import Button, { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getProfile } from '@/lib/data/user-data';
import { cn } from '@/lib/utils';
import { SETTING_BASE_PATH } from '../utils';

type Access = 'loading' | 'allowed' | 'denied' | 'error';

/**
 * Chỉ admin vào được khu quản trị đề. Phiên đăng nhập nằm ở localStorage nên chặn phía client;
 * lớp bảo vệ thật là RLS trên các bảng nội dung.
 */
export default function ExamManagementLayout({ children }: { children: ReactNode }) {
    const [access, setAccess] = useState<Access>('loading');

    const load = useCallback(() => {
        getProfile()
            .then((profile) => setAccess(profile?.role === 'admin' ? 'allowed' : 'denied'))
            .catch(() => setAccess('error'));
    }, []);

    useEffect(load, [load]);

    const retry = () => {
        setAccess('loading');
        load();
    };

    if (access === 'allowed') return children;

    if (access === 'loading') {
        return (
            <div className="flex flex-col gap-6 mx-auto w-full max-w-360" aria-busy="true" aria-label="Đang kiểm tra quyền truy cập">
                <Skeleton className="w-72 h-12" />
                <Skeleton className="rounded-xl w-full h-96" />
            </div>
        );
    }

    const denied = access === 'denied';

    return (
        <div
            role="alert"
            className="flex flex-col items-center gap-3 bg-card shadow-sm mx-auto px-4 py-12 border border-sub2/30 rounded-xl w-full max-w-360 text-center"
        >
            <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                <LuShieldAlert className="size-6" aria-hidden="true" />
            </span>
            <h1 className="font-semibold text-main text-base">
                {denied ? 'Bạn không có quyền truy cập' : 'Không kiểm tra được quyền truy cập'}
            </h1>
            <p className="max-w-md text-subText text-xs">
                {denied
                    ? 'Khu quản trị đề thi chỉ dành cho tài khoản quản trị viên.'
                    : 'Kết nối tới máy chủ bị gián đoạn. Vui lòng thử lại.'}
            </p>
            {denied ? (
                <Link
                    href={SETTING_BASE_PATH}
                    className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'gap-2 mt-2 text-xs')}
                >
                    <LuArrowLeft className="size-4" aria-hidden="true" />
                    Về trang cài đặt
                </Link>
            ) : (
                <Button type="button" variant="primary" size="sm" className="gap-2 mt-2 text-xs" onClick={retry}>
                    <LuRotateCw className="size-4" aria-hidden="true" />
                    Thử lại
                </Button>
            )}
        </div>
    );
}
