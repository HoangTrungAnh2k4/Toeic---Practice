import { LuChevronLeft, LuChevronRight, LuCircleCheckBig, LuTimerOff } from 'react-icons/lu';
import Button from '@/components/ui/button';

interface ExamNavigationProps {
    /** Nhóm câu của Part, vd "Câu 1–5". */
    rangeLabel: string;
    /** Phạm vi vừa hết giờ: cả Part (Q1-5) hoặc riêng câu đang làm (Q6-7). */
    timeUpLabel: string;
    currentIndex: number;
    totalQuestions: number;
    isTimeUp: boolean;
    onPrev: () => void;
    onNext: () => void;
    onFinish: () => void;
}

export default function ExamNavigation({
    rangeLabel,
    timeUpLabel,
    currentIndex,
    totalQuestions,
    isTimeUp,
    onPrev,
    onNext,
    onFinish,
}: ExamNavigationProps) {
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalQuestions - 1;

    return (
        <div className="flex flex-col gap-4">
            {isTimeUp && (
                <div
                    role="alert"
                    className="flex items-start gap-3 bg-destructive/10 p-4 border border-destructive/40 rounded-xl text-sm"
                >
                    <LuTimerOff className="mt-0.5 size-5 text-destructive shrink-0" aria-hidden="true" />
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-destructive">Đã hết giờ của {timeUpLabel}</span>
                        <span className="text-subText text-xs">
                            Bài làm đã được khóa và lưu lại.{' '}
                            {isLast ? 'Hãy nộp bài để lưu kết quả.' : 'Hãy chuyển sang câu tiếp theo.'}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex sm:flex-row flex-col justify-between items-stretch sm:items-center gap-3 bg-white shadow-sm p-4 border border-sub2/30 rounded-xl">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="md"
                        variant="third"
                        onClick={onPrev}
                        disabled={isFirst}
                        className="sm:flex-initial flex-1 gap-1.5 bg-white"
                    >
                        <LuChevronLeft className="size-4" aria-hidden="true" />
                        <span>Câu trước</span>
                    </Button>
                    <Button
                        type="button"
                        size="md"
                        variant="secondary"
                        onClick={onNext}
                        disabled={isLast}
                        className="sm:flex-initial flex-1 gap-1.5"
                    >
                        <span>
                            Câu tiếp theo ({Math.min(currentIndex + 2, totalQuestions)}/{totalQuestions})
                        </span>
                        <LuChevronRight className="size-4" aria-hidden="true" />
                    </Button>
                </div>

                <Button type="button" size="md" variant="primary" onClick={onFinish} className="gap-1.5">
                    <LuCircleCheckBig className="size-4" aria-hidden="true" />
                    <span>Nộp bài {rangeLabel}</span>
                </Button>
            </div>


        </div>
    );
}
