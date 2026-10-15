'use client';

import { use } from 'react';
import type { MistakePattern } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { getMistakes, getMistakeSummary } from '../_lib/data';
import { DEFAULT_MISTAKE_QUERY, parseMistakeQuery, RawSearchParams } from '../_lib/searchParams';
import { useMistakeBook } from '../_lib/useMistakeBook';
import { MistakeQuery, MistakeSummary } from '../types';
import MistakeCard from './MistakeCard';
import MistakesEmptyState, { EmptyVariant } from './MistakesEmptyState';
import MistakesFilters from './MistakesFilters';
import MistakesResultsSkeleton from './MistakesResultsSkeleton';
import MistakesSummary from './MistakesSummary';

interface MistakesResultsProps {
    patterns: MistakePattern[];
    exams: ExamSummary[];
    searchParams: Promise<RawSearchParams>;
}

function getEmptyVariant(query: MistakeQuery, summary: MistakeSummary): EmptyVariant {
    if (summary.total === 0) return 'no-data';
    const isDefaultScope =
        query.status === DEFAULT_MISTAKE_QUERY.status &&
        query.criterion === DEFAULT_MISTAKE_QUERY.criterion &&
        !query.searchQuery.trim();
    return isDefaultScope ? 'all-clear' : 'no-match';
}

/**
 * Phần động của trang: đọc URL + bài làm của người dùng → tổng quan, bộ lọc và danh sách lỗi.
 * Tính ở client vì bài làm của khách nằm trong localStorage, server không đọc được.
 */
export default function MistakesResults({ patterns, exams, searchParams }: MistakesResultsProps) {
    const query = parseMistakeQuery(use(searchParams));
    const book = useMistakeBook(patterns, exams);

    if (!book) return <MistakesResultsSkeleton />;

    const items = getMistakes(book, query);
    const summary = getMistakeSummary(book);

    return (
        // `group` + `data-pending` từ client islands → làm mờ danh sách khi URL đang đổi
        <div className="group flex flex-col gap-6">
            <MistakesSummary summary={summary} />
            <MistakesFilters query={query} summary={summary} displayedCount={items.length} />

            <section aria-label="Danh sách lỗi" className="group-has-data-pending:opacity-60 transition-opacity">
                {items.length === 0 ? (
                    <MistakesEmptyState variant={getEmptyVariant(query, summary)} query={query} />
                ) : (
                    <ul className="gap-4 grid grid-cols-1 lg:grid-cols-2">
                        {items.map((item) => (
                            <li key={item.id} className="flex">
                                <MistakeCard item={item} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
