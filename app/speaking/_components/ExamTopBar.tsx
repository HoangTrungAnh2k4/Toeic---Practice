'use client';

import { LuAudioLines, LuLogOut, LuShieldCheck } from 'react-icons/lu';

interface ExamTopBarProps {
    onOpenExitModal: () => void;
}

export default function ExamTopBar({ onOpenExitModal }: ExamTopBarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-6 py-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <LuAudioLines className="size-5 text-primary" aria-hidden="true" />
                    <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                        TOEIC Speaking Mock Test 04
                    </span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                    <span className="size-2 animate-ping rounded-full bg-destructive" />
                    <span className="uppercase tracking-wider">Chế độ: Thi thử chuẩn</span>
                </div>
                <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Không trợ giúp • Khóa nhảy câu
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden items-center gap-1.5 text-xs font-medium text-emerald-600 sm:flex">
                    <LuShieldCheck className="size-4" aria-hidden="true" />
                    <span>Đã lưu cục bộ • Sẵn sàng đồng bộ</span>
                </div>
                <button
                    type="button"
                    onClick={onOpenExitModal}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                >
                    <LuLogOut className="size-4" aria-hidden="true" />
                    <span>Thoát bài thi</span>
                </button>
            </div>
        </div>
    );
}
