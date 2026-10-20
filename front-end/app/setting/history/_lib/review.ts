import { getAttempt, listAnnotations, listResponses } from '@/lib/data/user-data';
import { getExamRoom, type ExamRoom } from '@/lib/exam-library/room';
import { summarizeWriting } from '@/lib/scoring/scale';
import type { ExamSummary } from '@/lib/exam-library/types';
import { HistoryRow, ReviewQuestion } from '../types';
import { loadHistoryRows } from './data';

export interface AttemptReview {
    row: HistoryRow;
    questions: ReviewQuestion[];
    /** Writing: tổng 0–200 cả bài từ lượt đã chấm gần nhất của mọi Part; `null` khi chưa đủ Part hoặc không phải Writing. */
    writingTotal: number | null;
}

/** Mỗi Part Writing là một lượt làm riêng: gộp lượt đã chấm gần nhất (`rows` mới nhất trước) của từng Part. */
async function loadWritingTotal(rows: HistoryRow[], { exam, parts }: ExamRoom) {
    const latest = parts.map(({ template }) =>
        rows.find(
            ({ attempt }) =>
                attempt.exam_id === exam.id && attempt.part_template_id === template.id && attempt.status === 'scored',
        ),
    );
    if (parts.length === 0 || latest.some((row) => !row)) return null;
    const responses = await Promise.all(latest.map((row) => listResponses((row as HistoryRow).attempt.id)));
    return summarizeWriting(parts.flatMap((part) => part.questions), responses.flat()).score;
}

/**
 * Lượt làm kèm từng câu thuộc phạm vi lượt làm, câu trả lời và nhận xét; `null` nếu không tồn tại.
 * Chỉ nạp các lượt cùng đề: đủ cho số lần làm, chênh điểm và tổng Writing.
 */
export async function loadAttemptReview(id: string, exams: ExamSummary[]): Promise<AttemptReview | null> {
    const target = await getAttempt(id);
    if (!target) return null;
    const rows = await loadHistoryRows(exams, target.exam_id);
    const row = rows.find((item) => item.attempt.id === id);
    if (!row) return null;

    const { attempt, exam } = row;
    const [room, responses] = await Promise.all([getExamRoom(exam.skill, exam.id), listResponses(attempt.id)]);
    const writingTotal = room && exam.skill === 'writing' && attempt.status === 'scored' ? await loadWritingTotal(rows, room) : null;
    const annotations = await listAnnotations(responses.map((response) => response.id));

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
    return { row, questions, writingTotal };
}
