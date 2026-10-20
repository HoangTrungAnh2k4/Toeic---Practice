import type { IconType } from 'react-icons';
import type { Attempt, Exam } from '@/lib/domain/types';

/** Row `exams` kèm các giá trị tính từ Part của đề. */
export interface ExamSummary extends Exam {
    questionCount: number;
    partCount: number;
    durationMin: number;
}

/** Tiến độ của người dùng với một đề, suy ra từ các attempt. */
export type ExamProgress = 'not_started' | 'in_progress' | 'completed';

export interface UserExamState {
    progress: ExamProgress;
    /** Số lượt đã nộp bài. */
    completedCount: number;
    /** Lượt đang làm dở (nếu có). */
    inProgress: Attempt | null;
    /** Số câu đã trả lời trong lượt đang làm dở. */
    answeredCount: number;
    /** Lượt đã nộp gần nhất. */
    lastCompleted: Attempt | null;
    bookmarked: boolean;
}

export interface LibraryEntry {
    exam: ExamSummary;
    user: UserExamState;
}

export type LibraryTab = 'all' | 'retake' | 'bookmark';

export type ProgressFilter = 'all' | ExamProgress;

export type Topic = 'office' | 'customer' | 'retail' | 'travel' | 'tech' | 'logistics' | 'strategy';

export type TopicFilter = 'all' | Topic;

/** Toàn bộ trạng thái lọc & phân trang của thư viện đề, đồng bộ với URL search params. */
export interface LibraryQuery {
    tab: LibraryTab;
    searchQuery: string;
    status: ProgressFilter;
    topic: TopicFilter;
    page: number;
}

export interface Option<T extends string | number> {
    value: T;
    label: string;
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
