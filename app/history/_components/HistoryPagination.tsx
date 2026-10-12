'use client';

import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

interface HistoryPaginationProps {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export default function HistoryPagination({
    currentPage = 1,
    totalPages = 3,
    totalRecords = 28,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
}: HistoryPaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-muted/40 p-4 sm:flex-row">
            {/* Rows per page & record count summary */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Hiển thị mỗi trang:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="rounded border border-border bg-card px-2 py-0.5 text-xs font-semibold text-foreground focus:outline-none"
                    >
                        <option value={10}>10 dòng</option>
                        <option value={25}>25 dòng</option>
                        <option value={50}>50 dòng</option>
                    </select>
                </div>
                <span className="text-border">|</span>
                <span className="text-xs text-muted-foreground">
                    Trang <strong className="font-semibold text-foreground">{currentPage}</strong> trên{' '}
                    <strong className="font-semibold text-foreground">{totalPages}</strong> (Tổng {totalRecords} bản
                    ghi)
                </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <LuChevronLeft className="size-3.5" aria-hidden="true" />
                    <span>Trước</span>
                </button>

                {pages.map((p) => {
                    const isActive = p === currentPage;
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p)}
                            className={`flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'border border-border bg-card text-foreground hover:bg-accent'
                            }`}
                        >
                            {p}
                        </button>
                    );
                })}

                <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span>Tiếp</span>
                    <LuChevronRight className="size-3.5" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
