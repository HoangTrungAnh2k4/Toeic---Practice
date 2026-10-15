import type { IconType } from 'react-icons';

export type SpeakingTabType = 'all' | 'cbt' | 'by_part' | 'retake' | 'bookmark';

export type TargetFilterType = 'all' | 'level_5' | 'level_6_7' | 'level_8';

export type TestStatusFilterType = 'all' | 'not_started' | 'in_progress' | 'completed';

export type TopicFilterType = 'all' | 'office' | 'customer' | 'retail' | 'travel' | 'tech';

export interface Option<T extends string | number> {
    value: T;
    label: string;
}

export type BadgeTone = 'main' | 'sub2' | 'sub3' | 'neutral';

interface SpeakingTestBase {
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
export interface FreshSpeakingTest extends SpeakingTestBase {
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

export interface AttemptedSpeakingTest extends SpeakingTestBase {
    kind: 'attempted';
    attemptCount: number;
    lastAttemptAt: string;
    score: number;
    level: string;
    weakness: string;
    aiNote: string;
    metrics: { label: string; value: string }[];
}

export interface InProgressSpeakingTest extends SpeakingTestBase {
    kind: 'in_progress';
    stoppedAt: string;
    savedNote: string;
    answered: number;
    totalQuestions: number;
    timeRemaining: string;
}

export interface GuidedSpeakingTest extends SpeakingTestBase {
    kind: 'guided';
    features: string[];
    summary: string;
    statusLabel: string;
}

export type SpeakingTest = FreshSpeakingTest | AttemptedSpeakingTest | InProgressSpeakingTest | GuidedSpeakingTest;

/** Toàn bộ trạng thái lọc & phân trang, được đồng bộ với URL search params. */
export interface SpeakingQuery {
    tab: SpeakingTabType;
    searchQuery: string;
    target: TargetFilterType;
    status: TestStatusFilterType;
    topic: TopicFilterType;
    page: number;
}

export interface SpeakingTestPage {
    items: SpeakingTest[];
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
    questions: string;
    task: string;
    description: string;
    prepTime: string;
    responseTime: string;
    criteria: string;
}
