import { z } from 'zod';
import { getPartTemplates } from '@/lib/domain/parts';
import type { Skill } from '@/lib/domain/types';
import type { Topic } from '@/lib/exam-library/types';

const TOPICS = ['office', 'customer', 'retail', 'travel', 'tech', 'logistics', 'strategy'] as const satisfies readonly Topic[];

/** Ô nhập riêng theo Part: ảnh, ngữ liệu chung của Part, email riêng từng câu, từ khoá bắt buộc. */
export interface PartFields {
    image: boolean;
    context: boolean;
    stimulus: boolean;
    keywords: boolean;
}

/** Speaking: Part 2 tả tranh, Part 3–4 có ngữ liệu chung. Writing: Part 1 tranh + từ khoá, Part 2 email riêng từng câu. */
const PART_FIELDS: Record<Skill, Record<number, Partial<PartFields>>> = {
    speaking: { 2: { image: true }, 3: { context: true }, 4: { context: true } },
    writing: { 1: { image: true, keywords: true }, 2: { stimulus: true } },
};

export function getPartFields(skill: Skill, partNo: number): PartFields {
    return { image: false, context: false, stimulus: false, keywords: false, ...PART_FIELDS[skill][partNo] };
}

/** Số từ khoá bắt buộc mỗi câu Writing Q1–5. */
export const KEYWORD_COUNT = 2;

/** Ảnh sau khi nén phía trình duyệt; 5 ảnh Writing gửi chung một request phải dưới giới hạn body 10 MB của proxy.ts. */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_MB = 1.5;
/** Ảnh gốc admin chọn, trước khi nén. */
export const MAX_SOURCE_IMAGE_MB = 10;

const requiredText = (message: string, max: number) =>
    z.string().trim().min(1, message).max(max, `Tối đa ${max} ký tự`);

/** Ô bỏ trống lưu thành `null`, đúng với cột nullable trong DB; nhận cả `null` để server parse lại được output. */
const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max, `Tối đa ${max} ký tự`)
        .nullable()
        .transform((value) => value || null);

const questionSchema = z.object({
    number: z.number().int(),
    prompt: requiredText('Vui lòng nhập nội dung câu hỏi', 2000),
    /** Email đề Writing Q6–7, lưu text vào `questions.stimulus`. */
    stimulus: optionalText(4000),
    /** Ảnh giữ trong RAM tới khi lưu đề; server ghi DB trước rồi mới tải lên R2. */
    image: z
        .file()
        .mime([...IMAGE_TYPES], 'Chỉ nhận ảnh JPG, PNG hoặc WebP')
        .max(MAX_IMAGE_MB * 1024 * 1024, `Ảnh tối đa ${MAX_IMAGE_MB} MB sau khi nén`)
        .nullable(),
    // Đủ dài để tả chi tiết: model chấm chỉ đọc mô tả, không xem ảnh
    image_alt: optionalText(1000),
    /** Từ khoá gốc; AI tự đánh giá thí sinh dùng đúng dạng và đúng nghĩa. */
    keywords: z.array(z.string().trim().max(40, 'Tối đa 40 ký tự')),
    sample_answer: optionalText(3000),
});

const partSchema = z.object({
    part_template_id: z.number().int(),
    context: optionalText(3000),
    questions: z.array(questionSchema),
});

export const examSchema = z
    .object({
        skill: z.enum(['speaking', 'writing']),
        title: requiredText('Vui lòng nhập tiêu đề', 150),
        topic: z.enum(TOPICS, 'Vui lòng chọn chủ đề'),
        target_level: z
            .number('Vui lòng chọn level mục tiêu')
            .int()
            .min(1, 'Level từ 1 đến 9')
            .max(9, 'Level từ 1 đến 9')
            .nullable(),
        edition: z.number('Vui lòng nhập năm ấn bản').int().min(2000, 'Năm không hợp lệ').max(2100, 'Năm không hợp lệ'),
        parts: z.array(partSchema),
    })
    .superRefine((exam, ctx) => {
        const templates = getPartTemplates(exam.skill);
        if (exam.parts.length !== templates.length) {
            const label = exam.skill === 'speaking' ? 'Speaking' : 'Writing';
            ctx.addIssue({ code: 'custom', path: ['parts'], message: `Đề ${label} cần đủ ${templates.length} Part` });
            return;
        }

        templates.forEach((template, partIndex) => {
            const part = exam.parts[partIndex];
            const path = ['parts', partIndex];
            const fields = getPartFields(exam.skill, template.part_no);
            const issue = (at: PropertyKey[], message: string) => ctx.addIssue({ code: 'custom', path: at, message });

            if (part.part_template_id !== template.id) issue([...path, 'part_template_id'], 'Sai thứ tự Part');

            const count = template.q_to - template.q_from + 1;
            const numbersMatch =
                part.questions.length === count &&
                part.questions.every((question, index) => question.number === template.q_from + index);
            if (!numbersMatch) {
                issue(
                    [...path, 'questions'],
                    `Part ${template.part_no} cần đúng ${count} câu (câu ${template.q_from}–${template.q_to})`,
                );
            }

            if (fields.context && !part.context) issue([...path, 'context'], 'Vui lòng nhập ngữ liệu chung');

            part.questions.forEach((question, index) => {
                const at = [...path, 'questions', index];
                if (!fields.image && question.image) issue([...at, 'image'], `Part ${template.part_no} không có ảnh`);
                if (fields.image && !question.image) issue([...at, 'image'], 'Vui lòng chọn hoặc dán ảnh');
                if (fields.image && !question.image_alt) issue([...at, 'image_alt'], 'Vui lòng mô tả chi tiết ảnh');
                if (fields.stimulus && !question.stimulus) issue([...at, 'stimulus'], 'Vui lòng nhập nội dung email');

                const words = question.keywords.filter(Boolean);
                if (!fields.keywords && words.length > 0) issue([...at, 'keywords'], `Part ${template.part_no} không có từ khoá`);
                if (fields.keywords) {
                    question.keywords.forEach((word, wordIndex) => {
                        if (!word) issue([...at, 'keywords', wordIndex], 'Vui lòng nhập từ khoá');
                    });
                    if (question.keywords.length !== KEYWORD_COUNT) {
                        issue([...at, 'keywords'], `Cần đúng ${KEYWORD_COUNT} từ khoá`);
                    } else if (new Set(words.map((word) => word.toLowerCase())).size < words.length) {
                        issue([...at, 'keywords', KEYWORD_COUNT - 1], 'Hai từ khoá phải khác nhau');
                    }
                }
            });
        });
    });

export type ExamInput = z.input<typeof examSchema>;
export type ExamValues = z.output<typeof examSchema>;

/** Yêu cầu chung của Writing Q1–5 theo ETS; điền sẵn để admin khỏi gõ lại 5 lần. */
const PICTURE_SENTENCE_PROMPT = 'Write ONE sentence based on the picture. Use the TWO words or phrases under the picture.';

/** Khung đề rỗng đủ Part / số câu của kỹ năng cho giá trị mặc định của form. */
export function emptyExam(skill: Skill): ExamInput {
    return {
        skill,
        title: '',
        topic: 'office',
        target_level: null,
        edition: new Date().getFullYear(),
        parts: getPartTemplates(skill).map((template) => ({
            part_template_id: template.id,
            context: '',
            questions: Array.from({ length: template.q_to - template.q_from + 1 }, (_, index) => ({
                number: template.q_from + index,
                prompt: skill === 'writing' && template.part_no === 1 ? PICTURE_SENTENCE_PROMPT : '',
                stimulus: '',
                image: null,
                image_alt: '',
                keywords: getPartFields(skill, template.part_no).keywords ? Array(KEYWORD_COUNT).fill('') : [],
                sample_answer: '',
            })),
        })),
    };
}
