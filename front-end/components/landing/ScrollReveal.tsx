'use client';

import { useEffect } from 'react';

/** Gắn data-revealed cho [data-reveal] khi cuộn tới, hiệu ứng fade-up nằm ở globals.css. */
export default function ScrollReveal() {
    useEffect(() => {
        const reveal = (el: Element, delayMs = 0) => {
            (el as HTMLElement).style.animationDelay = `${delayMs}ms`;
            (el as HTMLElement).dataset.revealed = '';
            observer.unobserve(el);
        };
        const observer = new IntersectionObserver(
            (entries) => {
                // Các phần tử vào cùng lúc (thẻ cùng hàng) hiện lần lượt; một cột trên mobile thì không chờ
                let stagger = 0;
                for (const { target, isIntersecting } of entries) {
                    if (isIntersecting) reveal(target, Math.min(stagger++, 4) * 90);
                }
                // Tải lại giữa trang, cuộn nhanh hay nhảy anchor có thể lướt qua phần tử mà không lần nào giao viewport:
                // phần tử đã nằm phía trên (hoặc đang display:none) thì hiện luôn, không bắt cuộn ngược
                document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((el) => {
                    if (el.getBoundingClientRect().bottom <= 0) reveal(el);
                });
            },
            { rootMargin: '0px 0px -15% 0px' },
        );
        document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return null;
}
