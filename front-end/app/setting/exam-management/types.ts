import type { Exam, ExamSource, ExamStats, ExamStatus } from '@/lib/domain/types';

export type { ExamSource, ExamStatus };

/** Kỹ năng của đề, suy ra từ các Part: có cả Speaking lẫn Writing là `combo` (Full Test). */
export type ExamSkill = 'speaking' | 'writing' | 'combo';

export type LibraryTab = 'all' | ExamSkill;

export type StatusFilter = 'all' | ExamStatus;

export type SourceFilter = 'all' | ExamSource;

export interface Option<T extends string> {
    value: T;
    label: string;
}

/** Một dòng trong thư viện đề: row `exams` kèm các giá trị tính từ Part và thống kê. */
export interface ExamLibraryItem extends Exam {
    skill: ExamSkill;
    questionCount: number;
    durationMin: number;
    /** `null` khi đề chưa có lượt làm nào (chưa phát hành). */
    stats: ExamStats | null;
}
