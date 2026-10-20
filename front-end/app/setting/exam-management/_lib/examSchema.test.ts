import { describe, expect, it } from 'vitest';
import { fromExamFormData, toExamFormData } from './examFormData';
import { emptyExam, examSchema, type ExamInput, getFixedPrompt } from './examSchema';

const image = (name: string) => new File(['image'], name, { type: 'image/jpeg' });

function validSpeaking(): ExamInput {
    const exam = emptyExam('speaking');
    exam.title = 'Speaking Test 11';
    for (const part of exam.parts) {
        part.context = 'Shared context';
        for (const question of part.questions) {
            question.prompt = `Question ${question.number}`;
        }
    }
    for (const question of exam.parts[1].questions) {
        question.image = image(`q${question.number}.jpg`);
        question.image_alt = 'Two people in an office';
    }
    return exam;
}

function validWriting(): ExamInput {
    const exam = emptyExam('writing');
    exam.title = 'Writing Test 8';
    for (const part of exam.parts) {
        for (const question of part.questions) {
            question.prompt = `Question ${question.number}`;
        }
    }
    for (const question of exam.parts[0].questions) {
        question.image = image(`q${question.number}.jpg`);
        question.image_alt = 'A man is carrying a box';
        question.keywords = ['man', 'carry'];
    }
    for (const question of exam.parts[1].questions) question.stimulus = 'From: ...\nSubject: ...';
    return exam;
}

const issuePaths = (input: unknown) =>
    examSchema.safeParse(input).error?.issues.map((issue) => issue.path.join('.')) ?? [];

describe('examSchema — Speaking', () => {
    it('chấp nhận đề đủ 5 Part / 11 câu và đổi ô trống thành null', () => {
        const exam = validSpeaking();
        exam.parts[0].context = '  ';
        const result = examSchema.safeParse(exam);

        expect(result.success).toBe(true);
        expect(result.data?.parts[0].context).toBeNull();
        expect(result.data?.parts[0].questions[0].sample_answer).toBeNull();
    });

    it('gửi qua FormData rồi parse lại phía server vẫn hợp lệ và giữ đúng ảnh', async () => {
        const parsed = examSchema.parse(validSpeaking());
        const result = examSchema.safeParse(fromExamFormData(toExamFormData(parsed)));

        expect(result.success).toBe(true);
        const images = result.data!.parts[1].questions.map((question) => question.image);
        expect(images.map((file) => file?.name)).toEqual(['q3.jpg', 'q4.jpg']);
        expect(await images[0]!.text()).toBe('image');
    });

    it('chặn ảnh sai định dạng và ảnh ở Part không có ảnh', () => {
        const exam = validSpeaking();
        exam.parts[1].questions[0].image = new File(['x'], 'q.gif', { type: 'image/gif' });
        exam.parts[0].questions[0].image = image('q.jpg');

        expect(issuePaths(exam)).toEqual(
            expect.arrayContaining(['parts.1.questions.0.image', 'parts.0.questions.0.image']),
        );
    });

    it('chặn Part thiếu câu hoặc sai số thứ tự câu', () => {
        const missing = validSpeaking();
        missing.parts[2].questions.pop();
        expect(issuePaths(missing)).toContain('parts.2.questions');

        const misnumbered = validSpeaking();
        misnumbered.parts[0].questions[1].number = 3;
        expect(issuePaths(misnumbered)).toContain('parts.0.questions');
    });

    it('chặn đề thiếu Part', () => {
        const exam = validSpeaking();
        exam.parts.pop();
        expect(issuePaths(exam)).toEqual(['parts']);
    });

    it('bắt buộc ảnh ở Part 2 và ngữ liệu ở Part 3, 4, báo cùng lỗi field khác', () => {
        const exam = validSpeaking();
        exam.title = '';
        exam.parts[1].questions[0].image = null;
        exam.parts[1].questions[1].image_alt = '';
        exam.parts[3].context = '';

        expect(issuePaths(exam)).toEqual(
            expect.arrayContaining(['title', 'parts.1.questions.0.image', 'parts.1.questions.1.image_alt', 'parts.3.context']),
        );
    });
});

describe('examSchema — Writing', () => {
    it('chấp nhận đề đủ 3 Part / 8 câu, gửi qua FormData vẫn giữ 5 ảnh và từ khoá', () => {
        const parsed = examSchema.parse(validWriting());
        const result = examSchema.safeParse(fromExamFormData(toExamFormData(parsed)));

        expect(result.success).toBe(true);
        expect(result.data!.parts[0].questions.map((question) => question.image?.name)).toEqual([
            'q1.jpg',
            'q2.jpg',
            'q3.jpg',
            'q4.jpg',
            'q5.jpg',
        ]);
        expect(result.data!.parts[0].questions[0].keywords).toEqual(['man', 'carry']);
        expect(result.data!.parts[1].questions[0].stimulus).toBe('From: ...\nSubject: ...');
    });

    it('Q1–5 luôn lưu yêu cầu chuẩn ETS dù client gửi khác', () => {
        const exam = validWriting();
        exam.parts[0].questions[0].prompt = 'Hacked';
        const prompts = examSchema.parse(exam).parts[0].questions.map((question) => question.prompt);
        expect(new Set(prompts)).toEqual(new Set([getFixedPrompt('writing', 1)]));
    });

    it('Q6–7 không lưu yêu cầu riêng: directions nằm trong email', () => {
        const exam = validWriting();
        exam.parts[1].questions[0].prompt = 'Ask TWO questions';
        expect(examSchema.parse(exam).parts[1].questions.map((question) => question.prompt)).toEqual([null, null]);
    });

    it('bắt buộc ảnh, mô tả ảnh và đủ 2 từ khoá khác nhau ở Q1–5', () => {
        const exam = validWriting();
        exam.parts[0].questions[0].image = null;
        exam.parts[0].questions[1].image_alt = '';
        exam.parts[0].questions[2].keywords = ['man', ' '];
        exam.parts[0].questions[3].keywords = ['Desk', 'desk'];
        exam.parts[0].questions[4].keywords = ['man'];

        expect(issuePaths(exam)).toEqual(
            expect.arrayContaining([
                'parts.0.questions.0.image',
                'parts.0.questions.1.image_alt',
                'parts.0.questions.2.keywords.1',
                'parts.0.questions.3.keywords.1',
                'parts.0.questions.4.keywords',
            ]),
        );
    });

    it('bắt buộc email ở Q6–7, chặn ảnh và từ khoá ngoài Q1–5', () => {
        const exam = validWriting();
        exam.parts[1].questions[0].stimulus = '';
        exam.parts[2].questions[0].image = image('q8.jpg');
        exam.parts[2].questions[0].keywords = ['essay'];

        expect(issuePaths(exam)).toEqual(
            expect.arrayContaining(['parts.1.questions.0.stimulus', 'parts.2.questions.0.image', 'parts.2.questions.0.keywords']),
        );
    });

    it('khi sửa đề, ảnh đã có trên R2 (`image_path`) thay được cho ảnh mới', () => {
        const exam = validWriting();
        exam.parts[0].questions[0].image = null;
        exam.parts[0].questions[0].image_path = 'https://r2.example/exam-images/a.webp';
        expect(examSchema.safeParse(exam).success).toBe(true);

        exam.parts[2].questions[0].image_path = 'https://r2.example/exam-images/b.webp';
        expect(issuePaths(exam)).toEqual(['parts.2.questions.0.image']);
    });

    it('chặn đề Writing mang khung Part của Speaking', () => {
        const exam = { ...validSpeaking(), skill: 'writing' as const };
        expect(issuePaths(exam)).toEqual(['parts']);
    });
});
