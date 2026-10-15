'use client';

import { LuCircleCheckBig, LuTriangleAlert } from 'react-icons/lu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SubmitSectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    answers: string[];
    isTimeUp: boolean;
    onConfirm: () => void;
}

export default function SubmitSectionDialog({ open, onOpenChange, answers, isTimeUp, onConfirm }: SubmitSectionDialogProps) {
    const unanswered = answers.flatMap((answer, index) => (answer.trim() ? [] : [index + 1]));
    const answeredCount = answers.length - unanswered.length;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="gap-5 data-[size=default]:sm:max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-sub3 text-main">
                        <LuCircleCheckBig aria-hidden="true" />
                    </AlertDialogMedia>
                    <AlertDialogTitle className="font-bold text-main text-lg">Xác nhận nộp bài Câu 1–5</AlertDialogTitle>
                    <AlertDialogDescription className="text-subText">
                        Phòng thi hiện mới có nhóm Câu 1–5; phần Email (Câu 6–7) và Essay (Câu 8) sẽ được bổ sung sau.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between items-center bg-sub1/60 px-4 py-3 rounded-lg">
                        <span className="text-subText">Đã trả lời</span>
                        <strong className="font-bold tabular-nums text-main">
                            {answeredCount}/{answers.length} câu
                        </strong>
                    </div>

                    {unanswered.length > 0 && (
                        <p className="flex items-start gap-2 bg-destructive/10 p-3 border border-destructive/30 rounded-lg text-destructive text-xs leading-relaxed">
                            <LuTriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            <span>
                                Còn bỏ trống câu {unanswered.join(', ')}. Câu bỏ trống sẽ nhận 0 điểm.
                            </span>
                        </p>
                    )}

                    <ul className="flex flex-col gap-1.5 pl-5 text-subText text-xs leading-relaxed list-disc">
                        <li>
                            Bạn <strong className="text-main">không thể quay lại</strong> chỉnh sửa Câu 1–5 sau khi nộp.
                        </li>
                    </ul>
                </div>

                <AlertDialogFooter className="bg-sub1/40 border-sub2/20">
                    {!isTimeUp && (
                        <AlertDialogCancel variant="third" size="md" className="bg-white">
                            Tiếp tục làm Câu 1–5
                        </AlertDialogCancel>
                    )}
                    <AlertDialogAction variant="primary" size="md" onClick={onConfirm}>
                        Đồng ý nộp bài
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
