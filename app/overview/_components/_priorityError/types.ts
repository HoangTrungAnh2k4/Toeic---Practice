import type { IconType } from 'react-icons';
import { LuTriangleAlert, LuZap } from 'react-icons/lu';

export type ErrorSkill = 'Speaking' | 'Writing';

export type PriorityErrorItem = {
    id: string;
    skill: ErrorSkill;
    part: string;
    task: string;
    frequency: { hit: number; total: number };
    title: string;
    description: string;
    impact: string;
    impactIcon: IconType;
    ctaLabel: string;
};

export const ERRORS: PriorityErrorItem[] = [
    {
        id: 'speaking-q3-4-background-prepositions',
        skill: 'Speaking',
        part: 'Q3-4',
        task: 'Describe a picture',
        frequency: { hit: 3, total: 4 },
        title: 'Thiếu giới từ chỉ vị trí khi mô tả background',
        description:
            'Có xu hướng chuyển cảnh vội vàng mà bỏ qua các cụm từ định vị không gian cốt lõi như in the background, adjacent to, hoặc on the upper left corner.',
        impact: 'Mất điểm tiêu chí Lexical Resource',
        impactIcon: LuZap,
        ctaLabel: 'Luyện 3 câu dạng này',
    },
    {
        id: 'writing-q6-7-second-request',
        skill: 'Writing',
        part: 'Q6-7',
        task: 'Respond to an email',
        frequency: { hit: 2, total: 3 },
        title: 'Quên giải quyết yêu cầu thứ hai trong Email prompt',
        description:
            'Tập trung trả lời sâu cho câu hỏi xác nhận thông tin đầu tiên dẫn tới việc thiếu phần đưa ra 02 đề xuất giải pháp (suggestions) ở đoạn kết nối theo hướng dẫn của đề bài.',
        impact: 'Hạ trần điểm Task Completion từ 4 xuống 2',
        impactIcon: LuTriangleAlert,
        ctaLabel: 'Luyện checklist trả lời email',
    },
];

export const SKILL_STYLE: Record<ErrorSkill, { accent: string; badge: string }> = {
    Speaking: {
        accent: 'bg-main',
        badge: 'bg-main text-sub1',
    },
    Writing: {
        accent: 'bg-sub2',
        badge: 'bg-sub1 text-main ring-1 ring-sub2/60',
    },
};
