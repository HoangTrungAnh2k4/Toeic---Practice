import type { Attempt, PartTemplate } from '@/lib/domain/types';
import { ExamSection } from './types';

export { countSentences, countWords, findKeywordUsage } from '@/lib/domain/writing-text';

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
 * Mốc hết giờ (ms) của câu thứ `index` trong Part bắt đầu lúc `partStartedAt`, `null` khi không giới hạn giờ.
 * Part dùng chung đồng hồ (Q1-5) hết sau `section_sec`; Part tính giờ từng câu (Q6-7) hết lần lượt sau `response_sec`
 * cộng dồn. Luyện lẻ một Part còn bị chặn bởi `ends_at` do DB đặt; lượt cả đề có `ends_at = null`.
 * shortcut: chuyển câu sớm thì câu sau được dùng cả phần giờ còn lại của câu trước (ETS thì mất phần giờ đó);
 * cần lưu mốc bắt đầu từng câu nếu muốn khớp ETS.
 */
export function getQuestionDeadline(
    attempt: Attempt,
    template: PartTemplate,
    index: number,
    partStartedAt: number,
): number | null {
    if (attempt.mode === 'guided') return null;
    const sec = template.response_sec?.slice(0, index + 1).reduce((sum, item) => sum + item, 0) ?? template.section_sec;
    if (sec === null) return null;
    const deadline = partStartedAt + sec * 1000;
    return attempt.ends_at ? Math.min(Date.parse(attempt.ends_at), deadline) : deadline;
}

