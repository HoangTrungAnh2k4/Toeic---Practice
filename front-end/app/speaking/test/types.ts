/** Một ô trong dãy tiến độ câu hỏi. */
export interface ProgressQuestion {
    number: number;
    task: string;
}

/** Giai đoạn của một câu: chuẩn bị (chưa ghi âm) → trả lời (ghi âm) → đã chốt bài nói. */
export type SpeakingPhase = 'prep' | 'speak' | 'done';
