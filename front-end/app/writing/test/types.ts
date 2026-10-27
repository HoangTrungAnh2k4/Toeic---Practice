export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ExamSection {
    id: string;
    label: string;
    range: string;
}
