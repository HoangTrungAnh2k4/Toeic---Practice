export type ExamSkill = 'speaking' | 'writing' | 'combo';

export type ExamStatus = 'published' | 'review' | 'draft';

export type ExamSource = 'study4' | 'ets';

export type LibraryTab = 'all' | ExamSkill;

export type StatusFilter = 'all' | ExamStatus;

export type SourceFilter = 'all' | ExamSource;

export type ParseStatus = 'idle' | 'parsing' | 'success' | 'error';

export interface Option<T extends string> {
    value: T;
    label: string;
}

export interface ExamRecord {
    id: string;
    title: string;
    edition: string;
    skill: ExamSkill;
    questionCount: number;
    durationMinutes: number;
    source: ExamSource;
    sourceNote: string;
    isVerified: boolean;
    attempts: number;
    /** Tỷ lệ hoàn thành (%). `null` khi đề chưa mở công khai. */
    completionRate: number | null;
    status: ExamStatus;
}

export interface StudioQuestion {
    id: string;
    number: number;
    prompt: string;
    responseSeconds: number;
    audioReady: boolean;
    /** Mô tả ảnh minh họa (Part 2). */
    media?: string;
    sampleAnswer?: string;
    hint?: string;
}

export interface StudioPart {
    id: string;
    code: string;
    title: string;
    summary: string;
    description: string;
    timing: string;
    contextLabel?: string;
    context?: string;
    promptLabel: string;
    questions: StudioQuestion[];
}

export interface StudioExam {
    id: string;
    title: string;
    sourceLabel: string;
    updatedLabel: string;
    questionCount: number;
    parseSummary: string;
    parts: StudioPart[];
}

/** Phần nội dung có thể biên tập của một Part. */
export interface PartContent {
    context: string;
    prompts: string[];
}

export type PartContentMap = Record<string, PartContent>;
