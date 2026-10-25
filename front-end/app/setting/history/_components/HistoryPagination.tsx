import Link from 'next/link';
import { ReactNode } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buildHistoryHref } from '../_lib/searchParams';
import { HistoryQuery } from '../types';
import { PAGE_SIZE_OPTIONS } from '../utils';
import HistoryParamSelect from './HistoryParamSelect';

interface HistoryPaginationProps {
    query: HistoryQuery;
    page: number;
    totalPages: number;
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
        <Link href={href} scroll={false} aria-label={label} className={STEP_CLASS}>
            {children}
        </Link>
    );
}

export default function HistoryPagination({ query, page, totalPages, totalRecords }: HistoryPaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const hrefFor = (target: number) => buildHistoryHref(query, { page: target });

    return (
        <div className="flex sm:flex-row flex-col justify-between items-center gap-3 bg-sub1/60 px-4 py-3 border-sub2/20 border-t">
            {/* Rows per page & record summary */}
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 font-medium text-subText text-xs">
                <div className="flex items-center gap-2">
                    <span aria-hidden="true">Mỗi trang:</span>
                    <HistoryParamSelect
                        query={query}
                        name="pageSize"
                        options={PAGE_SIZE_OPTIONS}
                        label="Số dòng mỗi trang"
                        className="bg-white px-2 border-sub2/40 focus-visible:border-main rounded-md data-[size=default]:h-7 font-semibold text-main text-xs"
                    />
                </div>
                <span className="hidden sm:block bg-sub2/40 w-px h-4" aria-hidden="true" />
                <span>
                    Trang <strong className="font-semibold text-main">{page}</strong> /{' '}
                    <strong className="font-semibold text-main">{totalPages}</strong> · Tổng {totalRecords} bản ghi
                </span>
            </div>

            {/* Page navigation */}
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
                            scroll={false}
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
