import { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
    LuCircleCheck,
    LuEye,
    LuGauge,
    LuGraduationCap,
    LuMonitor,
    LuPlay,
    LuRotateCcw,
    LuSave,
    LuStepForward,
} from 'react-icons/lu';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { buildHistoryHref, DEFAULT_HISTORY_QUERY } from '@/app/setting/history/_lib/searchParams';
import { cn } from '@/lib/utils';
import { WRITING_TEST_PATH } from '../utils';
import {
    AttemptedWritingTest,
    BadgeTone,
    FreshWritingTest,
    GuidedWritingTest,
    InProgressWritingTest,
    WritingTest,
} from '../types';

interface WritingTestCardProps {
    test: WritingTest;
}

interface CardShellProps {
    test: WritingTest;
    badge: string;
    badgeTone: BadgeTone;
    meta: ReactNode;
    footer: ReactNode;
    className?: string;
    children: ReactNode;
}

const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
    main: 'bg-main text-sub3',
    sub2: 'bg-sub2 text-white',
    sub3: 'bg-sub3 text-main',
    neutral: 'bg-sub1 text-main',
};

const HIGHLIGHT_STYLE: Record<FreshWritingTest['highlightType'], { Icon: IconType; className: string }> = {
    cbt: { Icon: LuMonitor, className: 'text-sub2' },
    difficulty: { Icon: LuGauge, className: 'text-destructive' },
};

const SUMMARY_STRIP_CLASS =
    'flex flex-wrap justify-between items-center gap-x-3 gap-y-1 bg-sub1/50 px-3 py-2 rounded-lg font-medium text-subText text-xs';

const META_CLASS = 'inline-flex items-center gap-1 font-semibold text-subText text-xs';

function CardShell({ test, badge, badgeTone, meta, footer, className, children }: CardShellProps) {
    const titleId = `writing-test-${test.id}`;

    return (
        <article
            aria-labelledby={titleId}
            className={cn(
                'flex flex-col justify-between gap-4 bg-white shadow-sm hover:shadow-md p-5 border border-sub2/30 rounded-xl transition-shadow',
                className,
            )}
        >
            <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center gap-2">
                    <span
                        className={cn(
                            'px-2 py-0.5 rounded-md font-bold text-[11px] uppercase tracking-wide',
                            BADGE_TONE_CLASS[badgeTone],
                        )}
                    >
                        {badge}
                    </span>
                    {meta}
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="font-mono font-semibold text-[11px] text-sub2">{test.code}</span>
                    <h3 id={titleId} className="font-bold text-main text-base leading-snug">
                        {test.title}
                    </h3>
                </div>
                {children}
            </div>
            <div className="flex flex-col gap-3">{footer}</div>
        </article>
    );
}

function FreshCard({ test }: { test: FreshWritingTest }) {
    const { Icon, className } = HIGHLIGHT_STYLE[test.highlightType];

    return (
        <CardShell
            test={test}
            badge={test.badge}
            badgeTone={test.badgeTone}
            meta={
                <span className={META_CLASS}>
                    <Icon className={cn('size-4', className)} aria-hidden="true" />
                    {test.highlight}
                </span>
            }
            footer={
                <>
                    <div className={SUMMARY_STRIP_CLASS}>
                        <span>{test.summary}</span>
                        <span className="font-semibold text-main">{test.statusLabel}</span>
                    </div>
                    <Link
                        href={WRITING_TEST_PATH}
                        className={cn(
                            buttonVariants({ variant: test.isRecommended ? 'primary' : 'third', size: 'sm' }),
                            'gap-2 w-full',
                            !test.isRecommended && 'bg-white',
                        )}
                    >
                        <LuPlay className="size-4" aria-hidden="true" />
                        <span>Bắt đầu thi</span>
                    </Link>
                </>
            }
        >
            <ul className="flex flex-wrap gap-1.5" aria-label="Chủ đề trong đề">
                {test.tags.map((tag) => (
                    <li key={tag} className="bg-sub1/60 px-1.5 py-0.5 rounded font-medium text-[11px] text-main">
                        #{tag}
                    </li>
                ))}
            </ul>
            <p className="text-subText text-xs line-clamp-2 leading-relaxed">{test.description}</p>
        </CardShell>
    );
}

function AttemptedCard({ test }: { test: AttemptedWritingTest }) {
    return (
        <CardShell
            test={test}
            badge={`Đã thi ${test.attemptCount} lượt`}
            badgeTone="neutral"
            meta={<span className={META_CLASS}>{test.lastAttemptAt}</span>}
            footer={
                <>
                    <dl className="grid grid-cols-3 bg-sub1/50 py-2 rounded-lg text-center">
                        {test.metrics.map(({ label, value }) => (
                            <div key={label} className="flex flex-col gap-0.5">
                                <dt className="font-medium text-[11px] text-subText">{label}</dt>
                                <dd className="font-bold text-main text-xs">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="gap-2 grid grid-cols-2">
                        <Link
                            href={buildHistoryHref(DEFAULT_HISTORY_QUERY, {
                                skill: 'writing',
                                searchQuery: test.title,
                            })}
                            className={cn(
                                buttonVariants({ variant: 'third', size: 'sm' }),
                                'gap-1.5 bg-white px-2 text-xs',
                            )}
                        >
                            <LuEye className="size-4" aria-hidden="true" />
                            <span>Xem & sửa lỗi</span>
                        </Link>
                        <Link
                            href={WRITING_TEST_PATH}
                            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'gap-1.5 px-2 text-xs')}
                        >
                            <LuRotateCcw className="size-4" aria-hidden="true" />
                            <span>Làm lại (lần {test.attemptCount + 1})</span>
                        </Link>
                    </div>
                </>
            }
        >
            <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-baseline gap-1">
                    <span className="font-bold text-main text-2xl tracking-tight">{test.score}</span>
                    <span className="font-semibold text-sub2 text-xs">/200 · {test.level}</span>
                </div>
                <span className="bg-destructive/10 px-2 py-0.5 rounded-md font-semibold text-[11px] text-destructive">
                    {test.weakness}
                </span>
            </div>
            <p className="bg-sub1/50 p-2.5 rounded-lg text-subText text-xs leading-relaxed">
                <strong className="font-semibold text-main">AI ghi nhận:</strong> {test.aiNote}
            </p>
        </CardShell>
    );
}

function InProgressCard({ test }: { test: InProgressWritingTest }) {
    const percent = Math.round((test.answered / test.totalQuestions) * 100);

    return (
        <CardShell
            test={test}
            badge="Đang làm dở"
            badgeTone="sub3"
            className="border-sub3/60"
            meta={
                <span className={META_CLASS}>
                    <LuSave className="size-4 text-sub2" aria-hidden="true" />
                    Lưu cục bộ
                </span>
            }
            footer={
                <>
                    <p className="text-subText text-xs">Phiên thi tự động hết hạn sau 48h nếu không tiếp tục.</p>
                    <Link
                        href={WRITING_TEST_PATH}
                        className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'gap-2 w-full')}
                    >
                        <LuStepForward className="size-4" aria-hidden="true" />
                        <span>Tiếp tục làm bài</span>
                    </Link>
                </>
            }
        >
            <p className="bg-sub3/10 p-2.5 border border-sub3/40 rounded-lg text-main text-xs leading-relaxed">
                <strong className="font-semibold">{test.stoppedAt}</strong> · {test.savedNote}
            </p>
            <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-medium text-subText text-xs">
                    <span>
                        Tiến độ:{' '}
                        <strong className="font-semibold text-main">
                            {test.answered}/{test.totalQuestions} câu
                        </strong>
                    </span>
                    <span>
                        Còn lại <span className="font-mono font-semibold text-main">{test.timeRemaining}</span>
                    </span>
                </div>
                <div
                    role="progressbar"
                    aria-label="Tiến độ làm bài"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    className="bg-sub1 rounded-full w-full h-2 overflow-hidden"
                >
                    <div className="bg-sub3 rounded-full h-full" style={{ width: `${percent}%` }} />
                </div>
            </div>
        </CardShell>
    );
}

function GuidedCard({ test }: { test: GuidedWritingTest }) {
    return (
        <CardShell
            test={test}
            badge="Học có hướng dẫn"
            badgeTone="sub2"
            meta={<span className={META_CLASS}>Tự do thời gian</span>}
            footer={
                <>
                    <div className={SUMMARY_STRIP_CLASS}>
                        <span>{test.summary}</span>
                        <span className="font-semibold text-main">{test.statusLabel}</span>
                    </div>
                    <Link
                        href={`${WRITING_TEST_PATH}?mode=guided`}
                        className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'gap-2 w-full')}
                    >
                        <LuGraduationCap className="size-4" aria-hidden="true" />
                        <span>Luyện có hướng dẫn</span>
                    </Link>
                </>
            }
        >
            <ul className="flex flex-col gap-1.5 text-subText text-xs">
                {test.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-1.5">
                        <LuCircleCheck className="size-4 text-sub2 shrink-0" aria-hidden="true" />
                        {feature}
                    </li>
                ))}
            </ul>
        </CardShell>
    );
}

export default function WritingTestCard({ test }: WritingTestCardProps) {
    switch (test.kind) {
        case 'fresh':
            return <FreshCard test={test} />;
        case 'attempted':
            return <AttemptedCard test={test} />;
        case 'in_progress':
            return <InProgressCard test={test} />;
        case 'guided':
            return <GuidedCard test={test} />;
    }
}
