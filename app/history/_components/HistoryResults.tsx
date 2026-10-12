import { getHistoryAttempts, getSkillCounts } from '../_lib/data';
import { parseHistoryQuery, RawSearchParams } from '../_lib/searchParams';
import HistoryFilters from './HistoryFilters';
import HistoryPagination from './HistoryPagination';
import HistoryTable from './HistoryTable';

interface HistoryResultsProps {
    searchParams: Promise<RawSearchParams>;
}

/** Phần động của trang: đọc URL → lọc dữ liệu → render bộ lọc, bảng và phân trang. */
export default async function HistoryResults({ searchParams }: HistoryResultsProps) {
    const query = parseHistoryQuery(await searchParams);
    const [result, skillCounts] = await Promise.all([getHistoryAttempts(query), getSkillCounts()]);

    return (
        // `group` + `data-pending` từ client islands → làm mờ bảng khi đang tải dữ liệu mới
        <div className="group flex flex-col gap-6">
            <HistoryFilters query={query} skillCounts={skillCounts} displayedCount={result.total} />

            <section
                aria-label="Danh sách lượt làm bài"
                className="bg-white shadow-sm border border-sub2/30 rounded-xl overflow-hidden group-has-data-pending:opacity-60 transition-opacity"
            >
                <HistoryTable attempts={result.items} />
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
