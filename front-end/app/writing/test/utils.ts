import { ExamSection, RequiredKeyword } from './types';

export const TIME_WARNING_SECONDS = 60;

export const TOTAL_EXAM_QUESTIONS = 8;

export const OPTIMAL_WORD_RANGE = { min: 12, max: 25 } as const;

export const EXAM_SECTIONS: ExamSection[] = [
    { id: 'picture', label: 'Viết câu theo tranh', range: 'Q1–5' },
    { id: 'email', label: 'Phản hồi Email', range: 'Q6–7' },
    { id: 'essay', label: 'Bài luận quan điểm', range: 'Q8' },
];

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function countWords(text: string): number {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Đếm số câu dựa trên dấu kết thúc câu — dùng để cảnh báo viết quá 1 câu ở Part 1. */
export function countSentences(text: string): number {
    return text.split(/[.!?]+(?=\s|$)/).filter((part) => part.trim()).length;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Trả về dạng từ khóa thí sinh đã dùng, hoặc `null` nếu chưa xuất hiện. */
export function findKeywordUsage(text: string, keyword: RequiredKeyword): string | null {
    for (const form of keyword.forms) {
        const pattern = new RegExp(`\\b${escapeRegExp(form).replace(/\s+/g, '\\s+')}\\b`, 'i');
        const match = text.match(pattern);
        if (match) return match[0];
    }
    return null;
}
