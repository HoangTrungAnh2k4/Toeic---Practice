'use client';

import { usePathname } from 'next/navigation';

const AUTH_ROUTES = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

function useIsAuthRoute() {
    const pathname = usePathname();
    // Landing page "/" có header/footer riêng nên cũng ẩn khung ứng dụng
    return pathname === '/' || AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Ẩn khung ứng dụng (sidebar, footer) ở landing page và trang đăng nhập / đăng ký. */
export function HideOnAuth({ children }: { children: React.ReactNode }) {
    if (useIsAuthRoute()) return null;

    return children;
}

