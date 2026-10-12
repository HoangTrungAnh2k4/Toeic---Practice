import Link from 'next/link';
import { LuSearchX } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSpeakingTests, getTabCounts } from '../_lib/data';
import {
    buildSpeakingHref,
    DEFAULT_SPEAKING_QUERY,
    parseSpeakingQuery,
    RawSearchParams,
    SPEAKING_LIBRARY_ID,
} from '../_lib/searchParams';
import SpeakingFilters from './SpeakingFilters';
import SpeakingPagination from './SpeakingPagination';
import SpeakingTestCard from './SpeakingTestCard';

interface SpeakingResultsProps {
    searchParams: Promise<RawSearchParams>;
}

/** Phần động của trang: đọc URL → lọc dữ liệu → render bộ lọc, lưới đề và phân trang. */
export default async function SpeakingResults({ searchParams }: SpeakingResultsProps) {
    const query = parseSpeakingQuery(await searchParams);
    const [result, tabCounts] = await Promise.all([getSpeakingTests(query), getTabCounts()]);

    return (
        // `group` + `data-pending` từ client islands → làm mờ lưới đề khi đang tải dữ liệu mới
        <div id={SPEAKING_LIBRARY_ID} className="group flex flex-col gap-4 scroll-mt-4">
            <SpeakingFilters query={query} tabCounts={tabCounts} displayedCount={result.total} />

            <section
                aria-label="Danh sách bộ đề Speaking"
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
                            href={buildSpeakingHref(DEFAULT_SPEAKING_QUERY)}
                            scroll={false}
                            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'text-xs')}
                        >
                            Xóa bộ lọc
                        </Link>
                    </div>
                ) : (
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {result.items.map((test) => (
                            <SpeakingTestCard key={test.id} test={test} />
                        ))}
                    </div>
                )}
            </section>

            {result.total > 0 && (
                <SpeakingPagination
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
