import type { RequiredKeyword } from '@/lib/domain/types';

export type { RequiredKeyword };

export type KeywordStatus = 'complete' | 'partial' | 'none';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ExamSection {
    id: string;
    label: string;
    range: string;
}
