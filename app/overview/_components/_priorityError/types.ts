import {  MdBolt, MdChecklist, MdPlayCircle, MdWarning } from 'react-icons/md';


import { IconType } from "react-icons";



export type PriorityErrorItem = {
    skill: 'Speaking' | 'Writing';
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
        skill: 'Speaking',
        part: 'Q3-4',
        task: 'Describe a picture',
        frequency: { hit: 3, total: 4 },
        title: 'Thiếu giới từ chỉ vị trí khi mô tả background',
        description:
            'Có xu hướng chuyển cảnh vội vàng mà bỏ qua các cụm từ định vị không gian cốt lõi như in the background, adjacent to, hoặc on the upper left corner.',
        impact: 'Mất điểm tiêu chí Lexical Resource',
        impactIcon: MdBolt,
        ctaLabel: 'Luyện 3 câu dạng này',
    },
    {
        skill: 'Writing',
        part: 'Q6-7',
        task: 'Respond to an email',
        frequency: { hit: 2, total: 3 },
        title: 'Quên giải quyết yêu cầu thứ hai trong Email prompt',
        description:
            'Tập trung trả lời sâu cho câu hỏi xác nhận thông tin đầu tiên dẫn tới việc thiếu phần đưa ra 02 đề xuất giải pháp (suggestions) ở đoạn kết nối theo hướng dẫn của đề bài.',
        impact: 'Hạ trần điểm Task Completion từ 4 xuống 2',
        impactIcon: MdWarning,
        ctaLabel: 'Luyện checklist trả lời email',
    },
];
