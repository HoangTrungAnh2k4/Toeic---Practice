'use client';

import { LuRotateCcw, LuSearch } from 'react-icons/lu';
import { SegmentedTabs } from '@/components/segmented-tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const SELECT_TRIGGER_CLASS =
    'bg-white px-3 border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 w-full data-[size=default]:h-10 font-medium text-main text-xs cursor-pointer';

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
                <SegmentedTabs
                    options={LIBRARY_TABS}
                    value={filters.tab}
                    onChange={(tab) => onChange({ tab })}
                    counts={tabCounts}
                    ariaLabel="Lọc theo kỹ năng"
                />

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
                <Select
                    items={STATUS_FILTER_OPTIONS}
                    value={filters.status}
                    onValueChange={(status) => onChange({ status: status as StatusFilter })}
                >
                    <SelectTrigger aria-label="Lọc theo trạng thái" className={SELECT_TRIGGER_CLASS}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_FILTER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    items={SOURCE_FILTER_OPTIONS}
                    value={filters.source}
                    onValueChange={(source) => onChange({ source: source as SourceFilter })}
                >
                    <SelectTrigger aria-label="Lọc theo nguồn dữ liệu" className={SELECT_TRIGGER_CLASS}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SOURCE_FILTER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
