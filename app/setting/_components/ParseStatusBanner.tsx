import { LuBadgeCheck, LuCircleAlert, LuCircleCheck, LuLoaderCircle } from 'react-icons/lu';
import { ParseStatus, StudioExam } from '../types';

interface ParseStatusBannerProps {
    status: ParseStatus;
    exam: StudioExam | null;
    errorMessage: string | null;
}

export default function ParseStatusBanner({ status, exam, errorMessage }: ParseStatusBannerProps) {
    return (
        <div role="status" aria-live="polite">
            {status === 'parsing' && (
                <div className="flex items-center gap-3 bg-sub1/60 p-4 rounded-lg">
                    <LuLoaderCircle className="size-5 text-main motion-safe:animate-spin shrink-0" aria-hidden="true" />
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-main text-sm">AI đang đọc cấu trúc đề thi…</span>
                        <span className="text-subText text-xs">
                            Đang tải audio prompt, hình ảnh và đối chiếu với format ETS. Quá trình mất vài giây.
                        </span>
                    </div>
                </div>
            )}

            {status === 'success' && exam && (
                <div className="flex md:flex-row flex-col justify-between md:items-center gap-3 bg-success/10 p-4 border border-success/40 rounded-lg">
                    <div className="flex items-start gap-3">
                        <span className="flex justify-center items-center bg-success/20 rounded-full size-8 text-main shrink-0">
                            <LuCircleCheck className="size-4" aria-hidden="true" />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-main text-sm">
                                Đã bóc tách thành công {exam.questionCount} câu hỏi Speaking chuẩn ETS
                            </span>
                            <span className="text-subText text-xs leading-relaxed">{exam.parseSummary}</span>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 self-start md:self-auto bg-white px-2.5 py-1 border border-sub2/30 rounded-full font-semibold text-main text-xs whitespace-nowrap shrink-0">
                        <LuBadgeCheck className="size-3.5 text-sub2" aria-hidden="true" />
                        IIG Format 2024 · Rubric Level 1–8
                    </span>
                </div>
            )}

            {status === 'error' && (
                <div className="flex items-start gap-3 bg-destructive/10 p-4 border border-destructive/30 rounded-lg">
                    <LuCircleAlert className="mt-0.5 size-5 text-destructive shrink-0" aria-hidden="true" />
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-destructive text-sm">Không thể bóc tách đề thi</span>
                        <span className="text-subText text-xs">
                            {errorMessage ?? 'Đã xảy ra lỗi không xác định.'} Kiểm tra lại link hoặc thử lại sau ít
                            phút.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
