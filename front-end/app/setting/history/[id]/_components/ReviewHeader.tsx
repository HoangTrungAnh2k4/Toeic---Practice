import Link from 'next/link';
import { LuArrowLeft, LuCalendar, LuChevronRight, LuClock, LuEye } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { HistoryRow } from '../../types';
import { formatDateTime, formatDuration, getAttemptCode, getPartLabel, MODE_LABEL, SKILL_STYLE } from '../../utils';

interface ReviewHeaderProps {
    row: HistoryRow;
}

const CHIP_CLASS =
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] tracking-wider';

export default function ReviewHeader({ row }: ReviewHeaderProps) {
    const { attempt, exam, attemptNo } = row;
    const skill = SKILL_STYLE[exam.skill];
    const duration = formatDuration(attempt);

    return (
        <div className="flex flex-col gap-4">
            <Link
                href="/setting/history"
                className="inline-flex items-center gap-1.5 hover:bg-sub1 -ml-2 px-2 py-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3 w-fit font-semibold text-main text-sm transition-colors"
            >
                <LuArrowLeft className="size-4" aria-hidden="true" />
                Về lịch sử làm bài
            </Link>

            <div className="flex flex flex-col items-start gap-4 bg-main p-3 rounded-xl">
                <h1 className="font-bold text-white text-2xl sm:text-3xl tracking-tight">{exam.title}</h1>

                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn(CHIP_CLASS, 'bg-sub1 text-[#333]')}>{getPartLabel(attempt)}</span>
                    <span className={cn(CHIP_CLASS, 'bg-sub1 text-[#333]')}>{MODE_LABEL[attempt.mode]}</span>
                    <span className={cn(CHIP_CLASS, 'bg-sub1 text-[#333]')}>
                        {attemptNo > 1 ? `Làm lại #${attemptNo}` : 'Làm lần đầu'}
                    </span>
                    <span
                        className={cn(
                            CHIP_CLASS,
                            attempt.sample_viewed ? 'bg-sub3/25 text-main' : 'bg-sub1 text-main',
                        )}
                    >
                        {attempt.sample_viewed && <LuEye className="size-3" aria-hidden="true" />}
                        {attempt.sample_viewed ? 'Có xem bài mẫu' : 'Không trợ giúp'}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 pl-1 font-medium text-white text-sm">
                    <span className="flex items-center gap-1.5">
                        {formatDateTime(attempt.submitted_at ?? attempt.started_at)}
                    </span>
                    {duration && (
                        <span className="flex items-center gap-1.5">
                            <LuClock className="mt-0.5 size-3.5" aria-hidden="true" />
                            {duration}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
