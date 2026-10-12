import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LuMic, LuPenLine, LuRotateCcw } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { buildMistakesHref, DEFAULT_MISTAKE_QUERY } from '../_lib/searchParams';
import { MistakeQuery, MistakeSkillFilter, MistakeStatusFilter, MistakeSummary } from '../types';
import { CRITERION_OPTIONS, SKILL_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from '../utils';
import MistakesParamSelect from './MistakesParamSelect';
import MistakesSearchInput from './MistakesSearchInput';

interface MistakesFiltersProps {
    query: MistakeQuery;
    summary: MistakeSummary;
    displayedCount: number;
}

const SELECT_CLASS =
    'bg-card px-3 border border-sub2/40 focus:border-main rounded-lg w-full h-10 font-medium text-main text-xs transition-colors';

const FOCUS_RING_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3';

const SKILL_ICONS: Partial<Record<MistakeSkillFilter, IconType>> = {
    speaking: LuMic,
    writing: LuPenLine,
};

function getStatusCount(status: MistakeStatusFilter, summary: MistakeSummary) {
    const { active, improving, resolved } = summary.byStatus;
    if (status === 'open') return active + improving;
    if (status === 'all') return summary.total;
    return { active, improving, resolved }[status];
}

export default function MistakesFilters({ query, summary, displayedCount }: MistakesFiltersProps) {
    return (
        <section
            aria-label="Bộ lọc sổ lỗi"
            className="flex flex-col gap-4 bg-card shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl"
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
                                href={buildMistakesHref(query, { skill: value })}
                                scroll={false}
                                aria-current={isActive ? 'true' : undefined}
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors duration-200',
                                    FOCUS_RING_CLASS,
                                    isActive ? 'bg-sub3 text-main' : 'text-sub1 hover:bg-sub1/15',
                                )}
                            >
                                {Icon && <Icon className="size-3.5" aria-hidden="true" />}
                                <span>{label}</span>
                                <span
                                    className={cn(
                                        'px-1.5 rounded-full font-semibold text-[0.6875rem] leading-4',
                                        isActive ? 'bg-main text-sub3' : 'bg-card text-main',
                                    )}
                                >
                                    {summary.bySkill[value]}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3 ml-auto">
                    <span className="font-medium text-subText text-xs" aria-live="polite">
                        Hiển thị <strong className="font-semibold text-main">{displayedCount}</strong> / {summary.total}{' '}
                        mẫu lỗi
                    </span>
                    <Link
                        href={buildMistakesHref(DEFAULT_MISTAKE_QUERY)}
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
            <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                <MistakesSearchInput query={query} className="sm:col-span-2" />
                <MistakesParamSelect
                    query={query}
                    name="criterion"
                    options={CRITERION_OPTIONS}
                    label="Lọc theo tiêu chí chấm"
                    className={SELECT_CLASS}
                />
                <MistakesParamSelect
                    query={query}
                    name="sort"
                    options={SORT_OPTIONS}
                    label="Sắp xếp danh sách lỗi"
                    className={SELECT_CLASS}
                />
            </div>

            {/* Status pills */}
            <nav aria-label="Lọc theo trạng thái" className="flex flex-wrap items-center gap-2 text-xs">
                <span className="mr-1 font-semibold text-main">Trạng thái:</span>
                {STATUS_OPTIONS.map(({ value, label }) => {
                    const isActive = query.status === value;
                    return (
                        <Link
                            key={value}
                            href={buildMistakesHref(query, { status: value })}
                            scroll={false}
                            aria-current={isActive ? 'true' : undefined}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-xs transition-colors duration-200',
                                FOCUS_RING_CLASS,
                                isActive ? 'bg-main font-semibold text-sub1' : 'bg-sub1 text-main hover:bg-sub2 hover:text-sub1',
                            )}
                        >
                            {label}
                            <span className="opacity-70 tabular-nums">{getStatusCount(value, summary)}</span>
                        </Link>
                    );
                })}
            </nav>
        </section>
    );
}
