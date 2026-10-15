import Link from 'next/link';
import { LuArrowLeft, LuCalendar, LuChevronRight, LuClock, LuEye } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { HistoryRow } from '../../types';
import {
    formatDateTime,
    formatDuration,
    getAttemptCode,
    getPartLabel,
    MODE_LABEL,
    SKILL_STYLE,
} from '../../utils';

interface ReviewHeaderProps {
    row: HistoryRow;
}

const CHIP_CLASS = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] tracking-wider';

export default function ReviewHeader({ row }: ReviewHeaderProps) {
    const { attempt, exam, attemptNo } = row;
    const skill = SKILL_STYLE[exam.skill];
    const duration = formatDuration(attempt);

    return (
        <div className="flex flex-col gap-4">
            <Link
                href="/setting/history"
                className="inline-flex items-center gap-1.5 hover:bg-sub1 -ml-2 px-2 py-1 rounded-lg w-fit font-semibold text-main text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
            >
                <LuArrowLeft className="size-4" aria-hidden="true" />
                Về lịch sử làm bài
            </Link>

            <div className="flex items-start gap-3">
                <span
                    className={cn(
                        'hidden sm:flex justify-center items-center shadow-sm rounded-xl size-12 shrink-0',
                        skill.className,
                    )}
                >
                    <skill.Icon className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-2 min-w-0">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 font-semibold text-subText text-xs uppercase tracking-wider"
                    >
                        <Link href="/setting" className="hover:text-main transition-colors">
                            Cài đặt
                        </Link>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <Link href="/setting/history" className="hover:text-main transition-colors">
                            Lịch sử làm bài
                        </Link>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span className="text-main tabular-nums">{getAttemptCode(attempt)}</span>
                    </nav>
                    <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">{exam.title}</h1>
                    <p className="font-medium text-subText text-sm">{exam.code}</p>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn(CHIP_CLASS, 'bg-main text-sub1')}>{skill.label}</span>
                        <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>{getPartLabel(attempt)}</span>
                        <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>{MODE_LABEL[attempt.mode]}</span>
                        <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>{attemptNo > 1 ? `Làm lại #${attemptNo}` : 'Làm lần đầu'}</span>
                        <span className={cn(CHIP_CLASS, attempt.sample_viewed ? 'bg-sub3/25 text-main' : 'bg-sub1 text-main')}>
                            {attempt.sample_viewed && <LuEye className="size-3" aria-hidden="true" />}
                            {attempt.sample_viewed ? 'Có xem bài mẫu' : 'Không trợ giúp'}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-medium text-subText text-xs">
                        <span className="flex items-center gap-1.5">
                            <LuCalendar className="size-3.5" aria-hidden="true" />
                            {formatDateTime(attempt.submitted_at ?? attempt.started_at)}
                        </span>
                        {duration && (
                            <span className="flex items-center gap-1.5">
                                <LuClock className="size-3.5" aria-hidden="true" />
                                {duration}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
