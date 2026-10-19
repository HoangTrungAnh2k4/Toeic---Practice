import { LuCirclePause, LuPlay } from 'react-icons/lu';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { buildTestHref } from '@/lib/exam-library/search-params';
import { cn } from '@/lib/utils';
import { HistoryRow } from '../../types';

interface ReviewInterruptedStateProps {
    row: HistoryRow;
}

/** Lượt chưa nộp: đang làm dở thì tiếp tục được, bị gián đoạn thì chỉ làm lại từ đầu. */
export default function ReviewInterruptedState({ row }: ReviewInterruptedStateProps) {
    const { attempt, exam, answeredCount, questionCount } = row;
    const isInProgress = attempt.status === 'in_progress';

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
                        {isInProgress ? 'Bài làm đang dở nên chưa được chấm' : 'Bài làm bị gián đoạn nên chưa được chấm'}
                    </h2>
                    <p className="font-medium text-subText text-sm">
                        Đã lưu {answeredCount}/{questionCount} câu. Bài chưa nộp không có nhận xét và không được tính
                        vào sổ lỗi.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <Link
                    href={buildTestHref(exam.skill, exam.id, attempt.mode, attempt.part_template_id)}
                    className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'gap-2')}
                >
                    <LuPlay className="size-4" aria-hidden="true" />
                    {isInProgress ? 'Tiếp tục làm bài' : 'Làm lại đề này'}
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
