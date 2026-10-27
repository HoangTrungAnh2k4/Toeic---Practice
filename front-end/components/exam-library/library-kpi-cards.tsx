'use client';

import Link from 'next/link';
import { LuArrowRight, LuBrain, LuChartBar, LuLibrary } from 'react-icons/lu';
import { Skeleton } from '@/components/ui/skeleton';
import type { Skill } from '@/lib/domain/types';
import { toEntries } from '@/lib/exam-library/entries';
import type { ExamSummary } from '@/lib/exam-library/types';
import { useUserExamStates } from '@/lib/exam-library/use-user-exam-states';
import { cn } from '@/lib/utils';
import { MISTAKES_ENABLED } from '@/app/mistakes/utils';
import { SKILL_COPY } from './skill-copy';

interface LibraryKpiCardsProps {
    skill: Skill;
    exams: ExamSummary[];
}

const CARD_CLASS =
    'flex flex-col justify-between gap-4 bg-white p-5 border border-sub2/30 rounded-xl shadow-sm transition-shadow hover:shadow-md';

const LABEL_CLASS = 'font-semibold text-subText text-xs uppercase tracking-wider';

const ICON_BOX_CLASS = 'flex justify-center items-center bg-sub1 rounded-lg size-10 text-main shrink-0';

export function LibraryKpiCards({ skill, exams }: LibraryKpiCardsProps) {
    const { states, loadFailed } = useUserExamStates();
    const copy = SKILL_COPY[skill];

    const entries = states ? toEntries(exams, states) : [];
    const completed = entries.filter((entry) => entry.user.completedCount > 0).length;
    const percent = exams.length ? Math.round((completed / exams.length) * 100) : 0;
    const scored = entries
        .flatMap(({ user }) => (user.lastCompleted?.score != null ? [user.lastCompleted] : []))
        .sort((a, b) => (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''));
    const latest = scored[0];

    return (
        <div
            className={cn('gap-4 grid grid-cols-1', MISTAKES_ENABLED ? 'md:grid-cols-3' : 'md:grid-cols-2')}
            aria-busy={!states && !loadFailed}
        >
            {/* Library progress */}
            <div className={CARD_CLASS}>
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className={LABEL_CLASS}>Thư viện đề {copy.label}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-main text-3xl tracking-tight">{exams.length}</span>
                            <span className="font-semibold text-sub2 text-xs">bộ đề đang mở</span>
                        </div>
                    </div>
                    <div className={ICON_BOX_CLASS}>
                        <LuLibrary className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <div
                        role="progressbar"
                        aria-label="Tiến độ hoàn thành thư viện đề"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percent}
                        className="bg-sub1 rounded-full w-full h-2 overflow-hidden"
                    >
                        <div
                            className="bg-linear-to-r from-sub2 to-main rounded-full h-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center font-medium text-subText text-xs">
                        <span>
                            Đã hoàn thành <strong className="font-semibold text-main">{completed} đề</strong>
                        </span>
                        <span className="font-semibold text-main">{percent}%</span>
                    </div>
                </div>
            </div>

            {/* Latest score */}
            <div className={CARD_CLASS}>
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className={LABEL_CLASS}>Điểm {copy.label} gần nhất</span>
                        {!states && !loadFailed ? (
                            <Skeleton className="bg-sub1 w-24 h-9" />
                        ) : (
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-main text-3xl tracking-tight">
                                    {latest?.score ?? '—'}
                                </span>
                                <span className="font-semibold text-sub2 text-xs">/200</span>
                            </div>
                        )}
                    </div>
                    <div className={ICON_BOX_CLASS}>
                        <LuChartBar className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <p className="bg-sub1/60 px-3 py-2 rounded-lg font-medium text-main text-xs">
                    {loadFailed
                        ? 'Chưa tải được điểm, xem danh sách đề bên dưới để thử lại.'
                        : latest
                        ? `Tính từ ${scored.length} đề đã có điểm.`
                        : `Chưa có bài ${copy.label} nào được chấm điểm.`}
                </p>
            </div>

            {/* Mistake focus */}
            {MISTAKES_ENABLED && (
                <div className="flex flex-col justify-between gap-4 bg-sub3/10 shadow-sm p-5 border border-sub3/50 rounded-xl">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-3">
                            <span className={LABEL_CLASS}>Trọng tâm cần cải thiện</span>
                            <div className="flex justify-center items-center bg-sub3 rounded-lg size-10 text-main shrink-0">
                                <LuBrain className="size-5" aria-hidden="true" />
                            </div>
                        </div>
                        <p className="text-subText text-xs leading-relaxed">
                            Sổ lỗi tổng hợp các lỗi lặp lại sau khi bài làm được chấm và chỉ ra phần nên ưu tiên sửa.
                        </p>
                    </div>
                    <Link
                        href={`/mistakes?skill=${skill}`}
                        className="inline-flex items-center gap-1 self-end px-1 rounded-md font-semibold text-main text-xs hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
                    >
                        Mở sổ lỗi {copy.label}
                        <LuArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                </div>
            )}
        </div>
    );
}
