import { listAnnotations, listResponses } from '@/lib/data/user-data';
import { getExamRoom } from '@/lib/exam-library/room';
import type { ExamSummary } from '@/lib/exam-library/types';
import { HistoryRow, ReviewQuestion } from '../types';
import { loadHistoryRows } from './data';

export interface AttemptReview {
    row: HistoryRow;
    questions: ReviewQuestion[];
}

/**
 * Lượt làm kèm từng câu thuộc phạm vi lượt làm, câu trả lời và nhận xét; `null` nếu không tồn tại.
 * shortcut: nạp mọi lượt để có số lần làm & chênh điểm; đổi sang query một attempt khi có backend.
 */
export async function loadAttemptReview(id: string, exams: ExamSummary[]): Promise<AttemptReview | null> {
    const row = (await loadHistoryRows(exams)).find((item) => item.attempt.id === id);
    if (!row) return null;

    const { attempt, exam } = row;
    const [room, responses] = await Promise.all([getExamRoom(exam.skill, exam.id), listResponses(attempt.id)]);
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
    return { row, questions };
}
