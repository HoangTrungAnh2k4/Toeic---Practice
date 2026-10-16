import { getExam, listExamParts, listQuestions } from '@/lib/data/content';
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

/** Đọc `id` và `mode` của phòng thi từ URL; mode không hợp lệ rơi về thi thử CBT. */
export function parseRoomParams(raw: RawSearchParams): { examId: string | null; mode: AttemptMode } {
    const pick = (key: string) => {
        const value = raw[key];
        return Array.isArray(value) ? value[0] : value;
    };
    const mode = pick('mode');
    return {
        examId: pick('id') ?? null,
        mode: MODES.find((item) => item === mode) ?? 'cbt',
    };
}

/**
 * Nội dung phòng thi của một đề: các Part theo thứ tự kèm câu hỏi.
 * `null` khi không có đề hoặc đề không thuộc kỹ năng của phòng thi.
 * Chạy cả server lẫn client; RLS quyết định đề nào thấy được (server không phiên: chỉ `published`).
 * shortcut: admin xem trước đề nháp nhờ tải lại phía client (`useExamRoom`) khi server trả `null`; đọc phiên ở server (@supabase/ssr) khi cần SSR cho đề nháp.
 */
export async function getExamRoom(skill: Skill, examId: string): Promise<ExamRoom | null> {
    const exam = await getExam(examId);
    if (!exam || exam.skill !== skill) return null;

    const [parts, questions] = await Promise.all([listExamParts(examId), listQuestions(examId)]);
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
