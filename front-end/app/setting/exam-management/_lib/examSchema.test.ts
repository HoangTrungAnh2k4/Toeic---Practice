import { describe, expect, it } from 'vitest';
import { fromExamFormData, toExamFormData } from './examFormData';
import { emptySpeakingExam, speakingExamSchema, type SpeakingExamInput } from './examSchema';

function validExam(): SpeakingExamInput {
    const exam = emptySpeakingExam();
    exam.title = 'Speaking Test 11';
    for (const part of exam.parts) {
        part.context = 'Shared context';
        for (const question of part.questions) {
            question.prompt = `Question ${question.number}`;
        }
    }
    for (const question of exam.parts[1].questions) {
        question.image = new File(['image'], `q${question.number}.jpg`, { type: 'image/jpeg' });
        question.image_alt = 'Two people in an office';
    }
    return exam;
}

const issuePaths = (input: unknown) =>
    speakingExamSchema.safeParse(input).error?.issues.map((issue) => issue.path.join('.')) ?? [];

describe('speakingExamSchema', () => {
    it('chấp nhận đề đủ 5 Part / 11 câu và đổi ô trống thành null', () => {
        const exam = validExam();
        exam.parts[0].context = '  ';
        const result = speakingExamSchema.safeParse(exam);

        expect(result.success).toBe(true);
        expect(result.data?.parts[0].context).toBeNull();
        expect(result.data?.parts[0].questions[0].sample_answer).toBeNull();
    });

    it('gửi qua FormData rồi parse lại phía server vẫn hợp lệ và giữ đúng ảnh', async () => {
        const parsed = speakingExamSchema.parse(validExam());
        const result = speakingExamSchema.safeParse(fromExamFormData(toExamFormData(parsed)));

        expect(result.success).toBe(true);
        const images = result.data!.parts[1].questions.map((question) => question.image);
        expect(images.map((image) => image?.name)).toEqual(['q3.jpg', 'q4.jpg']);
        expect(await images[0]!.text()).toBe('image');
    });

    it('chặn ảnh sai định dạng và ảnh ở Part không có ảnh', () => {
        const exam = validExam();
        exam.parts[1].questions[0].image = new File(['x'], 'q.gif', { type: 'image/gif' });
        exam.parts[0].questions[0].image = new File(['x'], 'q.jpg', { type: 'image/jpeg' });

        expect(issuePaths(exam)).toEqual(
            expect.arrayContaining(['parts.1.questions.0.image', 'parts.0.questions.0.image']),
        );
    });

    it('chặn Part thiếu câu hoặc sai số thứ tự câu', () => {
        const missing = validExam();
        missing.parts[2].questions.pop();
        expect(issuePaths(missing)).toContain('parts.2.questions');

        const misnumbered = validExam();
        misnumbered.parts[0].questions[1].number = 3;
        expect(issuePaths(misnumbered)).toContain('parts.0.questions');
    });

    it('chặn đề thiếu Part', () => {
        const exam = validExam();
        exam.parts.pop();
        expect(issuePaths(exam)).toEqual(['parts']);
    });

    it('bắt buộc ảnh ở Part 2 và ngữ liệu ở Part 3, 4, báo cùng lỗi field khác', () => {
        const exam = validExam();
        exam.title = '';
        exam.parts[1].questions[0].image = null;
        exam.parts[1].questions[1].image_alt = '';
        exam.parts[3].context = '';

        expect(issuePaths(exam)).toEqual(
            expect.arrayContaining([
                'title',
                'parts.1.questions.0.image',
                'parts.1.questions.1.image_alt',
                'parts.3.context',
            ]),
        );
    });
});
