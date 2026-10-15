import type { Annotation, Attempt, AttemptResponse, PartTemplate, Question, Skill } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';

export type SkillType = 'all' | Skill;
export type ExamModeType = 'all' | Attempt['mode'];
export type CategoryFilterType = 'all' | 'fresh' | 'retake' | 'sample_viewed' | 'independent';
export type StatusFilterType = 'all' | 'scored' | 'pending' | 'in_progress' | 'interrupted';
export type DateScopeType = 'all' | '7d' | '30d' | 'this_month';

export interface Option<T extends string | number> {
    value: T;
    label: string;
}

/** Một lượt làm bài kèm đề và các giá trị suy ra từ lịch sử của người dùng. */
export interface HistoryRow {
    attempt: Attempt;
    exam: ExamSummary;
    /** Lần làm thứ mấy của đề, đếm từ 1 theo thời gian bắt đầu. */
    attemptNo: number;
    /** Chênh điểm so với lượt đã chấm liền trước của cùng đề; `null` khi không có để so. */
    scoreDelta: number | null;
    /** Số câu thuộc phạm vi lượt làm (cả đề hoặc một Part). */
    questionCount: number;
    /** Số câu đã có câu trả lời. */
    answeredCount: number;
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

export interface HistoryRowPage {
    items: HistoryRow[];
    total: number;
    page: number;
    totalPages: number;
}

export interface HistoryKpis {
    total: number;
    thisWeek: number;
    bySkill: Record<Skill, number>;
    /** Điểm trung bình các lượt đã chấm theo kỹ năng; `null` khi chưa có lượt nào. */
    avgScore: Record<Skill, number | null>;
    /** Lượt đã nộp không xem bài mẫu / tổng lượt đã nộp. */
    independent: { count: number; total: number };
    pendingCount: number;
    inProgressCount: number;
    interruptedCount: number;
}

/** Một câu trong bài làm, kèm câu trả lời và nhận xét. */
export interface ReviewQuestion {
    question: Question;
    template: PartTemplate;
    /** Ngữ liệu chung của cả cụm câu (`exam_parts.context`). */
    context: string | null;
    response: AttemptResponse | null;
    annotations: Annotation[];
}
