import { getPartTemplates } from '@/lib/domain/parts';
import { QuestionInfo, QuestionStatus } from './types';

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const STATUS_DESCRIPTION: Record<QuestionStatus, string> = {
    completed: 'Đã hoàn thành',
    active: 'Đang làm',
    locked: 'Chưa tới',
};

// TODO: câu đang làm lấy từ attempt thật; tạm cố định ở Q3 để demo.
const MOCK_ACTIVE_QUESTION = 3;

export const SPEAKING_QUESTIONS: QuestionInfo[] = getPartTemplates('speaking').flatMap((part) =>
    Array.from({ length: part.q_to - part.q_from + 1 }, (_, offset) => {
        const id = part.q_from + offset;
        const status: QuestionStatus =
            id < MOCK_ACTIVE_QUESTION ? 'completed' : id === MOCK_ACTIVE_QUESTION ? 'active' : 'locked';
        return { id, title: part.task, description: STATUS_DESCRIPTION[status], status };
    }),
);
