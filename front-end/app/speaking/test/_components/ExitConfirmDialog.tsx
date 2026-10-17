'use client';

import { LuTriangleAlert } from 'react-icons/lu';

interface ExitConfirmDialogProps {
    isOpen: boolean;
    examTitle: string;
    currentQuestion: number;
    totalQuestions: number;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ExitConfirmDialog({
    isOpen,
    examTitle,
    currentQuestion,
    totalQuestions,
    onClose,
    onConfirm,
}: ExitConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div
            className="z-50 fixed inset-0 flex justify-center items-center bg-slate-950/60 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-modal-title"
        >
            <div className="flex flex-col gap-4 bg-card shadow-xl p-6 border border-border rounded-xl w-full max-w-md animate-in duration-200 fade-in zoom-in-95">
                <div className="flex justify-center items-center bg-destructive/10 rounded-full size-12 text-destructive">
                    <LuTriangleAlert className="size-6" aria-hidden="true" />
                </div>

                <div className="flex flex-col gap-1.5">
                    <h3 id="exit-modal-title" className="font-semibold text-foreground text-base">
                        Cảnh báo: Hủy bài thi thử?
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        Nếu thoát bây giờ, bài thi sẽ không có tổng điểm và không làm tiếp được. Câu đang ghi âm dở
                        sẽ bị bỏ.
                    </p>
                </div>

                <div className="bg-muted p-3 rounded-lg text-foreground text-xs">
                    Bài thi đang làm: <strong className="font-semibold text-primary">{examTitle}</strong>{' '}
                    (Câu {currentQuestion}/{totalQuestions})
                </div>

                <div className="flex justify-end items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-muted/70 hover:bg-muted px-4 py-2 border border-border rounded-lg font-semibold text-foreground text-xs transition-colors cursor-pointer"
                    >
                        Tiếp tục làm bài
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="bg-destructive hover:bg-destructive/90 px-4 py-2 rounded-lg font-semibold text-white text-xs transition-colors cursor-pointer"
                    >
                        Xác nhận thoát
                    </button>
                </div>
            </div>
        </div>
    );
}
