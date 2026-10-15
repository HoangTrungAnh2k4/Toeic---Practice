'use client';

import { LuLogOut } from 'react-icons/lu';
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

interface ExitExamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    answeredCount: number;
    totalQuestions: number;
    onConfirm: () => void;
}

export default function ExitExamDialog({
    open,
    onOpenChange,
    title,
    answeredCount, 
    totalQuestions,
    onConfirm,
}: ExitExamDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="gap-5 data-[size=default]:sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <LuLogOut aria-hidden="true" />
                    </AlertDialogMedia>
                    <AlertDialogTitle className="font-bold text-main text-lg">Thoát khỏi phòng thi?</AlertDialogTitle>
                    <AlertDialogDescription className="text-subText">
                        Bài làm vẫn được lưu trên trình duyệt này. Mở lại đề từ thư viện để làm tiếp; đồng hồ vẫn tiếp tục chạy.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <p className="bg-sub1/60 px-4 py-3 rounded-lg text-subText text-xs">
                    Bài thi: <strong className="font-semibold text-main">{title}</strong> · Đã trả lời{' '}
                    <strong className="font-semibold tabular-nums text-main">
                        {answeredCount}/{totalQuestions}
                    </strong>{' '}
                    câu nhóm 1
                </p>

                <AlertDialogFooter className="bg-sub1/40 border-sub2/20">
                    <AlertDialogCancel variant="third" size="md" className="bg-white">
                        Ở lại làm bài
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="third"
                        size="md"
                        onClick={onConfirm}
                        className="bg-destructive hover:bg-destructive text-white"
                    >
                        Thoát bài thi
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
