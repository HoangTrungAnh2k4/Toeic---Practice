import type { SupabaseClient } from '@supabase/supabase-js';
import { getExam, listExamParts, listQuestions } from '@/lib/data/content';
import type { Database } from '@/lib/database.types';
import { PART_TEMPLATES } from '@/lib/domain/parts';
import type { AttemptMode, Exam, ExamPart, PartTemplate, Question, Skill } from '@/lib/domain/types';
import type { RawSearchParams } from './search-params';

export interface RoomPart {
    template: PartTemplate;
    part: ExamPart;
    questions: Question[];
}

export interface ExamRoom {
    exam: Exam;
    parts: RoomPart[];
}

const MODES: AttemptMode[] = ['cbt', 'timed', 'guided'];

/**
 * Đọc `id`, `mode`, `part` (id của Part template) của phòng thi từ URL; mode không hợp lệ rơi về thi thử CBT,
 * `part` thiếu hoặc không hợp lệ là `null`.
 */
export function parseRoomParams(raw: RawSearchParams): {
    examId: string | null;
    mode: AttemptMode;
    partTemplateId: number | null;
} {
    const pick = (key: string) => {
        const value = raw[key];
        return Array.isArray(value) ? value[0] : value;
    };
    const mode = pick('mode');
    const part = Number(pick('part'));
    return {
        examId: pick('id') ?? null,
        mode: MODES.find((item) => item === mode) ?? 'cbt',
        partTemplateId: Number.isInteger(part) && part > 0 ? part : null,
    };
}

/**
 * Nội dung phòng thi của một đề: các Part theo thứ tự kèm câu hỏi.
 * `null` khi không có đề, đề không thuộc kỹ năng của phòng thi, hoặc đề chưa phát hành mà `db` không mang phiên admin
 * (RLS chỉ cho admin đọc đề `draft`/`review`, nhờ vậy admin xem trước được bằng chính phòng thi).
 */
export async function getExamRoom(
    skill: Skill,
    examId: string,
    db?: SupabaseClient<Database>,
): Promise<ExamRoom | null> {
    const exam = await getExam(examId, db);
    if (!exam || exam.skill !== skill) return null;

    const [parts, questions] = await Promise.all([listExamParts(examId, db), listQuestions(examId, db)]);
    return {
        exam,
        parts: parts
            .flatMap((part) => {
                const template = PART_TEMPLATES.find((item) => item.id === part.part_template_id);
                if (!template) return [];
                return [{ template, part, questions: questions.filter((q) => q.exam_part_id === part.id) }];
            })
            .sort((a, b) => a.template.part_no - b.template.part_no),
    };
}
