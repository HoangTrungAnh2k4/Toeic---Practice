import Link from 'next/link';
import { LuChevronRight } from 'react-icons/lu';
import { MistakeStatusBadge, SkillPartBadge } from '@/components/mistakes/mistake-badges';
import { MistakeItem } from '../../types';
import { getMistakeHref } from '../../utils';

interface MistakeRelatedProps {
    items: MistakeItem[];
}

export default function MistakeRelated({ items }: MistakeRelatedProps) {
    if (items.length === 0) return null;

    return (
        <section
            aria-labelledby="mistake-related-title"
            className="flex flex-col gap-3 bg-card shadow-sm p-5 border border-sub2/30 rounded-xl"
        >
            <h2 id="mistake-related-title" className="font-semibold text-subText text-xs uppercase tracking-wider">
                Lỗi liên quan
            </h2>
            <ul className="flex flex-col gap-2">
                {items.map((item) => (
                    <li key={item.id}>
                        <Link
                            href={getMistakeHref(item.id)}
                            className="flex items-center gap-3 hover:bg-sub1/50 p-3 border border-sub2/20 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
                        >
                            <div className="flex flex-col flex-1 gap-1.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <SkillPartBadge skill={item.skill} partLabel={item.partLabel} />
                                    <MistakeStatusBadge status={item.status} />
                                </div>
                                <span className="font-semibold text-main text-sm">{item.title}</span>
                            </div>
                            <LuChevronRight className="size-4 text-subText shrink-0" aria-hidden="true" />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
