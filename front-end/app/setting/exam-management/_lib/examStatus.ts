import { getPartTemplates } from '@/lib/domain/parts';
import type { ExamStatus, Skill } from '@/lib/domain/types';
import type { RoomPart } from '@/lib/exam-library/room';
import { getPartFields, KEYWORD_COUNT } from './examSchema';

/** Tuần tự Nháp → Chờ thẩm định → Đang khả dụng; trả về nháp từ hai trạng thái sau. */
const NEXT_STATUSES: Record<ExamStatus, ExamStatus[]> = {
    draft: ['review'],
    review: ['published', 'draft'],
    published: ['draft'],
};

export const getNextStatuses = (from: ExamStatus) => NEXT_STATUSES[from];
export const canChangeStatus = (from: ExamStatus, to: ExamStatus) => NEXT_STATUSES[from].includes(to);
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
