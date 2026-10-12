import Link from 'next/link';
import { LuArrowRight, LuFlaskConical } from 'react-icons/lu';
import { FrequencyMeter } from '@/components/mistakes/frequency-meter';
import { MistakeStatusBadge, SkillPartBadge } from '@/components/mistakes/mistake-badges';
import { cn } from '@/lib/utils';
import { MistakeItem } from '../types';
import { CRITERION_LABEL, getMistakeHref, RESOLVE_STREAK, SEVERITY_META, SKILL_META } from '../utils';

interface MistakeCardProps {
    item: MistakeItem;
}

/** Dòng trạng thái tiến độ: mỗi trạng thái cần một thông điệp hành động khác nhau. */
function ProgressNote({ item }: MistakeCardProps) {
    if (item.status === 'resolved') {
        return <>Đã {item.cleanStreak} bài độc lập liên tiếp không lặp lại</>;
    }
    if (item.status === 'improving') {
        return (
            <>
                Không lặp lại {item.cleanStreak}/{RESOLVE_STREAK} bài độc lập
            </>
        );
    }
    return item.lastSeen ? (
        <>
            Gặp gần nhất: <strong className="font-semibold text-main">{item.lastSeen.code}</strong> ·{' '}
            {item.lastSeen.submittedAt}
        </>
    ) : null;
}

export default function MistakeCard({ item }: MistakeCardProps) {
    const SeverityIcon = SEVERITY_META[item.severity].Icon;
    const isResolved = item.status === 'resolved';
    const needsMoreData = !isResolved && item.frequency.total < 2;

    return (
        <article
            className={cn(
                'relative flex flex-col flex-1 gap-4 bg-card shadow-sm hover:shadow-md p-5 pl-6 border border-sub2/30 rounded-xl overflow-hidden transition-shadow',
                'has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-sub3',
                isResolved && 'bg-sub1/30',
            )}
        >
            <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-1.5', SKILL_META[item.skill].accent)} />

            <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <SkillPartBadge skill={item.skill} partLabel={item.partLabel} />
                    <span className="font-medium text-sub2 text-xs tracking-wider">{item.task}</span>
                </div>
                <MistakeStatusBadge status={item.status} />
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-main text-lg leading-6">
                    {/* Stretched link: cả card bấm được nhưng chỉ có một điểm dừng cho bàn phím */}
                    <Link href={getMistakeHref(item.id)} className="after:absolute after:inset-0 focus-visible:outline-none">
                        {item.title}
                    </Link>
                </h3>
                <p className="font-medium text-subText text-sm line-clamp-2 leading-5.5">{item.summary}</p>
            </div>

            <ul className="flex flex-wrap gap-1.5" aria-label="Tiêu chí bị ảnh hưởng">
                {item.criteria.map((criterion) => (
                    <li key={criterion} className="bg-sub1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] text-main">
                        {CRITERION_LABEL[criterion]}
                    </li>
                ))}
                {needsMoreData && (
                    <li
                        className="inline-flex items-center gap-1 bg-sub3/20 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] text-main"
                        title="Mới ghi nhận ở ít bài — độ ưu tiên được giảm cho tới khi có thêm dữ liệu"
                    >
                        <LuFlaskConical className="size-3" aria-hidden="true" />
                        Cần thêm dữ liệu
                    </li>
                )}
            </ul>

            <div className="flex flex-col gap-3 mt-auto pt-4 border-sub2/20 border-t">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <FrequencyMeter hit={item.frequency.hit} total={item.frequency.total} />
                    <span className="flex items-center gap-1.5 font-semibold text-[0.6875rem] text-main tracking-wider">
                        <SeverityIcon className="size-4 text-sub3 shrink-0" aria-hidden="true" />
                        {item.impact}
                    </span>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
                    <span className="font-medium text-subText">
                        <ProgressNote item={item} />
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-main" aria-hidden="true">
                        Xem cách khắc phục
                        <LuArrowRight className="size-3.5" />
                    </span>
                </div>
            </div>
        </article>
    );
}
