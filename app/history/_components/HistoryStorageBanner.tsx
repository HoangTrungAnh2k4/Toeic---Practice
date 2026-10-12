'use client';

import { LuDownload, LuShieldCheck, LuTrash2 } from 'react-icons/lu';

interface HistoryStorageBannerProps {
    onExportData?: () => void;
    onClearCache?: () => void;
}

export default function HistoryStorageBanner({ onExportData, onClearCache }: HistoryStorageBannerProps) {
    return (
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-xs md:flex-row md:items-center">
            <div className="flex max-w-3xl items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LuShieldCheck className="size-6" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-foreground">
                            Bảo mật dữ liệu & Bộ nhớ đệm cục bộ
                        </span>
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            Chuẩn ETS Test Safe
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Toàn bộ bản ghi âm thanh và văn bản luyện thi được bảo vệ và đồng bộ liên tục về máy chủ
                        SpeakWrite. Bạn có thể trích xuất bản ghi JSON thô, tệp âm thanh WAV hoặc giải phóng bộ nhớ
                        IndexedDB trên máy tính phòng thi này bất kỳ lúc nào.
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-stretch justify-end md:self-auto">
                <button
                    type="button"
                    onClick={onExportData}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-accent"
                >
                    <LuDownload className="size-4" aria-hidden="true" />
                    <span>Xuất dữ liệu lịch sử</span>
                </button>
                <button
                    type="button"
                    onClick={onClearCache}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                    <LuTrash2 className="size-4" aria-hidden="true" />
                    <span>Giải phóng cache cũ</span>
                </button>
            </div>
        </div>
    );
}
