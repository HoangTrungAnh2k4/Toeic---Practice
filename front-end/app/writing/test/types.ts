import type { RequiredKeyword } from '@/lib/domain/types';

export type { RequiredKeyword };

export interface PictureQuestion {
    id: number;
    imageUrl: string;
    imageAlt: string;
    keywords: [RequiredKeyword, RequiredKeyword];
}

export type KeywordStatus = 'complete' | 'partial' | 'none';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface WritingDraft {
    answers: string[];
    endsAt: number;
}

export interface ExamSection {
    id: string;
    label: string;
    range: string;
}
