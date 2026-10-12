'use client';

import { LuTriangleAlert } from 'react-icons/lu';
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

interface DiscardChangesDialogProps {
    open: boolean;
    unsavedCount: number;
    confirmLabel: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export default function DiscardChangesDialog({
    open,
    unsavedCount,
    confirmLabel,
    onOpenChange,
    onConfirm,
}: DiscardChangesDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="gap-5 data-[size=default]:sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-sub3/20 text-main">
                        <LuTriangleAlert aria-hidden="true" />
                    </AlertDialogMedia>
                    <AlertDialogTitle className="font-bold text-main text-lg">Bỏ các thay đổi chưa lưu?</AlertDialogTitle>
                    <AlertDialogDescription className="text-subText">
                        Bạn đang có <strong className="font-semibold text-main">{unsavedCount} Part</strong> chưa lưu.
                        Nếu tiếp tục, toàn bộ chỉnh sửa này sẽ bị mất.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="bg-sub1/40 border-sub2/20">
                    <AlertDialogCancel variant="third" size="md" className="bg-white">
                        Tiếp tục biên tập
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="third"
                        size="md"
                        onClick={onConfirm}
                        className="bg-destructive hover:bg-destructive text-white"
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
