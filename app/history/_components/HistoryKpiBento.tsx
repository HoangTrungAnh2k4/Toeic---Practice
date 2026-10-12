'use client';

import { LuBadgeCheck, LuChartBar, LuHistory, LuHourglass } from 'react-icons/lu';

export default function HistoryKpiBento() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Metric 1: Total Attempts */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Tổng số lượt làm bài
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-foreground">28</span>
                            <span className="text-xs font-semibold text-emerald-600">+4 tuần này</span>
                        </div>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <LuHistory className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <span>
                        Speaking: <strong className="font-semibold text-foreground">16</strong>
                    </span>
                    <span className="h-3 w-px bg-border" />
                    <span>
                        Writing: <strong className="font-semibold text-foreground">12</strong>
                    </span>
                </div>
            </div>

            {/* Metric 2: Average Score Estimator */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Điểm ước tính trung bình
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-primary">
                                S: 135<span className="text-xs font-normal text-muted-foreground">/200</span>
                            </span>
                            <span className="text-xs text-border">|</span>
                            <span className="text-xl font-bold text-emerald-600">
                                W: 145<span className="text-xs font-normal text-muted-foreground">/200</span>
                            </span>
                        </div>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <LuChartBar className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>ETS Range: Level 6 - Phù hợp mục tiêu 300+</span>
                </div>
            </div>

            {/* Metric 3: Independent Practice Ratio */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Làm chuẩn (Không trợ giúp)
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-foreground">72%</span>
                            <span className="text-xs font-semibold text-primary">20/28 lượt</span>
                        </div>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                        <LuBadgeCheck className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="mt-4 flex items-center">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: '72%' }}
                        />
                    </div>
                </div>
            </div>

            {/* Metric 4: Pending Processing & Local Sync */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Bài chờ chấm / Chờ đồng bộ
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-amber-600">2</span>
                            <span className="text-xs font-semibold text-amber-700">Cần xử lý</span>
                        </div>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                        <LuHourglass className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                    <span className="flex items-center gap-1.5 font-medium">
                        <span className="size-1.5 animate-pulse rounded-full bg-amber-600" />1 Local cache
                    </span>
                    <span className="h-3 w-px bg-amber-200" />
                    <span className="font-medium">1 AI đang chấm</span>
                </div>
            </div>
        </div>
    );
}
