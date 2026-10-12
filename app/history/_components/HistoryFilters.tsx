'use client';

import {
    LuCalendar,
    LuClipboardList,
    LuMic,
    LuPenLine,
    LuRotateCcw,
    LuSearch,
} from 'react-icons/lu';
import { CategoryFilterType, ExamModeType, SkillType, StatusFilterType } from '../types';
import { DATE_SCOPE_OPTIONS, SKILL_TABS } from '../utils';

interface HistoryFiltersProps {
    selectedSkill: SkillType;
    onSkillChange: (skill: SkillType) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedMode: ExamModeType;
    onModeChange: (mode: ExamModeType) => void;
    selectedCategory: CategoryFilterType;
    onCategoryChange: (cat: CategoryFilterType) => void;
    selectedStatus: StatusFilterType;
    onStatusChange: (status: StatusFilterType) => void;
    selectedDateScope: string;
    onDateScopeChange: (scope: string) => void;
    displayedCount: number;
    totalCount: number;
    onResetFilters: () => void;
}

export default function HistoryFilters({
    selectedSkill,
    onSkillChange,
    searchQuery,
    onSearchChange,
    selectedMode,
    onModeChange,
    selectedCategory,
    onCategoryChange,
    selectedStatus,
    onStatusChange,
    selectedDateScope,
    onDateScopeChange,
    displayedCount,
    totalCount,
    onResetFilters,
}: HistoryFiltersProps) {
    const getSkillIcon = (id: SkillType) => {
        switch (id) {
            case 'speaking':
                return <LuMic className="size-4 text-primary" aria-hidden="true" />;
            case 'writing':
                return <LuPenLine className="size-4 text-emerald-600" aria-hidden="true" />;
            case 'full_mock':
                return <LuClipboardList className="size-4 text-amber-600" aria-hidden="true" />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            {/* Primary Skill Tabs & Filter Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex flex-wrap items-center gap-2">
                    {SKILL_TABS.map((tab) => {
                        const isActive = selectedSkill === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onSkillChange(tab.id)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'bg-muted text-foreground hover:bg-accent'
                                }`}
                            >
                                {!isActive && getSkillIcon(tab.id)}
                                <span>
                                    {tab.label} ({tab.count})
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                        Hiển thị <strong className="font-semibold text-foreground">{displayedCount}</strong> /{' '}
                        {totalCount} lượt làm bài
                    </span>
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                        <LuRotateCcw className="size-3.5" aria-hidden="true" />
                        <span>Đặt lại bộ lọc</span>
                    </button>
                </div>
            </div>

            {/* Secondary Multi-faceted Filters Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                {/* Search Input */}
                <div className="relative lg:col-span-2">
                    <LuSearch
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm theo mã ID, tên Test, task (ví dụ: Test 04, Essay)..."
                        className="w-full rounded-lg border border-border bg-muted py-2 pr-3 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                {/* Mode Select */}
                <div>
                    <select
                        value={selectedMode}
                        onChange={(e) => onModeChange(e.target.value as ExamModeType)}
                        className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="all">Chế độ: Tất cả chế độ</option>
                        <option value="cbt">Thi thử chuẩn (CBT Mode)</option>
                        <option value="timed">Luyện có thời gian</option>
                        <option value="guided">Học có hướng dẫn</option>
                    </select>
                </div>

                {/* Question Origin / Retake Select */}
                <div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value as CategoryFilterType)}
                        className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="all">Phân loại: Đề & Trợ giúp</option>
                        <option value="fresh">Đề mới (Chưa gặp)</option>
                        <option value="retake">Làm lại (Retake)</option>
                        <option value="sample_viewed">Đã xem mẫu gợi ý</option>
                        <option value="independent">Độc lập hoàn toàn</option>
                    </select>
                </div>

                {/* Evaluation & Sync State Select */}
                <div>
                    <select
                        value={selectedStatus}
                        onChange={(e) => onStatusChange(e.target.value as StatusFilterType)}
                        className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="all">Trạng thái: Tất cả</option>
                        <option value="completed">Đã hoàn thành & Chấm điểm</option>
                        <option value="scoring">Đang chờ AI chấm</option>
                        <option value="sync_pending">Chờ đồng bộ cục bộ</option>
                        <option value="interrupted">Bị gián đoạn</option>
                    </select>
                </div>
            </div>

            {/* Quick Date Scope Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Khoảng thời gian:</span>
                {DATE_SCOPE_OPTIONS.map((scope) => {
                    const isSelected = selectedDateScope === scope.id;
                    return (
                        <button
                            key={scope.id}
                            type="button"
                            onClick={() => onDateScopeChange(scope.id)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                                isSelected
                                    ? 'bg-primary/10 font-semibold text-primary'
                                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                            }`}
                        >
                            {scope.label}
                        </button>
                    );
                })}
                <button
                    type="button"
                    onClick={() => onDateScopeChange('custom')}
                    className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                    <LuCalendar className="size-3.5" aria-hidden="true" />
                    <span>Tuỳ chọn ngày...</span>
                </button>
            </div>
        </div>
    );
}
