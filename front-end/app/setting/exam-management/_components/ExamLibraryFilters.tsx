'use client';

import { LuRotateCcw, LuSearch } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LibraryTab, SourceFilter, StatusFilter } from '../types';
import { ExamFilters, LIBRARY_TABS, SOURCE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../utils';

interface ExamLibraryFiltersProps {
    filters: ExamFilters;
    tabCounts: Record<LibraryTab, number>;
    resultCount: number;
    canReset: boolean;
    onChange: (patch: Partial<ExamFilters>) => void;
    onReset: () => void;
}

const SELECT_CLASS =
    'bg-white px-3 border border-sub2/40 focus:border-main rounded-lg w-full h-10 font-medium text-main text-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sub3/60';

const FOCUS_RING_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3';

export default function ExamLibraryFilters({
    filters,
    tabCounts,
    resultCount,
    canReset,
    onChange,
    onReset,
}: ExamLibraryFiltersProps) {
    return (
        <div className="flex flex-col gap-4 bg-white shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl">
            {/* Skill tabs & reset */}
            <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-sub2/20 border-b">
                <div role="group" aria-label="Lọc theo kỹ năng" className="flex flex-wrap gap-1 bg-main p-1 rounded-lg">
                    {LIBRARY_TABS.map(({ value, label }) => {
                        const isActive = filters.tab === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => onChange({ tab: value })}
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors duration-200 cursor-pointer',
                                    FOCUS_RING_CLASS,
                                    isActive ? 'bg-sub3 text-main' : 'text-white hover:bg-white/15',
                                )}
                            >
                                <span>{label}</span>
                                <span
                                    className={cn(
                                        'px-1.5 rounded-full font-semibold text-xs leading-4 tabular-nums',
                                        isActive ? 'bg-main text-sub3' : 'bg-white text-main',
                                    )}
                                >
                                    {tabCounts[value]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <span className="font-medium text-subText text-xs" aria-live="polite">
                        Tìm thấy <strong className="font-semibold text-main">{resultCount}</strong> / {tabCounts.all}{' '}
                        đề thi
                    </span>
                    <button
                        type="button"
                        onClick={onReset}
                        disabled={!canReset}
                        className={cn(
                            'inline-flex items-center gap-1.5 hover:bg-sub1 disabled:opacity-50 px-2.5 py-1.5 rounded-lg font-semibold text-main text-xs transition-colors cursor-pointer disabled:pointer-events-none',
                            FOCUS_RING_CLASS,
                        )}
                    >
                        <LuRotateCcw className="size-3.5" aria-hidden="true" />
                        <span>Đặt lại</span>
                    </button>
                </div>
            </div>

            {/* Search & dropdown filters */}
            <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                <div className="relative sm:col-span-2">
                    <LuSearch
                        className="top-1/2 left-3 absolute size-4 text-sub2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        value={filters.search}
                        onChange={(event) => onChange({ search: event.target.value })}
                        aria-label="Tìm kiếm đề thi"
                        placeholder="Tìm theo mã đề, tên đề, ghi chú nguồn..."
                        className="bg-sub1/50 focus-visible:bg-white pl-9 border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 h-10 text-main md:text-xs placeholder:text-sub2"
                    />
                </div>
                <select
                    value={filters.status}
                    onChange={(event) => onChange({ status: event.target.value as StatusFilter })}
                    aria-label="Lọc theo trạng thái"
                    className={SELECT_CLASS}
                >
                    {STATUS_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select
                    value={filters.source}
                    onChange={(event) => onChange({ source: event.target.value as SourceFilter })}
                    aria-label="Lọc theo nguồn dữ liệu"
                    className={SELECT_CLASS}
                >
                    {SOURCE_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
