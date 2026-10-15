import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LuMic, LuPenLine, LuRotateCcw } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { buildHistoryHref, DEFAULT_HISTORY_QUERY } from '../_lib/searchParams';
import { HistoryQuery, SkillType } from '../types';
import { CATEGORY_OPTIONS, DATE_SCOPE_OPTIONS, MODE_OPTIONS, SKILL_OPTIONS, STATUS_OPTIONS } from '../utils';
import HistoryParamSelect from './HistoryParamSelect';
import HistorySearchInput from './HistorySearchInput';

interface HistoryFiltersProps {
    query: HistoryQuery;
    skillCounts: Record<SkillType, number>;
    displayedCount: number;
}

const SELECT_CLASS =
    'bg-white px-3 border border-sub2/40 focus:border-main rounded-lg w-full h-10 font-medium text-main text-xs transition-colors';

const FOCUS_RING_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3';

const SKILL_ICONS: Partial<Record<SkillType, IconType>> = {
    speaking: LuMic,
    writing: LuPenLine,
};

const SELECT_FILTERS = [
    { name: 'mode', label: 'Lọc theo chế độ', options: MODE_OPTIONS },
    { name: 'category', label: 'Lọc theo phân loại đề', options: CATEGORY_OPTIONS },
    { name: 'status', label: 'Lọc theo trạng thái', options: STATUS_OPTIONS },
] as const;

export default function HistoryFilters({ query, skillCounts, displayedCount }: HistoryFiltersProps) {
    const resetHref = buildHistoryHref(DEFAULT_HISTORY_QUERY, { pageSize: query.pageSize });

    return (
        <section
            aria-label="Bộ lọc lịch sử làm bài"
            className="flex flex-col gap-4 bg-white shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl"
        >
            {/* Skill tabs & reset */}
            <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-sub2/20 border-b">
                <nav aria-label="Lọc theo kỹ năng" className="flex flex-wrap gap-1 bg-main p-1 rounded-lg">
                    {SKILL_OPTIONS.map(({ value, label }) => {
                        const Icon = SKILL_ICONS[value];
                        const isActive = query.skill === value;
                        return (
                            <Link
                                key={value}
                                href={buildHistoryHref(query, { skill: value })}
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
                                    {skillCounts[value]}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3 ml-auto">
                    <span className="font-medium text-subText text-xs" aria-live="polite">
                        Hiển thị <strong className="font-semibold text-main">{displayedCount}</strong> /{' '}
                        {skillCounts.all} lượt làm bài
                    </span>
                    <Link
                        href={resetHref}
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
            <div className="gap-3 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5">
                <HistorySearchInput query={query} className="sm:col-span-3 xl:col-span-2" />
                {SELECT_FILTERS.map((filter) => (
                    <HistoryParamSelect
                        key={filter.name}
                        query={query}
                        name={filter.name}
                        options={filter.options}
                        label={filter.label}
                        className={SELECT_CLASS}
                    />
                ))}
            </div>

            {/* Date scope pills */}
            <nav aria-label="Khoảng thời gian" className="flex flex-wrap items-center gap-2 text-xs">
                <span className="mr-1 font-semibold text-main">Khoảng thời gian:</span>
                {DATE_SCOPE_OPTIONS.map(({ value, label }) => {
                    const isActive = query.dateScope === value;
                    return (
                        <Link
                            key={value}
                            href={buildHistoryHref(query, { dateScope: value })}
                            scroll={false}
                            aria-current={isActive ? 'true' : undefined}
                            className={cn(
                                'inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs transition-colors duration-200',
                                FOCUS_RING_CLASS,
                                isActive ? 'bg-main font-semibold text-white' : 'bg-sub1 text-main hover:bg-sub2 hover:text-white',
                            )}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </section>
    );
}
