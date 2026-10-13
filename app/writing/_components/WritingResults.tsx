import { LuSearchX } from 'react-icons/lu';
import LinkButton from '@/components/ui/link-button';
import { getTabCounts, getWritingTests } from '../_lib/data';
import {
    buildWritingHref,
    DEFAULT_WRITING_QUERY,
    parseWritingQuery,
    RawSearchParams,
    WRITING_LIBRARY_ID,
} from '../_lib/searchParams';
import WritingFilters from './WritingFilters';
import WritingPagination from './WritingPagination';
import WritingTestCard from './WritingTestCard';

interface WritingResultsProps {
    searchParams: Promise<RawSearchParams>;
}

/** Phần động của trang: đọc URL → lọc dữ liệu → render bộ lọc, lưới đề và phân trang. */
export default async function WritingResults({ searchParams }: WritingResultsProps) {
    const query = parseWritingQuery(await searchParams);
    const [result, tabCounts] = await Promise.all([getWritingTests(query), getTabCounts()]);

    return (
        // `group` + `data-pending` từ client islands → làm mờ lưới đề khi đang tải dữ liệu mới
        <div id={WRITING_LIBRARY_ID} className="group flex flex-col gap-4 scroll-mt-4">
            <WritingFilters query={query} tabCounts={tabCounts} displayedCount={result.total} />

            <section
                aria-label="Danh sách bộ đề Writing"
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
                        <LinkButton
                            href={buildWritingHref(DEFAULT_WRITING_QUERY)}
                            scroll={false}
                            variant="primary"
                            size="sm"
                            className="text-xs"
                        >
                            Xóa bộ lọc
                        </LinkButton>
                    </div>
                ) : (
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {result.items.map((test) => (
                            <WritingTestCard key={test.id} test={test} />
                        ))}
                    </div>
                )}
            </section>

            {result.total > 0 && (
                <WritingPagination
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
