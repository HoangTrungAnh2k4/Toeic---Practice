import { LuChevronLeft, LuChevronRight, LuCircleCheckBig, LuLightbulb, LuTimerOff } from 'react-icons/lu';
import Button from '@/components/ui/button';

interface ExamNavigationProps {
    currentIndex: number;
    totalQuestions: number;
    isTimeUp: boolean;
    onPrev: () => void;
    onNext: () => void;
    onFinish: () => void;
}

export default function ExamNavigation({
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
                        <span className="font-semibold text-destructive">Đã hết 8 phút của nhóm 1</span>
                        <span className="text-subText text-xs">
                            Bài làm đã được khóa và lưu lại. Hãy nộp nhóm 1 để chuyển sang phần Email.
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
                        className="flex-1 sm:flex-initial gap-1.5 bg-white"
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
                        className="flex-1 sm:flex-initial gap-1.5"
                    >
                        <span>
                            Câu tiếp theo ({Math.min(currentIndex + 2, totalQuestions)}/{totalQuestions})
                        </span>
                        <LuChevronRight className="size-4" aria-hidden="true" />
                    </Button>
                </div>

                <Button type="button" size="md" variant="primary" onClick={onFinish} className="gap-1.5">
                    <LuCircleCheckBig className="size-4" aria-hidden="true" />
                    <span>Nộp nhóm 1 & sang Email</span>
                </Button>
            </div>

            <aside className="flex items-start gap-3 bg-sub1 p-4 border border-sub2/30 rounded-xl">
                <span className="flex justify-center items-center bg-sub3 rounded-lg size-8 text-main shrink-0">
                    <LuLightbulb className="size-4" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1 text-xs leading-relaxed">
                    <span className="font-semibold text-main text-sm">Lời khuyên giám khảo</span>
                    <span className="text-subText">
                        Không viết hai câu riêng lẻ. Dùng liên từ phụ thuộc (while, because, although) hoặc mệnh đề
                        quan hệ để tạo một câu phức tự nhiên và đạt trọn 3/3 điểm.
                    </span>
                </div>
            </aside>
        </div>
    );
}
