'use client';

import {
    LuBadgeCheck,
    LuBrain,
    LuCircleCheck,
    LuClipboardList,
    LuClock,
    LuCloud,
    LuEllipsisVertical,
    LuEye,
    LuGraduationCap,
    LuMic,
    LuPenLine,
    LuRefreshCw,
    LuSave,
    LuTriangleAlert,
} from 'react-icons/lu';
import { HistoryAttempt } from '../types';

interface HistoryTableProps {
    attempts: HistoryAttempt[];
    onActionClick?: (attempt: HistoryAttempt) => void;
}

export default function HistoryTable({ attempts, onActionClick }: HistoryTableProps) {
    const getSkillIcon = (skill: HistoryAttempt['skill']) => {
        switch (skill) {
            case 'speaking':
                return (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <LuMic className="size-5" aria-hidden="true" />
                    </div>
                );
            case 'writing':
                return (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                        <LuPenLine className="size-5" aria-hidden="true" />
                    </div>
                );
            case 'full_mock':
                return (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                        <LuClipboardList className="size-5" aria-hidden="true" />
                    </div>
                );
        }
    };

    const getModeIcon = (modeType: HistoryAttempt['modeType']) => {
        switch (modeType) {
            case 'cbt':
                return <LuBadgeCheck className="size-3.5 text-primary" aria-hidden="true" />;
            case 'timed':
                return <LuClock className="size-3.5 text-emerald-600" aria-hidden="true" />;
            case 'guided':
                return <LuGraduationCap className="size-3.5 text-muted-foreground" aria-hidden="true" />;
        }
    };

    const getStorageBadge = (storage: HistoryAttempt['storage']) => {
        switch (storage) {
            case 'cloud':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        <LuCloud className="size-3.5 text-emerald-600" aria-hidden="true" />
                        <span>Đã lưu cloud</span>
                    </span>
                );
            case 'sync_pending':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-700">
                        <LuRefreshCw className="size-3.5 text-amber-600" aria-hidden="true" />
                        <span>Chờ đồng bộ cloud</span>
                    </span>
                );
            case 'local_cache':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        <LuSave className="size-3.5 text-primary" aria-hidden="true" />
                        <span>Lưu cache cục bộ</span>
                    </span>
                );
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3">Mã lượt & Tên đề thi</th>
                        <th className="px-4 py-3">Chế độ làm</th>
                        <th className="px-4 py-3">Phân loại & Hỗ trợ</th>
                        <th className="px-4 py-3">Điểm số / Đánh giá</th>
                        <th className="px-4 py-3">Thời gian nộp</th>
                        <th className="px-4 py-3">Lưu trữ</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                    {attempts.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                Không tìm thấy lượt làm bài nào phù hợp với bộ lọc.
                            </td>
                        </tr>
                    ) : (
                        attempts.map((item) => {
                            const isWarning = item.isWarningRow;
                            const isPending = item.isPendingRow;

                            return (
                                <tr
                                    key={item.id}
                                    className={`group transition-colors hover:bg-muted/50 ${
                                        isWarning
                                            ? 'bg-destructive/5'
                                            : isPending
                                              ? 'bg-amber-500/5'
                                              : ''
                                    }`}
                                >
                                    {/* Column 1: Test Identity */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-start gap-3">
                                            {getSkillIcon(item.skill)}
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`font-semibold ${
                                                            isWarning
                                                                ? 'text-destructive'
                                                                : isPending
                                                                  ? 'text-amber-700'
                                                                  : 'text-primary'
                                                        }`}
                                                    >
                                                        {item.code}
                                                    </span>
                                                    <span
                                                        className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                                                            isWarning
                                                                ? 'bg-destructive/15 text-destructive'
                                                                : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {item.part}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                                                    {item.title}
                                                </div>
                                                <div
                                                    className={`text-xs ${
                                                        isWarning
                                                            ? 'flex items-center gap-1 font-medium text-destructive'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {isWarning && (
                                                        <LuTriangleAlert className="size-3.5" aria-hidden="true" />
                                                    )}
                                                    <span>{item.topic}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Column 2: Exam Mode */}
                                    <td className="px-4 py-4 align-middle">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                                            {getModeIcon(item.modeType)}
                                            <span>{item.mode}</span>
                                        </span>
                                    </td>

                                    {/* Column 3: Category & Assistance */}
                                    <td className="px-4 py-4 align-middle">
                                        <div className="flex flex-col items-start gap-1">
                                            <span
                                                className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                                                    item.categoryBadge.includes('Làm lại')
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-emerald-500/10 text-emerald-700'
                                                }`}
                                            >
                                                {item.categoryBadge}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                {item.hasSampleViewed ? (
                                                    <LuEye className="size-3.5 text-amber-600" aria-hidden="true" />
                                                ) : (
                                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                                )}
                                                <span>{item.assistBadge}</span>
                                            </span>
                                        </div>
                                    </td>

                                    {/* Column 4: Score & Evaluation */}
                                    <td className="px-4 py-4 align-middle">
                                        <div className="space-y-0.5">
                                            {item.scoreInfo.isScoring ? (
                                                <>
                                                    <span className="inline-flex items-center gap-1.5 animate-pulse rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                                                        <LuBrain className="size-3.5" aria-hidden="true" />
                                                        <span>
                                                            AI đang chấm điểm ({item.scoreInfo.scoringProgress}%)
                                                        </span>
                                                    </span>
                                                    <div className="text-xs text-muted-foreground">
                                                        Dự kiến: {item.scoreInfo.estimatedTimeRemaining}
                                                    </div>
                                                </>
                                            ) : item.scoreInfo.isInterrupted ? (
                                                <>
                                                    <span className="inline-flex items-center rounded bg-destructive/15 px-2 py-0.5 text-[11px] font-bold text-destructive">
                                                        Chưa hoàn thành
                                                    </span>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.scoreInfo.interruptedReason}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-baseline gap-1">
                                                        <span
                                                            className={`text-base font-bold ${
                                                                item.skill === 'speaking'
                                                                    ? 'text-primary'
                                                                    : 'text-emerald-600'
                                                            }`}
                                                        >
                                                            {item.scoreInfo.score}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            / {item.scoreInfo.maxScore}
                                                        </span>
                                                        {item.scoreInfo.level && (
                                                            <span className="ml-1 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                                                {item.scoreInfo.level}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.scoreInfo.feedbackSummary && (
                                                        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                                            <LuCircleCheck className="size-3" aria-hidden="true" />
                                                            <span>{item.scoreInfo.feedbackSummary}</span>
                                                        </div>
                                                    )}
                                                    {item.scoreInfo.retakeComparison && (
                                                        <div className="text-[11px] font-medium text-emerald-600">
                                                            {item.scoreInfo.retakeComparison}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>

                                    {/* Column 5: Submitted At & Duration */}
                                    <td className="px-4 py-4 align-middle text-muted-foreground">
                                        <div className="font-medium text-foreground">{item.submittedAt}</div>
                                        <div>Thời lượng: {item.duration}</div>
                                    </td>

                                    {/* Column 6: Storage status */}
                                    <td className="px-4 py-4 align-middle">{getStorageBadge(item.storage)}</td>

                                    {/* Column 7: Actions */}
                                    <td className="px-4 py-4 align-middle text-right">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => onActionClick?.(item)}
                                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors ${
                                                    item.actionText === 'Xem lại chi tiết' ||
                                                    item.actionText === 'Tiếp tục làm tiếp'
                                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                        : 'bg-muted text-foreground hover:bg-accent'
                                                }`}
                                            >
                                                {item.actionText}
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="Thao tác khác"
                                                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            >
                                                <LuEllipsisVertical className="size-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
