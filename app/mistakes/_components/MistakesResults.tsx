import { getMistakes, getMistakeSummary } from '../_lib/data';
import { DEFAULT_MISTAKE_QUERY, parseMistakeQuery, RawSearchParams } from '../_lib/searchParams';
import { MistakeQuery, MistakeSummary } from '../types';
import MistakeCard from './MistakeCard';
import MistakesEmptyState, { EmptyVariant } from './MistakesEmptyState';
import MistakesFilters from './MistakesFilters';

interface MistakesResultsProps {
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

/** Phần động của trang: đọc URL → lọc sổ lỗi → render bộ lọc và danh sách. */
export default async function MistakesResults({ searchParams }: MistakesResultsProps) {
    const query = parseMistakeQuery(await searchParams);
    const [items, summary] = await Promise.all([getMistakes(query), getMistakeSummary()]);

    return (
        // `group` + `data-pending` từ client islands → làm mờ danh sách khi đang tải dữ liệu mới
        <div className="group flex flex-col gap-6">
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
