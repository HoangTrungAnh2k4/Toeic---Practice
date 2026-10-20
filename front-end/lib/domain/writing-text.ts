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

const toPattern = (phrase: string) => escapeRegExp(phrase).replace(/\s+/g, '\\s+');

/**
 * Dạng từ khóa thí sinh đã dùng, hoặc `null` nếu chưa thấy — chỉ để gợi ý trong phòng thi, điểm do AI chấm.
 * shortcut: từ gốc chỉ khớp thêm hậu tố (desk → desks, carry → carrying); "carried", "making" chỉ khớp khi có trong `forms`.
 */
export function findKeywordUsage(text: string, keyword: RequiredKeyword): string | null {
    const patterns = [...keyword.forms.map((form) => `${toPattern(form)}\\b`), `${toPattern(keyword.word)}\\w*`];
    for (const pattern of patterns) {
        const match = text.match(new RegExp(`\\b${pattern}`, 'i'));
        if (match) return match[0];
    }
    return null;
}
