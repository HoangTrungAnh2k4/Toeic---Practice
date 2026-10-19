import type { PartTemplate, Skill } from './types';

/** Format TOEIC Speaking & Writing hiện hành của ETS (Speaking 11 câu, Writing 8 câu). */
export const PART_TEMPLATES: PartTemplate[] = [
    {
        id: 1,
        skill: 'speaking',
        part_no: 1,
        q_from: 1,
        q_to: 2,
        task: 'Read a text aloud',
        context_sec: null,
        prep_sec: 45,
        response_sec: [45, 45],
        section_sec: null,
    },
    {
        id: 2,
        skill: 'speaking',
        part_no: 2,
        q_from: 3,
        q_to: 4,
        task: 'Describe a picture',
        context_sec: null,
        prep_sec: 45,
        response_sec: [30, 30],
        section_sec: null,
    },
    {
        id: 3,
        skill: 'speaking',
        part_no: 3,
        q_from: 5,
        q_to: 7,
        task: 'Respond to questions',
        context_sec: null,
        prep_sec: 3,
        response_sec: [15, 15, 30],
        section_sec: null,
    },
    {
        id: 4,
        skill: 'speaking',
        part_no: 4,
        q_from: 8,
        q_to: 10,
        task: 'Respond to questions using information provided',
        context_sec: 45,
        prep_sec: 3,
        response_sec: [15, 15, 30],
        section_sec: null,
    },
    {
        id: 5,
        skill: 'speaking',
        part_no: 5,
        q_from: 11,
        q_to: 11,
        task: 'Express an opinion',
        context_sec: null,
        prep_sec: 45,
        response_sec: [60],
        section_sec: null,
    },
    {
        id: 6,
        skill: 'writing',
        part_no: 1,
        q_from: 1,
        q_to: 5,
        task: 'Write a sentence based on a picture',
        context_sec: null,
        prep_sec: null,
        response_sec: null,
        section_sec: 8 * 60,
    },
    {
        id: 7,
        skill: 'writing',
        part_no: 2,
        q_from: 6,
        q_to: 7,
        task: 'Respond to a written request',
        context_sec: null,
        prep_sec: null,
        response_sec: [10 * 60, 10 * 60],
        section_sec: null,
    },
    {
        id: 8,
        skill: 'writing',
        part_no: 3,
        q_from: 8,
        q_to: 8,
        task: 'Write an opinion essay',
        context_sec: null,
        prep_sec: null,
        response_sec: [30 * 60],
        section_sec: null,
    },
];

/** Thời lượng chính thức của một bài thi đầy đủ (phút). */
export const TEST_DURATION_MIN: Record<Skill, number> = { speaking: 20, writing: 60 };

export function getPartTemplates(skill: Skill): PartTemplate[] {
    return PART_TEMPLATES.filter((part) => part.skill === skill);
}

/** Tổng thời gian làm một Part: đồng hồ chung, hoặc cộng thời gian từng câu (`null` khi không có cả hai). */
export function getPartDurationSec(part: PartTemplate): number | null {
    return part.section_sec ?? part.response_sec?.reduce((sum, sec) => sum + sec, 0) ?? null;
}

/** Part chứa câu `number` của kỹ năng `skill`. */
export function findPartTemplate(skill: Skill, number: number): PartTemplate | undefined {
    return PART_TEMPLATES.find((part) => part.skill === skill && number >= part.q_from && number <= part.q_to);
}
