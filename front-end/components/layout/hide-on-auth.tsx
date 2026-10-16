'use client';

import { usePathname } from 'next/navigation';

const AUTH_ROUTES = ['/login', '/register', '/verify-email'];

function useIsAuthRoute() {
    const pathname = usePathname();
    return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Ẩn khung ứng dụng (sidebar, footer) ở trang đăng nhập / đăng ký. */
export function HideOnAuth({ children }: { children: React.ReactNode }) {
    if (useIsAuthRoute()) return null;

    return children;
}

