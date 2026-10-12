import { LuLayers, LuMic, LuPenLine } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import { ExamSkill, ExamSource, ExamStatus } from '../types';

export const SKILL_STYLE: Record<ExamSkill, { Icon: IconType; label: string; className: string }> = {
    speaking: { Icon: LuMic, label: 'Speaking', className: 'bg-main text-sub3' },
    writing: { Icon: LuPenLine, label: 'Writing', className: 'bg-sub3 text-main' },
    combo: { Icon: LuLayers, label: 'Full Test', className: 'bg-sub2 text-white' },
};

export const STATUS_STYLE: Record<ExamStatus, { label: string; className: string; dotClassName: string }> = {
    published: { label: 'Đang khả dụng', className: 'bg-success/15 text-main', dotClassName: 'bg-success' },
    review: { label: 'Chờ thẩm định', className: 'bg-sub3/20 text-main', dotClassName: 'bg-sub3' },
    draft: { label: 'Bản nháp', className: 'bg-sub1 text-subText', dotClassName: 'bg-sub2' },
};

export const SOURCE_LABEL: Record<ExamSource, string> = {
    study4: 'Study4 AI Parsed',
    ets: 'ETS Official Import',
};
