'use client';

import { LuChevronRight, LuDownload, LuRefreshCw } from 'react-icons/lu';

interface HistoryPageHeaderProps {
    onExportPdf?: () => void;
    onSyncServer?: () => void;
}

export default function HistoryPageHeader({ onExportPdf, onSyncServer }: HistoryPageHeaderProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                {/* Title & Breadcrumb */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>TOEIC Speaking & Writing</span>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span className="text-primary">Nhật ký nỗ lực học viên</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Lịch sử làm bài & Nhật ký nỗ lực
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground leading-relaxed">
                        Theo dõi toàn bộ các lượt làm bài Speaking, Writing và Thi thử hoàn chỉnh. Phân biệt rõ lượt
                        làm độc lập, làm lại và các bài chờ đồng bộ cục bộ theo chuẩn khảo thí ETS.
                    </p>
                </div>

                {/* Header Actions */}
                <div className="flex shrink-0 items-center gap-2 self-start md:self-auto">
                    <button
                        type="button"
                        onClick={onExportPdf}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-accent"
                    >
                        <LuDownload className="size-4" aria-hidden="true" />
                        <span>Báo cáo nỗ lực (PDF)</span>
                    </button>
                    <button
                        type="button"
                        onClick={onSyncServer}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                    >
                        <LuRefreshCw className="size-4" aria-hidden="true" />
                        <span>Đồng bộ máy chủ</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
