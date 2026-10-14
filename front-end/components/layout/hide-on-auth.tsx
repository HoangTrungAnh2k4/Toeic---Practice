'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const AUTH_ROUTES = ['/login', '/register'];

function useIsAuthRoute() {
    const pathname = usePathname();
    return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Ẩn khung ứng dụng (sidebar, footer) ở trang đăng nhập / đăng ký. */
export function HideOnAuth({ children }: { children: React.ReactNode }) {
    if (useIsAuthRoute()) return null;

    return children;
}

/** Vùng nội dung chính: trang auth tự quản lý khoảng cách để phủ kín màn hình nên bỏ padding. */
export function MainContent({ children }: { children: React.ReactNode }) {
    const isAuth = useIsAuthRoute();

    return <div className={cn('flex-1', !isAuth && 'px-4 sm:px-8 pt-4 pb-10')}>{children}</div>;
}
