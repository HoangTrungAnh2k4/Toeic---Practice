import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { MISTAKES_ENABLED } from './utils';

/** Chặn cả /mistakes lẫn /mistakes/[id] khi Sổ lỗi đang khóa. */
export default function MistakesLayout({ children }: { children: ReactNode }) {
    if (!MISTAKES_ENABLED) notFound();
    return children;
}
