'use client';

import { LuTrash2 } from 'react-icons/lu';
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
import { ExamLibraryItem } from '../types';
import { formatCount } from '../utils';

interface DeleteExamDialogProps {
    open: boolean;
    exam: ExamLibraryItem | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export default function DeleteExamDialog({ open, exam, onOpenChange, onConfirm }: DeleteExamDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="gap-5 data-[size=default]:sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <LuTrash2 aria-hidden="true" />
                    </AlertDialogMedia>
                    <AlertDialogTitle className="font-bold text-main text-lg">Xóa đề thi khỏi kho?</AlertDialogTitle>
                    <AlertDialogDescription className="text-subText">
                        Đề sẽ bị gỡ khỏi Thư viện và thí sinh không thể làm đề này nữa. Hành động này không thể hoàn
                        tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {exam && (
                    <p className="bg-sub1/60 px-4 py-3 rounded-lg text-subText text-xs">
                        <strong className="font-semibold text-main">{exam.title}</strong>
                        <br />
                        <span className="font-mono">{exam.code}</span> · {formatCount(exam.stats?.attempt_count ?? 0)} lượt thi
                    </p>
                )}

                <AlertDialogFooter className="bg-sub1/40 border-sub2/20">
                    <AlertDialogCancel variant="third" size="md" className="bg-white">
                        Giữ lại
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="third"
                        size="md"
                        onClick={onConfirm}
                        className="bg-destructive hover:bg-destructive text-white"
                    >
                        Xóa đề thi
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
