import { LuCirclePause, LuPlay, LuSave } from 'react-icons/lu';
import LinkButton from '@/components/ui/link-button';
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
    const isLocal = attempt.storage === 'local_cache';

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

            {isLocal && (
                <p className="flex items-start gap-2 bg-sub3/10 p-3 border border-sub3/50 rounded-lg font-medium text-main text-xs">
                    <LuSave className="mt-px size-4 shrink-0" aria-hidden="true" />
                    Phần đã làm đang lưu trên thiết bị này. Hãy tiếp tục trên cùng trình duyệt để không mất dữ liệu.
                </p>
            )}

            <div className="flex flex-wrap gap-3">
                <LinkButton href={RESUME_HREF[attempt.skill]} variant="primary" size="md" className="gap-2">
                    <LuPlay className="size-4" aria-hidden="true" />
                    Tiếp tục làm bài
                </LinkButton>
                <LinkButton href="/setting/history" variant="third" size="md" className="bg-card">
                    Về lịch sử làm bài
                </LinkButton>
            </div>
        </section>
    );
}
