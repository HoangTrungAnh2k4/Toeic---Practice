import type { ExamSource, ExamStats, ExamStatus, Skill } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';

export type { ExamSource, ExamStatus };

export type ExamSkill = Skill;

export type LibraryTab = 'all' | ExamSkill;

export type StatusFilter = 'all' | ExamStatus;

export type SourceFilter = 'all' | ExamSource;

export interface Option<T extends string> {
    value: T;
    label: string;
}

/** Một dòng trong thư viện đề: đề kèm số câu, thời lượng và thống kê lượt làm. */
export interface ExamLibraryItem extends ExamSummary {
    /** `null` khi đề chưa có lượt làm nào (chưa phát hành). */
    stats: ExamStats | null;
}
