import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LuBookmark, LuRotateCcw } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import type { Skill } from '@/lib/domain/types';
import { STATUS_OPTIONS, TAB_OPTIONS } from '@/lib/exam-library/options';
import { buildLibraryHref, DEFAULT_LIBRARY_QUERY } from '@/lib/exam-library/search-params';
import type { LibraryQuery, LibraryTab } from '@/lib/exam-library/types';
import { LibraryParamSelect } from './library-param-select';
import { LibrarySearchInput } from './library-search-input';
import { SKILL_COPY } from './skill-copy';

interface LibraryFiltersProps {
    skill: Skill;
    query: LibraryQuery;
    tabCounts: Record<LibraryTab, number>;
    displayedCount: number;
}

const SELECT_CLASS =
    'bg-white px-3 border border-sub2/40 focus:border-main rounded-lg w-full h-10 font-medium text-main text-xs transition-colors';

const FOCUS_RING_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3';

const TAB_ICONS: Partial<Record<LibraryTab, IconType>> = {
    retake: LuRotateCcw,
    bookmark: LuBookmark,
};

const SELECT_FILTERS = [
    { name: 'status', label: 'Lọc theo trạng thái', options: STATUS_OPTIONS },
] as const;

export function LibraryFilters({ skill, query, tabCounts, displayedCount }: LibraryFiltersProps) {
    return (
        <section
            aria-label={`Bộ lọc thư viện đề ${SKILL_COPY[skill].label}`}
            className="flex flex-col gap-4 bg-white shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl"
        >
            {/* Practice tabs & reset */}
            <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-sub2/20 border-b">
                <nav aria-label="Hình thức luyện tập" className="flex flex-wrap gap-1 bg-main p-1 rounded-lg">
                    {TAB_OPTIONS.map(({ value, label }) => {
                        const Icon = TAB_ICONS[value];
                        const isActive = query.tab === value;
                        return (
                            <Link
                                key={value}
                                href={buildLibraryHref(skill, query, { tab: value })}
                                scroll={false}
                                aria-current={isActive ? 'true' : undefined}
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors duration-200',
                                    FOCUS_RING_CLASS,
                                    isActive ? 'bg-sub3 text-main' : 'text-white hover:bg-white/15',
                                )}
                            >
                                {Icon && <Icon className="size-3.5" aria-hidden="true" />}
                                <span>{label}</span>
                                <span
                                    className={cn(
                                        'px-1.5 rounded-full font-semibold text-[11px] leading-4',
                                        isActive ? 'bg-main text-sub3' : 'bg-white text-main',
                                    )}
                                >
                                    {tabCounts[value]}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3 ml-auto">
                    <span className="font-medium text-subText text-xs" aria-live="polite">
                        Tìm thấy <strong className="font-semibold text-main">{displayedCount}</strong> /{' '}
                        {tabCounts.all} bộ đề
                    </span>
                    <Link
                        href={buildLibraryHref(skill, DEFAULT_LIBRARY_QUERY)}
                        scroll={false}
                        className={cn(
                            'inline-flex items-center gap-1.5 hover:bg-sub1 px-2.5 py-1.5 rounded-lg font-semibold text-main text-xs transition-colors',
                            FOCUS_RING_CLASS,
                        )}
                    >
                        <LuRotateCcw className="size-3.5" aria-hidden="true" />
                        <span>Đặt lại</span>
                    </Link>
                </div>
            </div>

            {/* Search & dropdown filters */}
            <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
                <LibrarySearchInput skill={skill} query={query} className="sm:col-span-2" />
                {SELECT_FILTERS.map((filter) => (
                    <LibraryParamSelect
                        key={filter.name}
                        skill={skill}
                        query={query}
                        name={filter.name}
                        options={filter.options}
                        label={filter.label}
                        className={SELECT_CLASS}
                    />
                ))}
            </div>
        </section>
    );
}
