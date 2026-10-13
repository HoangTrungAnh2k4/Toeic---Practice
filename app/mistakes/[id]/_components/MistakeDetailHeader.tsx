import Link from 'next/link';
import { LuArrowLeft, LuChevronRight, LuCircleCheck } from 'react-icons/lu';
import { MistakeStatusBadge, SkillPartBadge } from '@/components/mistakes/mistake-badges';
import { MistakeDetail } from '../../types';
import { MISTAKES_PATH, SKILL_META } from '../../utils';

interface MistakeDetailHeaderProps {
    mistake: MistakeDetail;
}

export default function MistakeDetailHeader({ mistake }: MistakeDetailHeaderProps) {
    const SkillIcon = SKILL_META[mistake.skill].Icon;
    const attemptCount = new Set(mistake.evidence.map((e) => e.attemptId)).size;

    return (
        <div className="flex flex-col gap-4">
            <Link
                href={MISTAKES_PATH}
                className="inline-flex items-center gap-1.5 hover:bg-sub1 -ml-2 px-2 py-1 rounded-lg w-fit font-semibold text-main text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
            >
                <LuArrowLeft className="size-4" aria-hidden="true" />
                Về sổ lỗi
            </Link>

            <div className="flex items-start gap-3">
                <span className="hidden sm:flex justify-center items-center bg-main shadow-sm rounded-xl size-12 text-sub3 shrink-0">
                    <SkillIcon className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-2 min-w-0">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 font-semibold text-subText text-xs uppercase tracking-wider"
                    >
                        <Link href={MISTAKES_PATH} className="hover:text-main transition-colors">
                            Sổ lỗi
                        </Link>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span>{SKILL_META[mistake.skill].label}</span>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span className="text-main">{mistake.task}</span>
                    </nav>
                    <div className="flex flex-wrap items-center gap-2">
                        <SkillPartBadge skill={mistake.skill} partLabel={mistake.partLabel} />
                        <MistakeStatusBadge status={mistake.status} />
                    </div>
                    <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">{mistake.title}</h1>
                    <p className="max-w-3xl font-medium text-subText text-sm leading-relaxed">{mistake.summary}</p>
                    <p className="font-medium text-subText text-xs">
                        Ghi nhận <strong className="font-semibold text-main">{mistake.occurrenceCount} lần</strong> trong{' '}
                        <strong className="font-semibold text-main">{attemptCount} bài</strong>
                        {mistake.lastSeen && (
                            <>
                                {' '}
                                · Gần nhất: {mistake.lastSeen.code}, {mistake.lastSeen.submittedAt}
                            </>
                        )}
                    </p>
                </div>
            </div>

            {mistake.status === 'resolved' && (
                <div className="flex items-start gap-3 bg-sub1 p-4 rounded-xl text-main">
                    <LuCircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                    <p className="font-medium text-sm">
                        <strong className="font-semibold">Bạn đã khắc phục lỗi này.</strong> Lời giải vẫn được giữ lại
                        để ôn tập; lỗi sẽ tự mở lại nếu xuất hiện trong bài làm mới.
                    </p>
                </div>
            )}
        </div>
    );
}
