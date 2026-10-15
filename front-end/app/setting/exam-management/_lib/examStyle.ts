import { LuMic, LuPenLine } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import { ExamSkill, ExamSource, ExamStatus } from '../types';

export const SKILL_STYLE: Record<ExamSkill, { Icon: IconType; label: string; className: string }> = {
    speaking: { Icon: LuMic, label: 'Speaking', className: 'bg-main text-sub3' },
    writing: { Icon: LuPenLine, label: 'Writing', className: 'bg-sub3 text-main' },
};

export const STATUS_STYLE: Record<ExamStatus, { label: string; className: string; dotClassName: string }> = {
    published: { label: 'Đang khả dụng', className: 'bg-success/15 text-main', dotClassName: 'bg-success' },
    review: { label: 'Chờ thẩm định', className: 'bg-sub3/20 text-main', dotClassName: 'bg-sub3' },
    draft: { label: 'Bản nháp', className: 'bg-sub1 text-subText', dotClassName: 'bg-sub2' },
};

export const SOURCE_LABEL: Record<ExamSource, string> = {
    ets: 'ETS chính thức',
    internal: 'Biên soạn nội bộ',
};
