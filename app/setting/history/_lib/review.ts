import { AttemptReview } from '../types';
import { MOCK_ATTEMPTS } from '../utils';
import { MOCK_REVIEWS } from './reviews';

// TODO: thay bằng API chi tiết lượt làm bài.
/** Lượt làm bài kèm nội dung từng câu và nhận xét; `null` nếu không tồn tại. */
export async function getAttemptReview(id: string): Promise<AttemptReview | null> {
    const attempt = MOCK_ATTEMPTS.find((item) => item.id === id);
    return attempt ? { attempt, questions: MOCK_REVIEWS[id] ?? [] } : null;
}
