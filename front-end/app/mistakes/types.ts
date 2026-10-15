import type { IconType } from 'react-icons';
import type { Criterion, MistakeRemedy, Severity, Skill } from '@/lib/domain/types';

export type { Criterion, MistakeRemedy, Severity };

export type MistakeSkill = Skill;

/**
 * Trạng thái được TÍNH TỰ ĐỘNG từ các bài gần nhất, người học không tự đánh dấu:
 * - active: lặp lại ở bài gần nhất trong phạm vi.
 * - improving: đã có ít nhất 1 bài độc lập liên tiếp không lặp lại.
 * - resolved: đủ RESOLVE_STREAK bài độc lập liên tiếp không lặp lại.
 */
export type MistakeStatus = 'active' | 'improving' | 'resolved';

export interface Option<T extends string | number> {
    value: T;
    label: string;
}

/** Định nghĩa một mẫu lỗi lặp lại (thứ xuất hiện trong sổ lỗi). */
export interface MistakeDefinition {
    id: string;
    skill: MistakeSkill;
    /** Phạm vi câu hỏi áp dụng — dùng để xác định bài nào được tính vào thống kê. */
    questions: number[];
    partLabel: string;
    task: string;
    title: string;
    summary: string;
    /** Vì sao bị trừ điểm, giải thích theo rubric. */
    why: string;
    criteria: Criterion[];
    severity: Severity;
    impact: string;
    remedy: MistakeRemedy;
}

/** Một bài nằm trong cửa sổ theo dõi của mẫu lỗi. */
export interface MistakeCheck {
    attemptId: string;
    code: string;
    title: string;
    submittedAt: string;
    hit: boolean;
    /** Có xem bài mẫu → không được tính là bằng chứng đã khắc phục. */
    assisted: boolean;
}

export interface MistakeItem extends MistakeDefinition {
    status: MistakeStatus;
    frequency: { hit: number; total: number };
    /** Số bài độc lập liên tiếp gần nhất không lặp lại lỗi. */
    cleanStreak: number;
    occurrenceCount: number;
    lastSeen?: { attemptId: string; code: string; submittedAt: string };
    priority: number;
}

/** Một lần mắc lỗi cụ thể, trích từ bài làm. */
export interface ResponseAnnotation {
    id: string;
    /** Thuộc mẫu lỗi trong sổ lỗi; bỏ trống = lỗi đơn lẻ, chưa đủ lặp lại để theo dõi. */
    mistakeId?: string;
    /** Trích nguyên văn trong câu trả lời — phải khớp chính xác để tô sáng. */
    quote: string;
    correction: string;
    explanation: string;
    criterion: Criterion;
    severity: Severity;
    /** Mốc giây trong bản ghi âm (chỉ Speaking). */
    at?: number;
}

export interface MistakeEvidence {
    attemptId: string;
    code: string;
    attemptTitle: string;
    submittedAt: string;
    assisted: boolean;
    question: number;
    annotation: ResponseAnnotation;
}

export interface MistakeDetail extends MistakeItem {
    window: MistakeCheck[];
    evidence: MistakeEvidence[];
    related: MistakeItem[];
}

export type MistakeSkillFilter = 'all' | MistakeSkill;
export type MistakeStatusFilter = 'open' | MistakeStatus | 'all';
export type MistakeCriterionFilter = 'all' | Criterion;
export type MistakeSort = 'priority' | 'frequency' | 'recent';

/** Toàn bộ trạng thái lọc của sổ lỗi, đồng bộ với URL search params. */
export interface MistakeQuery {
    skill: MistakeSkillFilter;
    status: MistakeStatusFilter;
    criterion: MistakeCriterionFilter;
    sort: MistakeSort;
    searchQuery: string;
}

export interface MistakeSummary {
    total: number;
    byStatus: Record<MistakeStatus, number>;
    bySkill: Record<MistakeSkillFilter, number>;
    /** Tiêu chí có nhiều lần lặp lại nhất trong các lỗi chưa khắc phục. */
    weakestCriterion?: { criterion: Criterion; count: number; hits: number };
    analyzedAttempts: number;
    scoringAttempts: number;
    interruptedAttempts: number;
}

export interface StatusMeta {
    label: string;
    description: string;
    Icon: IconType;
    className: string;
}
