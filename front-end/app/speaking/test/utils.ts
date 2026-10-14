import { QuestionInfo } from './types';

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const SPEAKING_QUESTIONS: QuestionInfo[] = [
    { id: 1, title: 'Read a text aloud', description: 'Đã hoàn thành', status: 'completed' },
    { id: 2, title: 'Read a text aloud', description: 'Đã hoàn thành', status: 'completed' },
    { id: 3, title: 'Describe a picture', description: 'Đang làm', status: 'active' },
    { id: 4, title: 'Respond to questions', description: 'Chưa tới', status: 'locked' },
    { id: 5, title: 'Respond to questions', description: 'Chưa tới', status: 'locked' },
    { id: 6, title: 'Respond to questions', description: 'Chưa tới', status: 'locked' },
    { id: 7, title: 'Respond to questions using information provided', description: 'Chưa tới', status: 'locked' },
    { id: 8, title: 'Respond to questions using information provided', description: 'Chưa tới', status: 'locked' },
    { id: 9, title: 'Respond to questions using information provided', description: 'Chưa tới', status: 'locked' },
    { id: 10, title: 'Propose a solution', description: 'Chưa tới', status: 'locked' },
    { id: 11, title: 'Express an opinion', description: 'Chưa tới', status: 'locked' },
];
