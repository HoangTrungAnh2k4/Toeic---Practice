export type QuestionStatus = 'completed' | 'active' | 'locked';

export type ExamPhase = 'instructions' | 'preparation' | 'recording' | 'submitted';

export interface QuestionInfo {
    id: number;
    title: string;
    description: string;
    status: QuestionStatus;
}
