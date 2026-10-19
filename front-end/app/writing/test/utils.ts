import type { Attempt, PartTemplate } from '@/lib/domain/types';
import { ExamSection, RequiredKeyword } from './types';

export const TIME_WARNING_SECONDS = 60;

export const TOTAL_EXAM_QUESTIONS = 8;

export const OPTIMAL_WORD_RANGE = { min: 12, max: 25 } as const;

/** Số từ tối thiểu ETS khuyến nghị cho bài luận Part 3 (Q8). */
export const ESSAY_MIN_WORDS = 300;

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

/** Nhãn nhóm câu của Part, vd "Câu 1–5", "Câu 8". */
export function formatQuestionRange({ q_from, q_to }: PartTemplate): string {
    return q_from === q_to ? `Câu ${q_from}` : `Câu ${q_from}–${q_to}`;
}

/**
 * Mốc hết giờ (ms) của câu thứ `index` trong Part, `null` khi không giới hạn giờ.
 * Part dùng chung đồng hồ (Q1-5) hết cùng `ends_at`; Part tính giờ từng câu (Q6-7) hết lần lượt sau `response_sec`
 * cộng dồn từ lúc bắt đầu, không quá `ends_at` do DB đặt.
 * shortcut: chuyển câu sớm thì câu sau được dùng cả phần giờ còn lại của câu trước (ETS thì mất phần giờ đó);
 * cần lưu mốc bắt đầu từng câu nếu muốn khớp ETS.
 */
export function getQuestionDeadline(attempt: Attempt, template: PartTemplate, index: number): number | null {
    if (!attempt.ends_at) return null;
    const endsAt = Date.parse(attempt.ends_at);
    if (!template.response_sec) return endsAt;
    const elapsedSec = template.response_sec.slice(0, index + 1).reduce((sum, sec) => sum + sec, 0);
    return Math.min(endsAt, Date.parse(attempt.started_at) + elapsedSec * 1000);
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
