import type { IconType } from 'react-icons';

export type WritingTabType = 'all' | 'cbt' | 'by_part' | 'retake' | 'bookmark';

export type TargetFilterType = 'all' | 'level_5_6' | 'level_7_8' | 'level_8_max';

export type TestStatusFilterType = 'all' | 'not_started' | 'in_progress' | 'completed';

export type TopicFilterType = 'all' | 'customer' | 'office' | 'logistics' | 'strategy';

export interface Option<T extends string | number> {
    value: T;
    label: string;
}

export type BadgeTone = 'main' | 'sub2' | 'sub3' | 'neutral';

interface WritingTestBase {
    id: string;
    code: string;
    title: string;
    topic: Exclude<TopicFilterType, 'all'>;
    target: Exclude<TargetFilterType, 'all'>;
    isCbt: boolean;
    supportsPartPractice: boolean;
    isBookmarked: boolean;
}

/** Đề chưa làm: đề mới, đề chuẩn ETS, đề nâng cao. */
export interface FreshWritingTest extends WritingTestBase {
    kind: 'fresh';
    badge: string;
    badgeTone: BadgeTone;
    highlight: string;
    highlightType: 'cbt' | 'difficulty';
    tags: string[];
    description: string;
    summary: string;
    statusLabel: string;
    isRecommended?: boolean;
}

export interface AttemptedWritingTest extends WritingTestBase {
    kind: 'attempted';
    attemptCount: number;
    lastAttemptAt: string;
    score: number;
    level: string;
    weakness: string;
    aiNote: string;
    metrics: { label: string; value: string }[];
}

export interface InProgressWritingTest extends WritingTestBase {
    kind: 'in_progress';
    stoppedAt: string;
    savedNote: string;
    answered: number;
    totalQuestions: number;
    timeRemaining: string;
}

export interface GuidedWritingTest extends WritingTestBase {
    kind: 'guided';
    features: string[];
    summary: string;
    statusLabel: string;
}

export type WritingTest = FreshWritingTest | AttemptedWritingTest | InProgressWritingTest | GuidedWritingTest;

/** Toàn bộ trạng thái lọc & phân trang, được đồng bộ với URL search params. */
export interface WritingQuery {
    tab: WritingTabType;
    searchQuery: string;
    target: TargetFilterType;
    status: TestStatusFilterType;
    topic: TopicFilterType;
    page: number;
}

export interface WritingTestPage {
    items: WritingTest[];
    total: number;
    page: number;
    totalPages: number;
}

export interface StrategyTip {
    icon: IconType;
    title: string;
    description: string;
}

export interface PartStrategy {
    part: string;
    timing: string;
    tips: StrategyTip[];
    formula: string;
}

export interface RubricPart {
    part: string;
    timing: string;
    task: string;
    prompt: string;
    requirement: string;
    criteria: string;
}
