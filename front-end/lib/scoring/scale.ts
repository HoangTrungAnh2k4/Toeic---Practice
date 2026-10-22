/**
 * Quy đổi điểm Speaking và Writing. Thuần, dùng chung cho route chấm
 * (server) và khách (client).
 */
import type { Attempt } from '@/lib/domain/types';

/** Điểm tối đa của câu theo ETS: câu 11 (nêu quan điểm) 0–5, còn lại 0–3. */
export const speakingMaxScore = (questionNumber: number) => (questionNumber === 11 ? 5 : 3);

export type ScoreError = 'daily_limit' | 'provider_limit' | 'scoring_failed';

/** Lý do chấm lỗi hiện cho người học (`attempts.scoring_error`). */
export const SCORE_ERROR_MESSAGE: Record<ScoreError, string> = {
    daily_limit: 'Hết lượt chấm hôm nay, hãy chấm lại vào ngày mai.',
    provider_limit: 'Hết lượt chấm miễn phí, hãy thử chấm lại sau.',
    scoring_failed: 'Chấm bài bị lỗi, hãy thử chấm lại.',
};

/** Lượt `scoring` lâu hơn mốc này coi như đã hỏng giữa chừng (route hết giờ/sập, khách đóng tab) → được chấm lại. */
export const SCORING_STALE_MS = 2 * 60_000;

/**
 * Bài đã nộp mà chưa có điểm được chấm lại khi chấm lỗi, hoặc đã quá `SCORING_STALE_MS` kể từ lúc bắt đầu chấm/nộp
 * (lượt chấm hỏng giữa chừng, khách đóng tab trước khi gửi). Chưa tới mốc đó thì coi như đang chấm: trang xem bài chờ.
 */
export function canRescore(
    attempt: Pick<Attempt, 'status' | 'scoring_error' | 'scoring_started_at' | 'submitted_at'>,
    now = Date.now(),
) {
    if (attempt.status !== 'submitted' && attempt.status !== 'scoring') return false;
    if (attempt.scoring_error) return true;
    const since = Date.parse(attempt.scoring_started_at ?? attempt.submitted_at ?? '');
    // Thiếu mốc thời gian (NaN) cũng cho chấm lại, không bắt chờ mãi
    return !(now - since < SCORING_STALE_MS);
}

/** Thang ETS của câu Writing: Q1-5 0–3, Q6-7 0–4, Q8 0–5. */
export const writingMaxScore = (questionNumber: number) => (questionNumber <= 5 ? 3 : questionNumber <= 7 ? 4 : 5);

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

export interface PronunciationScores {
    transcript: string;
    /** Các điểm 0–100 của Azure Pronunciation Assessment. */
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
}

export interface PronunciationSegment {
    text: string;
    words: number;
    accuracy: number;
    fluency: number;
    prosody: number;
}

/**
 * Gộp kết quả từng đoạn của recognition liên tục, trọng số theo số từ. `null` khi không nhận ra lời nào.
 * Completeness tự tính (số từ đọc được / số từ đoạn văn) vì miscue tắt — xem `lib/scoring/azure.ts`.
 */
export function aggregatePronunciation(segments: PronunciationSegment[], referenceText: string): PronunciationScores | null {
    const words = segments.reduce((sum, segment) => sum + segment.words, 0);
    if (words === 0) return null;
    const weighted = (key: 'accuracy' | 'fluency' | 'prosody') =>
        Math.round(segments.reduce((sum, segment) => sum + segment[key] * segment.words, 0) / words);
    const referenceWords = referenceText.split(/\s+/).filter(Boolean).length;
    return {
        transcript: segments.map((segment) => segment.text).join(' '),
        accuracy: weighted('accuracy'),
        fluency: weighted('fluency'),
        prosody: weighted('prosody'),
        completeness: Math.min(100, Math.round((words / Math.max(1, referenceWords)) * 100)),
    };
}

/** Part 1: trung bình 4 điểm Azure (0–100) → 0–3. shortcut: ngưỡng ước lượng, hiệu chỉnh khi có bài chấm tay để đối chiếu. */
export function pronunciationToScore({ accuracy, fluency, completeness, prosody }: PronunciationScores) {
    const average = mean([accuracy, fluency, completeness, prosody]);
    if (average >= 80) return 3;
    if (average >= 60) return 2;
    if (average >= 35) return 1;
    return 0;
}

export interface IeltsBands {
    fluency: number;
    vocabulary: number;
    grammar: number;
    task_response: number;
}

/** Part 2–5: band IELTS trung bình (0–9) quy tuyến tính về 0..max của câu. */
export function bandsToScore({ fluency, vocabulary, grammar, task_response }: IeltsBands, max: number) {
    return Math.round((mean([fluency, vocabulary, grammar, task_response]) / 9) * max);
}

/** Tổng thô → thang 0–200, bội số 10. shortcut: tuyến tính vì ETS không công bố bảng quy đổi. */
export function toScaledScore(raw: number, maxRaw: number) {
    if (maxRaw <= 0) return 0;
    return Math.min(200, Math.round((raw / maxRaw) * 20) * 10);
}

export interface TranscriptSegment {
    start: number;
    end: number;
    text: string;
}

export interface FluencyMetrics {
    words: number;
    words_per_minute: number;
    long_pauses: number;
    silence_ratio: number;
    response_delay_sec: number;
}

/** Số đo Fluency từ timestamp Whisper, gửi kèm transcript để LLM chấm Fluency có căn cứ. */
export function fluencyMetrics(segments: TranscriptSegment[], durationSec: number): FluencyMetrics {
    const words = segments.reduce((sum, segment) => sum + segment.text.split(/\s+/).filter(Boolean).length, 0);
    const spokenSec = segments.reduce((sum, segment) => sum + Math.max(0, segment.end - segment.start), 0);
    const longPauses = segments.filter((segment, i) => i > 0 && segment.start - segments[i - 1].end > 2).length;
    return {
        words,
        words_per_minute: spokenSec > 0 ? Math.round((words / spokenSec) * 60) : 0,
        long_pauses: longPauses,
        silence_ratio: durationSec > 0 ? Math.round(Math.max(0, 1 - spokenSec / durationSec) * 100) / 100 : 1,
        response_delay_sec: Math.round((segments[0]?.start ?? durationSec) * 10) / 10,
    };
}

export interface ScoredQuestion {
    id: string;
    number: number;
}

export interface ScoredResponse {
    question_id: string;
    score: number | null;
    feedback: string | null;
}

/** Câu bị bỏ vì API chấm trả 429. */
export type ScoreLimit = Exclude<ScoreError, 'scoring_failed'>;

const LIMIT_REASON: Record<ScoreLimit, string> = {
    daily_limit: 'hết lượt chấm hôm nay',
    provider_limit: 'hết lượt chấm miễn phí',
};

/** Tổng kết lượt thi Speaking: câu chưa có điểm (không ghi âm/chấm lỗi/hết lượt chấm `limit`) tính 0. */
export const summarizeSpeaking = (
    questions: ScoredQuestion[],
    responses: ScoredResponse[],
    limit: ScoreLimit | null = null,
) => summarize(questions, responses, speakingMaxScore, limit ? LIMIT_REASON[limit] : 'không ghi âm được hoặc chấm lỗi');

/**
 * Tổng kết Writing trên các câu được truyền vào: một Part → điểm ước lượng 0–200 của Part; câu của cả 3 Part (lần nộp
 * gần nhất) → tổng cả bài. Câu chưa có điểm tính 0.
 */
export const summarizeWriting = (questions: ScoredQuestion[], responses: ScoredResponse[]) =>
    summarize(questions, responses, writingMaxScore, 'chấm lỗi');

function summarize(
    questions: ScoredQuestion[],
    responses: ScoredResponse[],
    maxScore: (questionNumber: number) => number,
    unscoredReason: string,
) {
    const byQuestion = new Map(responses.map((response) => [response.question_id, response]));
    const sorted = [...questions].sort((a, b) => a.number - b.number);
    const raw = sorted.reduce((sum, question) => sum + (byQuestion.get(question.id)?.score ?? 0), 0);
    const maxRaw = sorted.reduce((sum, question) => sum + maxScore(question.number), 0);
    const unscored = sorted.filter((question) => byQuestion.get(question.id)?.score == null).length;
    const feedbackSummary = sorted
        .flatMap((question) => {
            const feedback = byQuestion.get(question.id)?.feedback;
            return feedback ? [`Câu ${question.number}: ${feedback}`] : [];
        })
        .join('\n');
    return {
        score: toScaledScore(raw, maxRaw),
        feedbackSummary: feedbackSummary || null,
        scoringError: unscored > 0 ? `${unscored} câu chưa có điểm (${unscoredReason}), tính 0 điểm.` : null,
    };
}
