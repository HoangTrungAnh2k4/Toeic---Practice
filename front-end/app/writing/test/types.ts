export interface RequiredKeyword {
    /** Dạng gốc hiển thị cho thí sinh. */
    word: string;
    /** Các biến thể được chấp nhận (chia thì, số nhiều...). */
    forms: string[];
}

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
