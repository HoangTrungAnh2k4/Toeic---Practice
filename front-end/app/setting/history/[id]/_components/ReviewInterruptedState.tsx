import { LuCirclePause, LuPlay } from 'react-icons/lu';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HistoryAttempt } from '../../types';

interface ReviewInterruptedStateProps {
    attempt: HistoryAttempt;
}

/** Full mock bắt đầu bằng Speaking nên quay lại phòng thi Speaking. */
const RESUME_HREF: Record<HistoryAttempt['skill'], string> = {
    speaking: '/speaking/test',
    writing: '/writing/test',
    full_mock: '/speaking/test',
};

export default function ReviewInterruptedState({ attempt }: ReviewInterruptedStateProps) {
    return (
        <section
            aria-labelledby="interrupted-title"
            className="flex flex-col gap-4 bg-card shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl"
        >
            <div className="flex items-start gap-3">
                <span className="flex justify-center items-center bg-sub1 rounded-lg size-10 text-main shrink-0">
                    <LuCirclePause className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                    <h2 id="interrupted-title" className="font-bold text-main text-lg tracking-tight">
                        Bài làm chưa hoàn thành nên chưa được chấm
                    </h2>
                    <p className="font-medium text-subText text-sm">
                        {attempt.topic}. {attempt.scoreInfo.interruptedReason}. Bài chưa nộp không có nhận xét và không
                        được tính vào sổ lỗi.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <Link
                    href={RESUME_HREF[attempt.skill]}
                    className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'gap-2')}
                >
                    <LuPlay className="size-4" aria-hidden="true" />
                    Tiếp tục làm bài
                </Link>
                <Link
                    href="/setting/history"
                    className={cn(buttonVariants({ variant: 'third', size: 'md' }), 'bg-card')}
                >
                    Về lịch sử làm bài
                </Link>
            </div>
        </section>
    );
}
