'use client';

import { usePathname } from 'next/navigation';

/** Ẩn nội dung khi đang ở màn làm bài (`.../test`) để thí sinh không bị phân tâm. */
export function HideOnExam({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (pathname.split('/').includes('test')) return null;

    return children;
}
