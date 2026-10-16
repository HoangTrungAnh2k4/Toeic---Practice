import { PART_TEMPLATES, TEST_DURATION_MIN } from '@/lib/domain/parts';
import type { Exam, ExamPart } from '@/lib/domain/types';
import type { ExamSummary } from './types';

const TEMPLATE_BY_ID = new Map(PART_TEMPLATES.map((part) => [part.id, part]));

/** Đề kèm số câu, số Part và thời lượng tính từ cấu trúc Part. Thuần, dùng được cả phía client. */
export function summarizeExams(exams: Exam[], parts: ExamPart[]): ExamSummary[] {
    return exams.map((exam) => {
        const templates = parts
            .filter((part) => part.exam_id === exam.id)
            .flatMap((part) => TEMPLATE_BY_ID.get(part.part_template_id) ?? []);

        return {
            ...exam,
            questionCount: templates.reduce((sum, part) => sum + part.q_to - part.q_from + 1, 0),
            partCount: templates.length,
            // shortcut: thời lượng bài đầy đủ của kỹ năng; cộng theo Part khi có đề luyện riêng Part.
            durationMin: TEST_DURATION_MIN[exam.skill],
        };
    });
}
