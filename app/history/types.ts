export type SkillType = 'all' | 'speaking' | 'writing' | 'full_mock';

export type ExamModeType = 'all' | 'cbt' | 'timed' | 'guided';

export type CategoryFilterType = 'all' | 'fresh' | 'retake' | 'sample_viewed' | 'independent';

export type StatusFilterType = 'all' | 'completed' | 'scoring' | 'sync_pending' | 'interrupted';

export type DateScopeType = '7d' | '30d' | 'this_month' | 'custom';

export type StorageType = 'cloud' | 'sync_pending' | 'local_cache';

export interface Option<T extends string | number> {
    value: T;
    label: string;
}

export interface KpiMetricItem {
    id: string;
    title: string;
    value: string | number;
    subValue?: string;
    badgeText?: string;
    badgeVariant?: 'primary' | 'secondary' | 'warning' | 'neutral';
    icon: string;
    footerContent?: React.ReactNode;
}

export interface AttemptScore {
    score?: number;
    maxScore: number;
    level?: string;
    feedbackSummary?: string;
    scoringProgress?: number;
    isScoring?: boolean;
    estimatedTimeRemaining?: string;
    isInterrupted?: boolean;
    interruptedReason?: string;
    retakeComparison?: string;
}

export interface HistoryAttempt {
    id: string;
    code: string;
    title: string;
    part: string;
    topic: string;
    skill: 'speaking' | 'writing' | 'full_mock';
    mode: string;
    modeType: 'cbt' | 'timed' | 'guided';
    categoryBadge: string;
    assistBadge: string;
    hasSampleViewed?: boolean;
    scoreInfo: AttemptScore;
    submittedAt: string;
    duration: string;
    storage: StorageType;
    actionText: string;
    isWarningRow?: boolean;
    isPendingRow?: boolean;
}

/** Toàn bộ trạng thái lọc & phân trang, được đồng bộ với URL search params. */
export interface HistoryQuery {
    skill: SkillType;
    searchQuery: string;
    mode: ExamModeType;
    category: CategoryFilterType;
    status: StatusFilterType;
    dateScope: DateScopeType;
    page: number;
    pageSize: number;
}

export interface HistoryAttemptPage {
    items: HistoryAttempt[];
    total: number;
    page: number;
    totalPages: number;
}
