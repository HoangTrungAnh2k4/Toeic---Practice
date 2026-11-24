// Đếm chữ trong bài Writing, dùng chung cho phòng thi (hiển thị) và khâu chấm (gửi kèm cho LLM).

/**
 * Độ dài tối đa một câu trả lời (bài luận Q8 ~300–500 từ), chặn bài dài bất thường để khỏi đốt token của key chấm dùng
 * chung. Khớp check `responses_text_answer_length` trên DB (migration 20261126000000).
 */
export const MAX_ANSWER_CHARS = 8000;

export function countWords(text: string): number {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Đếm số câu dựa trên dấu kết thúc câu — dùng để cảnh báo viết quá 1 câu ở Part 1. */
export function countSentences(text: string): number {
    return text.split(/[.!?]+(?=\s|$)/).filter((part) => part.trim()).length;
}
