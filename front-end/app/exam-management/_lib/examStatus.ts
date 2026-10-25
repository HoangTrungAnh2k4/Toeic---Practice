import { getPartTemplates } from '@/lib/domain/parts';
import type { ExamStatus, Skill } from '@/lib/domain/types';
import type { RoomPart } from '@/lib/exam-library/room';
import { getPartFields, KEYWORD_COUNT } from './examSchema';

/** Tuần tự Nháp → Chờ thẩm định → Đang khả dụng ⇄ Đã lưu trữ; trả về nháp từ Chờ thẩm định hoặc Đang khả dụng. */
const NEXT_STATUSES: Record<ExamStatus, ExamStatus[]> = {
    draft: ['review'],
    review: ['published', 'draft'],
    published: ['archived', 'draft'],
    archived: ['published'],
};

/**
 * Đề đã có lượt làm không trả về nháp được: nháp ẩn đề khỏi lịch sử của người học, còn nội dung thì vẫn bị khoá.
 * Gỡ đề thì lưu trữ, sửa nội dung thì nhân bản.
 */
export const getNextStatuses = (from: ExamStatus, attempts: number) =>
    NEXT_STATUSES[from].filter((to) => to !== 'draft' || attempts === 0);
export const canChangeStatus = (from: ExamStatus, to: ExamStatus, attempts: number) =>
    getNextStatuses(from, attempts).includes(to);
/** Trả về nháp phải ghi lý do để người sửa biết cần sửa gì. */
export const needsNote = (to: ExamStatus) => to === 'draft';
export const MAX_NOTE_LENGTH = 500;

/** Những gì đề còn thiếu để làm bài và chấm AI, theo cùng quy tắc của form tạo đề; rỗng = phát hành được. */
export function findPublishIssues(skill: Skill, parts: RoomPart[]): string[] {
    return getPartTemplates(skill).flatMap((template) => {
        const room = parts.find((item) => item.template.id === template.id);
        if (!room) return [`Part ${template.part_no}: chưa có Part này`];

        const fields = getPartFields(skill, template.part_no);
        const issues: string[] = [];
        const count = template.q_to - template.q_from + 1;
        const numbersMatch =
            room.questions.length === count &&
            room.questions.every((question, index) => question.number === template.q_from + index);
        if (!numbersMatch) issues.push(`Part ${template.part_no}: cần đúng câu ${template.q_from}–${template.q_to}`);
        if (fields.context && !room.part.context?.trim()) issues.push(`Part ${template.part_no}: thiếu ngữ liệu chung`);

        for (const question of room.questions) {
            const missing = [
                fields.prompt && !question.prompt?.trim() && 'nội dung câu hỏi',
                fields.image && !question.image_path && 'ảnh',
                fields.image && !question.image_alt?.trim() && 'mô tả ảnh',
                fields.stimulus && !question.stimulus?.trim() && 'email',
                fields.keywords &&
                    (question.keywords ?? []).filter((keyword) => keyword.word.trim()).length !== KEYWORD_COUNT &&
                    `đủ ${KEYWORD_COUNT} từ khoá`,
            ].filter(Boolean);
            if (missing.length > 0) issues.push(`Câu ${question.number}: thiếu ${missing.join(', ')}`);
        }
        return issues;
    });
}
