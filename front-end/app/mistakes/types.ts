import type { IconType } from 'react-icons';
import type {
    Annotation,
    Criterion,
    MistakePattern,
    MistakeRemedy,
    MistakeStatus,
    Severity,
    Skill,
} from '@/lib/domain/types';

export type { Criterion, MistakeRemedy, MistakeStatus, Severity };

export type MistakeSkill = Skill;

export interface Option<T extends string | number> {
    value: T;
    label: string;
}

/** Mẫu lỗi (row `mistake_patterns`) kèm nhãn phạm vi suy ra từ `part_template_id`. */
export interface MistakeDefinition extends MistakePattern {
    /** "Q3-4"; mẫu lỗi áp dụng mọi Part thì là cả dải câu của kỹ năng. */
    partLabel: string;
    task: string;
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
export interface MistakeEvidence {
    attemptId: string;
    code: string;
    attemptTitle: string;
    submittedAt: string;
    assisted: boolean;
    question: number;
    annotation: Annotation;
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
