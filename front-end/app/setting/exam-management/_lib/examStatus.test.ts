import { describe, expect, it } from 'vitest';
import { getPartTemplates } from '@/lib/domain/parts';
import type { Question, Skill } from '@/lib/domain/types';
import type { RoomPart } from '@/lib/exam-library/room';
import { canChangeStatus, findPublishIssues, needsNote } from './examStatus';

/** Đề đủ dữ liệu cho mọi Part của kỹ năng; test sửa bớt từng chỗ. */
function completeParts(skill: Skill): RoomPart[] {
    return getPartTemplates(skill).map((template) => ({
        template,
        part: {
            id: `p${template.id}`,
            exam_id: 'e',
            part_template_id: template.id,
            description: null,
            context: 'Shared context',
            context_media_path: null,
        },
        questions: Array.from({ length: template.q_to - template.q_from + 1 }, (_, index): Question => ({
            id: `q${template.q_from + index}`,
            exam_part_id: `p${template.id}`,
            number: template.q_from + index,
            prompt: 'Prompt',
            stimulus: 'From: A',
            image_path: 'https://r2/exam-images/a.webp',
            image_alt: 'A man',
            audio_path: null,
            keywords: [
                { word: 'man', forms: [] },
                { word: 'box', forms: [] },
            ],
            sample_answer: null,
        })),
    }));
}

describe('canChangeStatus', () => {
    it('đi tuần tự và trả về nháp từ hai trạng thái sau', () => {
        expect(canChangeStatus('draft', 'review')).toBe(true);
        expect(canChangeStatus('review', 'published')).toBe(true);
        expect(canChangeStatus('review', 'draft')).toBe(true);
        expect(canChangeStatus('published', 'draft')).toBe(true);
    });

    it('không nhảy thẳng từ nháp lên phát hành, không đổi sang chính nó', () => {
        expect(canChangeStatus('draft', 'published')).toBe(false);
        expect(canChangeStatus('published', 'review')).toBe(false);
        expect(canChangeStatus('draft', 'draft')).toBe(false);
        expect(needsNote('draft')).toBe(true);
        expect(needsNote('published')).toBe(false);
    });
});

describe('findPublishIssues', () => {
    it('đề đủ dữ liệu thì không có lỗi', () => {
        expect(findPublishIssues('speaking', completeParts('speaking'))).toEqual([]);
        expect(findPublishIssues('writing', completeParts('writing'))).toEqual([]);
    });

    it('Writing: báo đúng câu thiếu ảnh, mô tả, từ khoá, email', () => {
        const parts = completeParts('writing');
        parts[0].questions[0].image_path = null;
        parts[0].questions[0].image_alt = ' ';
        parts[0].questions[1].keywords = [{ word: 'man', forms: [] }];
        parts[1].questions[1].stimulus = null;

        expect(findPublishIssues('writing', parts)).toEqual([
            'Câu 1: thiếu ảnh, mô tả ảnh',
            'Câu 2: thiếu đủ 2 từ khoá',
            'Câu 7: thiếu email',
        ]);
    });

    it('Speaking: báo thiếu ngữ liệu chung, thiếu câu và thiếu Part', () => {
        const parts = completeParts('speaking');
        parts[2].part.context = '';
        parts[3].questions.pop();
        parts.pop();

        expect(findPublishIssues('speaking', parts)).toEqual([
            'Part 3: thiếu ngữ liệu chung',
            'Part 4: cần đúng câu 8–10',
            'Part 5: chưa có Part này',
        ]);
    });
});
