import { getExam, listExamParts } from '@/lib/data/content';
import { getAttempt, listAnnotations, listResponses, PREVIEW_USER_ID } from '@/lib/data/user-data';
import type { Attempt } from '@/lib/domain/types';
import { getExamRoom } from '@/lib/exam-library/room';
import { summarizeExams } from '@/lib/exam-library/summarize';
import type { ExamSummary } from '@/lib/exam-library/types';
import { HistoryRow, ReviewQuestion } from '../types';
import { loadHistoryRows, toHistoryRows } from './data';

/**
 * Lượt admin xem trước nằm trên máy và thuộc đề chưa phát hành (không có trong `exams` dùng chung): đọc đề bằng phiên
 * admin của trình duyệt (RLS cho admin đọc đề nháp).
 */
async function previewRow(attempt: Attempt): Promise<HistoryRow | undefined> {
    const [exam, parts] = await Promise.all([getExam(attempt.exam_id), listExamParts(attempt.exam_id)]);
    if (!exam) return undefined;
    const [row] = await toHistoryRows([attempt], summarizeExams([exam], parts));
    return row;
}

export interface AttemptReview {
    row: HistoryRow;
    questions: ReviewQuestion[];
}

/**
 * Lượt làm kèm từng câu thuộc phạm vi lượt làm, câu trả lời và nhận xét; `null` nếu không tồn tại.
 * Chỉ nạp các lượt cùng đề: đủ cho số lần làm và chênh điểm.
 */
export async function loadAttemptReview(id: string, exams: ExamSummary[]): Promise<AttemptReview | null> {
    const target = await getAttempt(id);
    if (!target) return null;
    const row =
        target.user_id === PREVIEW_USER_ID
            ? await previewRow(target)
            : (await loadHistoryRows(exams, target.exam_id)).find((item) => item.attempt.id === id);
    if (!row) return null;

    const { attempt, exam } = row;
    const [room, responses] = await Promise.all([getExamRoom(exam.skill, exam.id), listResponses(attempt.id)]);
    const annotations = await listAnnotations(attempt.id, responses.map((response) => response.id));

    const questions = (room?.parts ?? [])
        .filter(({ template }) => attempt.part_template_id === null || template.id === attempt.part_template_id)
        .flatMap(({ template, part, questions: partQuestions }) =>
            partQuestions.map((question) => {
                const response = responses.find((item) => item.question_id === question.id) ?? null;
                return {
                    question,
                    template,
                    context: part.context,
                    response,
                    annotations: response ? annotations.filter((item) => item.response_id === response.id) : [],
                };
            }),
        );
    return { row, questions };
}
