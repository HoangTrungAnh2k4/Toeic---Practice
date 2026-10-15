import { listExamParts, listExams, listExamStats } from '@/lib/data/content';
import { PART_TEMPLATES, TEST_DURATION_MIN } from '@/lib/domain/parts';
import type { ExamPart, PartTemplate } from '@/lib/domain/types';
import { ExamLibraryItem, ExamSkill } from '../types';

const TEMPLATE_BY_ID = new Map(PART_TEMPLATES.map((part) => [part.id, part]));

function getSkill(templates: PartTemplate[]): ExamSkill {
    const skills = new Set(templates.map((part) => part.skill));
    if (skills.size > 1) return 'combo';
    return skills.has('writing') ? 'writing' : 'speaking';
}

function getTemplates(parts: ExamPart[]): PartTemplate[] {
    return parts.flatMap((part) => TEMPLATE_BY_ID.get(part.part_template_id) ?? []);
}

export async function getExamLibrary(): Promise<ExamLibraryItem[]> {
    const [exams, parts, stats] = await Promise.all([listExams(), listExamParts(), listExamStats()]);

    return exams.map((exam) => {
        const templates = getTemplates(parts.filter((part) => part.exam_id === exam.id));
        const skills = new Set(templates.map((part) => part.skill));

        return {
            ...exam,
            skill: getSkill(templates),
            questionCount: templates.reduce((sum, part) => sum + part.q_to - part.q_from + 1, 0),
            // shortcut: tính theo thời lượng bài đầy đủ của mỗi kỹ năng; cộng theo Part khi có đề luyện riêng Part.
            durationMin: [...skills].reduce((sum, skill) => sum + TEST_DURATION_MIN[skill], 0),
            stats: stats.find((row) => row.exam_id === exam.id) ?? null,
        };
    });
}
