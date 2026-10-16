import { z } from 'zod';
import { getPartTemplates } from '@/lib/domain/parts';
import type { Topic } from '@/lib/exam-library/types';

export const SPEAKING_PART_TEMPLATES = getPartTemplates('speaking');

const TOPICS = ['office', 'customer', 'retail', 'travel', 'tech', 'logistics', 'strategy'] as const satisfies readonly Topic[];

/** Part 2 mô tả tranh cần ảnh; Part 3, 4 có ngữ liệu chung cho cả cụm câu. */
const IMAGE_PART_NO = 2;
const CONTEXT_PART_NOS = new Set([3, 4]);

const requiredText = (message: string, max: number) =>
    z.string().trim().min(1, message).max(max, `Tối đa ${max} ký tự`);

/** Ô bỏ trống lưu thành `null`, đúng với cột nullable trong DB. */
const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max, `Tối đa ${max} ký tự`)
        .transform((value) => value || null);

const questionSchema = z.object({
    number: z.number().int(),
    prompt: requiredText('Vui lòng nhập nội dung câu hỏi', 2000),
    image_path: optionalText(500),
    image_alt: optionalText(300),
    sample_answer: optionalText(3000),
    hint: optionalText(500),
});

const partSchema = z.object({
    part_template_id: z.number().int(),
    context: optionalText(3000),
    questions: z.array(questionSchema),
});

export const speakingExamSchema = z
    .object({
        code: requiredText('Vui lòng nhập mã đề', 30),
        title: requiredText('Vui lòng nhập tiêu đề', 150),
        topic: z.enum(TOPICS, 'Vui lòng chọn chủ đề'),
        target_level: z
            .number('Vui lòng chọn level mục tiêu')
            .int()
            .min(1, 'Level từ 1 đến 9')
            .max(9, 'Level từ 1 đến 9')
            .nullable(),
        edition: z.number('Vui lòng nhập năm ấn bản').int().min(2000, 'Năm không hợp lệ').max(2100, 'Năm không hợp lệ'),
        description: optionalText(500),
        tags: z.array(z.string().trim().min(1).max(40)).max(10, 'Tối đa 10 tag'),
        parts: z.array(partSchema),
    })
    .superRefine((exam, ctx) => {
        if (exam.parts.length !== SPEAKING_PART_TEMPLATES.length) {
            ctx.addIssue({ code: 'custom', path: ['parts'], message: 'Đề Speaking cần đủ 5 Part' });
            return;
        }

        SPEAKING_PART_TEMPLATES.forEach((template, partIndex) => {
            const part = exam.parts[partIndex];
            const path = ['parts', partIndex];

            if (part.part_template_id !== template.id) {
                ctx.addIssue({ code: 'custom', path: [...path, 'part_template_id'], message: 'Sai thứ tự Part' });
            }

            const count = template.q_to - template.q_from + 1;
            const numbersMatch =
                part.questions.length === count &&
                part.questions.every((question, index) => question.number === template.q_from + index);
            if (!numbersMatch) {
                ctx.addIssue({
                    code: 'custom',
                    path: [...path, 'questions'],
                    message: `Part ${template.part_no} cần đúng ${count} câu (câu ${template.q_from}–${template.q_to})`,
                });
            }

            if (CONTEXT_PART_NOS.has(template.part_no) && !part.context) {
                ctx.addIssue({ code: 'custom', path: [...path, 'context'], message: 'Vui lòng nhập ngữ liệu chung' });
            }

            if (template.part_no === IMAGE_PART_NO) {
                part.questions.forEach((question, index) => {
                    if (!question.image_path) {
                        ctx.addIssue({
                            code: 'custom',
                            path: [...path, 'questions', index, 'image_path'],
                            message: 'Vui lòng nhập đường dẫn ảnh',
                        });
                    }
                    if (!question.image_alt) {
                        ctx.addIssue({
                            code: 'custom',
                            path: [...path, 'questions', index, 'image_alt'],
                            message: 'Vui lòng mô tả ảnh cho trình đọc màn hình',
                        });
                    }
                });
            }
        });
    });

export type SpeakingExamInput = z.input<typeof speakingExamSchema>;
export type SpeakingExamValues = z.output<typeof speakingExamSchema>;

/** Khung đề rỗng đủ 5 Part / 11 câu cho giá trị mặc định của form. */
export function emptySpeakingExam(): SpeakingExamInput {
    return {
        code: '',
        title: '',
        topic: 'office',
        target_level: null,
        edition: new Date().getFullYear(),
        description: '',
        tags: [],
        parts: SPEAKING_PART_TEMPLATES.map((template) => ({
            part_template_id: template.id,
            context: '',
            questions: Array.from({ length: template.q_to - template.q_from + 1 }, (_, index) => ({
                number: template.q_from + index,
                prompt: '',
                image_path: '',
                image_alt: '',
                sample_answer: '',
                hint: '',
            })),
        })),
    };
}
