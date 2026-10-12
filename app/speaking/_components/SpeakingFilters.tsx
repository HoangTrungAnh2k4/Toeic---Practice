import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LuBookmark, LuLayers, LuMonitor, LuRotateCcw } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { buildSpeakingHref, DEFAULT_SPEAKING_QUERY } from '../_lib/searchParams';
import { SpeakingQuery, SpeakingTabType } from '../types';
import { STATUS_OPTIONS, TAB_OPTIONS, TARGET_OPTIONS, TOPIC_OPTIONS } from '../utils';
import SpeakingParamSelect from './SpeakingParamSelect';
import SpeakingSearchInput from './SpeakingSearchInput';

interface SpeakingFiltersProps {
    query: SpeakingQuery;
    tabCounts: Record<SpeakingTabType, number>;
    displayedCount: number;
}

const SELECT_CLASS =
    'bg-white px-3 border border-sub2/40 focus:border-main rounded-lg w-full h-10 font-medium text-main text-xs transition-colors';

const FOCUS_RING_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3';

const TAB_ICONS: Partial<Record<SpeakingTabType, IconType>> = {
    cbt: LuMonitor,
    by_part: LuLayers,
    retake: LuRotateCcw,
    bookmark: LuBookmark,
};

const SELECT_FILTERS = [
    { name: 'target', label: 'Lọc theo mục tiêu điểm', options: TARGET_OPTIONS },
    { name: 'status', label: 'Lọc theo trạng thái', options: STATUS_OPTIONS },
    { name: 'topic', label: 'Lọc theo chủ đề', options: TOPIC_OPTIONS },
] as const;

export default function SpeakingFilters({ query, tabCounts, displayedCount }: SpeakingFiltersProps) {
    return (
        <section
            aria-label="Bộ lọc thư viện đề Speaking"
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
                                href={buildSpeakingHref(query, { tab: value })}
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
                        href={buildSpeakingHref(DEFAULT_SPEAKING_QUERY)}
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
                <SpeakingSearchInput query={query} className="sm:col-span-3 xl:col-span-2" />
                {SELECT_FILTERS.map((filter) => (
                    <SpeakingParamSelect
                        key={filter.name}
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
