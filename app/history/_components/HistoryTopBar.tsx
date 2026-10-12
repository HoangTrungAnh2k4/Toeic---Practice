'use client';

import { LuCloud, LuHeadphones, LuUser } from 'react-icons/lu';

export default function HistoryTopBar() {
    return (
        <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/90 px-6 backdrop-blur-md shadow-xs">
            {/* Left: Mode & Sync status */}
            <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1 text-xs">
                    <span className="text-muted-foreground">Chế độ:</span>
                    <span className="font-semibold text-primary">Học tập & Ôn luyện</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                    <LuCloud className="size-4 text-emerald-600" aria-hidden="true" />
                    <span>Đồng bộ cục bộ</span>
                </div>
            </div>

            {/* Right: Audio Check & Candidate Info */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                >
                    <LuHeadphones className="size-4 text-primary" aria-hidden="true" />
                    <span>Check mic & loa</span>
                </button>

                <div className="h-5 w-px bg-border" />

                <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                        <div className="text-xs font-semibold text-foreground leading-tight">Lê Hoàng Minh</div>
                        <div className="text-[11px] text-muted-foreground">Candidate ID: SW-84920</div>
                    </div>
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                        <LuUser className="size-4" aria-hidden="true" />
                    </div>
                </div>
            </div>
        </header>
    );
}
