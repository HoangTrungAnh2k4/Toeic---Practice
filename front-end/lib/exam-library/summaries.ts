import { listExamParts, listExams } from '@/lib/data/content';
import { PART_TEMPLATES, TEST_DURATION_MIN } from '@/lib/domain/parts';
import type { Skill } from '@/lib/domain/types';
import type { ExamSummary } from './types';

const TEMPLATE_BY_ID = new Map(PART_TEMPLATES.map((part) => [part.id, part]));

/** Mọi đề kèm số câu, số Part và thời lượng tính từ cấu trúc Part. */
export async function getExamSummaries(): Promise<ExamSummary[]> {
    const [exams, parts] = await Promise.all([listExams(), listExamParts()]);

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

/** Đề đã phát hành của một kỹ năng cho thư viện đề học viên, mã đề mới nhất trước. */
export async function getLibraryExams(skill: Skill): Promise<ExamSummary[]> {
    const summaries = await getExamSummaries();
    return summaries
        .filter((exam) => exam.skill === skill && exam.status === 'published')
        .sort((a, b) => b.code.localeCompare(a.code));
}
