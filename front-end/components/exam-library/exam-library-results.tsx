'use client';

import Link from 'next/link';
import { use, useSyncExternalStore } from 'react';
import { LuSearchX, LuTriangleAlert } from 'react-icons/lu';
import { LoadError } from '@/components/load-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import type { Skill } from '@/lib/domain/types';
import { countTabs, filterEntries, paginate, pickRecommended, toEntries } from '@/lib/exam-library/entries';
import {
    buildLibraryHref,
    DEFAULT_LIBRARY_QUERY,
    LIBRARY_SECTION_ID,
    parseLibraryQuery,
    RawSearchParams,
} from '@/lib/exam-library/search-params';
import type { ExamSummary } from '@/lib/exam-library/types';
import { useUserExamStates } from '@/lib/exam-library/use-user-exam-states';
import { cn } from '@/lib/utils';
import { ExamCard } from './exam-card';
import { LibraryFilters } from './library-filters';
import { LibraryPagination } from './library-pagination';
import { LibraryResultsSkeleton } from './library-results-skeleton';
import { SKILL_COPY } from './skill-copy';

const subscribeNothing = () => () => {};

interface ExamLibraryResultsProps {
    skill: Skill;
    exams: ExamSummary[];
    searchParams: Promise<RawSearchParams>;
}

/**
 * Phần động của thư viện đề: đọc URL + tiến độ của người dùng → lọc, render bộ lọc, lưới đề và phân trang.
 * Lọc ở client vì tiến độ của khách nằm trong localStorage, server không đọc được.
 */
export function ExamLibraryResults({ skill, exams, searchParams }: ExamLibraryResultsProps) {
    const query = parseLibraryQuery(use(searchParams));
    const { states, loadFailed, retry, bookmarkFailed, toggleBookmark } = useUserExamStates();
    // Provider ở ngoài Suspense có thể tải xong trước khi khối này hydrate → lần hydrate phải khớp skeleton của server
    const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);

    if (!hydrated) return <LibraryResultsSkeleton />;
    if (loadFailed) return <LoadError message="Không tải được tiến độ làm bài." onRetry={retry} />;
    if (!states) return <LibraryResultsSkeleton />;

    const entries = toEntries(exams, states);
    const recommendedId = pickRecommended(entries)?.exam.id;
    const result = paginate(filterEntries(entries, query), query.page);

    return (
        // `group` + `data-pending` từ các ô lọc → làm mờ lưới đề khi URL đang đổi
        <div id={LIBRARY_SECTION_ID} className="group flex flex-col gap-4 scroll-mt-4">
            <LibraryFilters skill={skill} query={query} tabCounts={countTabs(entries)} displayedCount={result.total} />

            {bookmarkFailed && (
                <Alert variant="destructive">
                    <LuTriangleAlert aria-hidden="true" />
                    <AlertDescription>Chưa lưu được đánh dấu đề. Kiểm tra kết nối rồi bấm lại.</AlertDescription>
                </Alert>
            )}

            <section
                aria-label={`Danh sách bộ đề ${SKILL_COPY[skill].label}`}
                className="group-has-data-pending:opacity-60 transition-opacity"
            >
                {result.items.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 bg-white shadow-sm px-4 py-12 border border-sub2/30 rounded-xl text-center">
                        <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-main">
                            <LuSearchX className="size-6" aria-hidden="true" />
                        </span>
                        <div className="flex flex-col gap-1">
                            <p className="font-semibold text-main text-sm">Không tìm thấy bộ đề phù hợp</p>
                            <p className="text-subText text-xs">Thử đổi từ khóa hoặc bỏ bớt điều kiện lọc.</p>
                        </div>
                        <Link
                            href={buildLibraryHref(skill, DEFAULT_LIBRARY_QUERY)}
                            scroll={false}
                            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'text-xs')}
                        >
                            Xóa bộ lọc
                        </Link>
                    </div>
                ) : (
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {result.items.map((entry) => (
                            <ExamCard
                                key={entry.exam.id}
                                skill={skill}
                                entry={entry}
                                isRecommended={entry.exam.id === recommendedId}
                                onToggleBookmark={toggleBookmark}
                            />
                        ))}
                    </div>
                )}
            </section>

            {result.total > 0 && (
                <LibraryPagination
                    skill={skill}
                    query={query}
                    page={result.page}
                    totalPages={result.totalPages}
                    displayedCount={result.items.length}
                    totalRecords={result.total}
                />
            )}
        </div>
    );
}
