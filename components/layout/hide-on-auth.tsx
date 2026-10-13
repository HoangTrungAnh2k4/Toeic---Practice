'use client';

import { usePathname } from 'next/navigation';

const AUTH_ROUTES = ['/login', '/register'];

/** Ẩn khung ứng dụng (sidebar, footer) ở trang đăng nhập / đăng ký. */
export function HideOnAuth({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return null;

    return children;
}
