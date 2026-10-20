import { z } from 'zod';
import { getPartTemplates } from '@/lib/domain/parts';
import type { Skill } from '@/lib/domain/types';
import type { ExamRoom } from '@/lib/exam-library/room';
import type { Topic } from '@/lib/exam-library/types';

const TOPICS = ['office', 'customer', 'retail', 'travel', 'tech', 'logistics', 'strategy'] as const satisfies readonly Topic[];

/** Ô nhập riêng theo Part: yêu cầu từng câu, ảnh, ngữ liệu chung của Part, email riêng từng câu, từ khoá bắt buộc. */
export interface PartFields {
    prompt: boolean;
    image: boolean;
    context: boolean;
    stimulus: boolean;
    keywords: boolean;
}

/** Speaking: Part 2 tả tranh, Part 3–4 có ngữ liệu chung. Writing: Part 1 tranh + từ khoá, Part 2 email (kèm directions) riêng từng câu. */
const PART_FIELDS: Record<Skill, Record<number, Partial<PartFields>>> = {
    speaking: { 2: { image: true }, 3: { context: true }, 4: { context: true } },
    writing: { 1: { image: true, keywords: true }, 2: { prompt: false, stimulus: true } },
};

export function getPartFields(skill: Skill, partNo: number): PartFields {
    return { prompt: true, image: false, context: false, stimulus: false, keywords: false, ...PART_FIELDS[skill][partNo] };
}

/** Yêu cầu chuẩn ETS của Writing Q1–5: cố định, admin không nhập. */
const PICTURE_SENTENCE_PROMPT = 'Write ONE sentence based on the picture. Use the TWO words or phrases under the picture.';

/** Yêu cầu cố định của Part; `null` khi admin tự nhập từng câu. */
export function getFixedPrompt(skill: Skill, partNo: number): string | null {
    return skill === 'writing' && partNo === 1 ? PICTURE_SENTENCE_PROMPT : null;
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
    /** Bắt buộc theo `PartFields.prompt`; Writing Q6–7 lưu `null`. */
    prompt: optionalText(2000),
    /** Email đề Writing Q6–7, lưu text vào `questions.stimulus`. */
    stimulus: optionalText(4000),
    /** Ảnh đã có trên R2 khi sửa đề; server chỉ chấp nhận đúng ảnh hiện tại của câu. */
    image_path: z.string().max(500).nullable(),
    /** Ảnh mới giữ trong RAM tới khi lưu đề, thay cho `image_path`. */
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

/** Thông tin chung: đề đã có lượt làm chỉ sửa được phần này. */
export const examInfoSchema = z.object({
    title: requiredText('Vui lòng nhập tiêu đề', 150),
    topic: z.enum(TOPICS, 'Vui lòng chọn chủ đề'),
});

export const examSchema = examInfoSchema
    .extend({
        skill: z.enum(['speaking', 'writing']),
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
                const hasImage = Boolean(question.image || question.image_path);
                if (!fields.image && hasImage) issue([...at, 'image'], `Part ${template.part_no} không có ảnh`);
                if (fields.image && !hasImage) issue([...at, 'image'], 'Vui lòng chọn hoặc dán ảnh');
                if (fields.image && !question.image_alt) issue([...at, 'image_alt'], 'Vui lòng mô tả chi tiết ảnh');
                if (fields.prompt && !question.prompt) issue([...at, 'prompt'], 'Vui lòng nhập nội dung câu hỏi');
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
    })
    // Server cũng chạy schema này nên client không đổi được yêu cầu cố định, cũng không lưu được yêu cầu cho Part không có ô này
    .transform((exam) => {
        const templates = getPartTemplates(exam.skill);
        return {
            ...exam,
            parts: exam.parts.map((part, index) => {
                const partNo = templates[index].part_no;
                const fixed = getFixedPrompt(exam.skill, partNo);
                if (getPartFields(exam.skill, partNo).prompt && !fixed) return part;
                return { ...part, questions: part.questions.map((question) => ({ ...question, prompt: fixed })) };
            }),
        };
    });

/** Từ khoá form → cột `questions.keywords`: chỉ từ gốc, `forms` rỗng vì AI tự đánh giá dạng từ khi chấm. */
export const toKeywordRows = (keywords: string[]) => (keywords.length ? keywords.map((word) => ({ word, forms: [] })) : null);

export type ExamInput = z.input<typeof examSchema>;
export type ExamValues = z.output<typeof examSchema>;
export type ExamInfoValues = z.output<typeof examInfoSchema>;

/** Khung đề rỗng đủ Part / số câu của kỹ năng cho giá trị mặc định của form. */
export function emptyExam(skill: Skill): ExamInput {
    return {
        skill,
        title: '',
        topic: 'office',
        parts: getPartTemplates(skill).map((template) => ({
            part_template_id: template.id,
            context: '',
            questions: Array.from({ length: template.q_to - template.q_from + 1 }, (_, index) => ({
                number: template.q_from + index,
                prompt: getFixedPrompt(skill, template.part_no) ?? '',
                stimulus: '',
                image_path: null,
                image: null,
                image_alt: '',
                keywords: getPartFields(skill, template.part_no).keywords ? Array(KEYWORD_COUNT).fill('') : [],
                sample_answer: '',
            })),
        })),
    };
}

/** Đề đọc từ DB → giá trị form sửa đề; ảnh có sẵn giữ ở `image_path`, từ khoá chỉ lấy từ gốc. */
export function examToFormValues({ exam, parts }: ExamRoom): ExamInput {
    const empty = emptyExam(exam.skill);
    return {
        ...empty,
        title: exam.title,
        topic: TOPICS.find((topic) => topic === exam.topic) ?? empty.topic,
        parts: empty.parts.map((part) => {
            const source = parts.find((item) => item.template.id === part.part_template_id);
            return {
                ...part,
                context: source?.part.context ?? '',
                questions: part.questions.map((question) => {
                    const row = source?.questions.find((item) => item.number === question.number);
                    if (!row) return question;
                    const words = (row.keywords ?? []).map((keyword) => keyword.word);
                    return {
                        ...question,
                        prompt: question.prompt || (row.prompt ?? ''),
                        stimulus: row.stimulus ?? '',
                        image_path: row.image_path,
                        image_alt: row.image_alt ?? '',
                        // Giữ đúng số ô từ khoá của Part; đề cũ thiếu từ thì để ô trống cho admin điền
                        keywords: question.keywords.map((_, index) => words[index] ?? ''),
                        sample_answer: row.sample_answer ?? '',
                    };
                }),
            };
        }),
    };
}
