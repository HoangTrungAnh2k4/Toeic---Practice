'use client';

import { use } from 'react';
import type { ExamSummary } from '@/lib/exam-library/types';
import { countSkills, filterHistoryRows, getHistoryKpis } from '../_lib/data';
import { parseHistoryQuery, RawSearchParams } from '../_lib/searchParams';
import { useHistoryRows } from '../_lib/useHistoryRows';
import HistoryFilters from './HistoryFilters';
import HistoryKpiBento from './HistoryKpiBento';
import HistoryPagination from './HistoryPagination';
import HistoryResultsSkeleton from './HistoryResultsSkeleton';
import HistoryTable from './HistoryTable';

interface HistoryResultsProps {
    exams: ExamSummary[];
    searchParams: Promise<RawSearchParams>;
}

/**
 * Phần động của trang: đọc URL + lượt làm của người dùng → KPI, bộ lọc, bảng và phân trang.
 * Lọc ở client vì lượt làm của khách nằm trong localStorage, server không đọc được.
 */
export default function HistoryResults({ exams, searchParams }: HistoryResultsProps) {
    const query = parseHistoryQuery(use(searchParams));
    const rows = useHistoryRows(exams);

    if (!rows) return <HistoryResultsSkeleton />;

    const result = filterHistoryRows(rows, query);

    return (
        // `group` + `data-pending` từ client islands → làm mờ bảng khi URL đang đổi
        <div className="group flex flex-col gap-6">
            <HistoryKpiBento kpis={getHistoryKpis(rows)} />
            <HistoryFilters query={query} skillCounts={countSkills(rows)} displayedCount={result.total} />

            <section
                aria-label="Danh sách lượt làm bài"
                className="bg-white shadow-sm border border-sub2/30 rounded-xl overflow-hidden group-has-data-pending:opacity-60 transition-opacity"
            >
                <HistoryTable rows={result.items} hasAnyAttempt={rows.length > 0} />
                <HistoryPagination
                    query={query}
                    page={result.page}
                    totalPages={result.totalPages}
                    totalRecords={result.total}
                />
            </section>
        </div>
    );
}
