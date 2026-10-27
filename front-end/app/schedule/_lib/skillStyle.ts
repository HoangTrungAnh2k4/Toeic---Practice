import { LuChartLine, LuListChecks, LuMic, LuPenLine, LuTimer } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import type { PlanTaskKind } from '@/lib/domain/types';

export const SKILL_STYLE: Record<PlanTaskKind, { Icon: IconType; className: string; label: string }> = {
    speaking: { Icon: LuMic, className: 'bg-main text-sub3', label: 'Speaking' },
    writing: { Icon: LuPenLine, className: 'bg-sub3 text-main', label: 'Writing' },
    review: { Icon: LuListChecks, className: 'bg-sub2 text-white', label: 'Ôn lỗi' },
    mock: { Icon: LuTimer, className: 'bg-main text-white', label: 'Thi thử' },
    summary: { Icon: LuChartLine, className: 'bg-sub1 text-main', label: 'Tổng kết' },
};
