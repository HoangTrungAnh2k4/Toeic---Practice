import Link from 'next/link';
import { ReactNode } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buildSpeakingHref, SPEAKING_LIBRARY_ID } from '../_lib/searchParams';
import { SpeakingQuery } from '../types';

interface SpeakingPaginationProps {
    query: SpeakingQuery;
    page: number;
    totalPages: number;
    displayedCount: number;
    totalRecords: number;
}

interface StepLinkProps {
    href: string;
    disabled: boolean;
    label: string;
    children: ReactNode;
}

const STEP_CLASS = cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'px-2.5 h-8');

function StepLink({ href, disabled, label, children }: StepLinkProps) {
    if (disabled) {
        return (
            <span aria-disabled="true" aria-label={label} className={cn(STEP_CLASS, 'opacity-50 pointer-events-none')}>
                {children}
            </span>
        );
    }

    return (
        <Link href={href} aria-label={label} className={STEP_CLASS}>
            {children}
        </Link>
    );
}

export default function SpeakingPagination({
    query,
    page,
    totalPages,
    displayedCount,
    totalRecords,
}: SpeakingPaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    // Cuộn về đầu danh sách đề khi đổi trang thay vì đầu trang
    const hrefFor = (target: number) => `${buildSpeakingHref(query, { page: target })}#${SPEAKING_LIBRARY_ID}`;

    return (
        <div className="flex sm:flex-row flex-col justify-between items-center gap-3 bg-white shadow-sm px-4 py-3 border border-sub2/30 rounded-xl">
            <span className="font-medium text-subText text-xs">
                Đang hiển thị <strong className="font-semibold text-main">{displayedCount}</strong> trong tổng số{' '}
                <strong className="font-semibold text-main">{totalRecords}</strong> bộ đề · Trang {page}/{totalPages}
            </span>

            <nav aria-label="Phân trang" className="flex items-center gap-2">
                <StepLink href={hrefFor(page - 1)} disabled={page <= 1} label="Trang trước">
                    <LuChevronLeft className="size-4" aria-hidden="true" />
                </StepLink>

                {pages.map((p) => {
                    const isActive = p === page;
                    return (
                        <Link
                            key={p}
                            href={hrefFor(p)}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'flex justify-center items-center rounded-lg size-8 font-semibold text-xs transition-colors duration-200',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
                                isActive
                                    ? 'bg-main text-sub3 shadow-sm'
                                    : 'bg-white text-main border border-sub2/40 hover:bg-sub1',
                            )}
                        >
                            {p}
                        </Link>
                    );
                })}

                <StepLink href={hrefFor(page + 1)} disabled={page >= totalPages} label="Trang tiếp">
                    <LuChevronRight className="size-4" aria-hidden="true" />
                </StepLink>
            </nav>
        </div>
    );
}
