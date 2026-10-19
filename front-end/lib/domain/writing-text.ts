// Đếm chữ trong bài Writing, dùng chung cho phòng thi (hiển thị) và khâu chấm (gửi kèm cho LLM).
import type { RequiredKeyword } from './types';

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
