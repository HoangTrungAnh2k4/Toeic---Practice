import { LuPartyPopper } from 'react-icons/lu';
import { getPriorityMistakes } from '@/app/mistakes/_lib/data';
import { getMistakeHref, SEVERITY_META, SKILL_META } from '@/app/mistakes/utils';
import { FrequencyMeter } from '@/components/mistakes/frequency-meter';
import { SkillPartBadge } from '@/components/mistakes/mistake-badges';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Header from './_components/Header';

const PRIORITY_LIMIT = 2;

export default async function PriorityError() {
    const { items, openCount, analyzedAttempts } = await getPriorityMistakes(PRIORITY_LIMIT);

    return (
        <section className="flex flex-col gap-4">
            {/* Header */}
            <Header shownCount={items.length} openCount={openCount} analyzedAttempts={analyzedAttempts} />

            {items.length === 0 ? (
                <div className="flex items-center gap-3 bg-card shadow-sm p-6 border border-sub2/30 rounded-xl">
                    <LuPartyPopper className="size-6 text-main shrink-0" aria-hidden="true" />
                    <p className="font-medium text-main text-sm">
                        Không còn lỗi nào cần khắc phục. Tiếp tục luyện đề mới để giữ phong độ.
                    </p>
                </div>
            ) : (
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    {items.map((item) => {
                        const ImpactIcon = SEVERITY_META[item.severity].Icon;

                        return (
                            <article
                                key={item.id}
                                className="relative flex flex-col justify-between gap-5 bg-card shadow-sm hover:shadow-md p-6 pl-7 border border-sub2/30 rounded-xl overflow-hidden transition-shadow"
                            >
                                {/* Accent bar */}
                                <span
                                    aria-hidden="true"
                                    className={cn('absolute inset-y-0 left-0 w-1.5', SKILL_META[item.skill].accent)}
                                />

                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-wrap justify-between items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <SkillPartBadge skill={item.skill} partLabel={item.partLabel} />
                                            <span className="font-medium text-subText text-xs tracking-wider">
                                                {item.task}
                                            </span>
                                        </div>
                                        <FrequencyMeter hit={item.frequency.hit} total={item.frequency.total} />
                                    </div>

                                    <h4 className="font-semibold text-main text-lg leading-6 tracking-[-0.01em]">
                                        {item.title}
                                    </h4>
                                    <p className="font-medium text-subText text-sm leading-5.5">{item.summary}</p>
                                </div>

                                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 pt-4 border-sub2/20 border-t">
                                    <div className="flex items-center gap-1.5 font-semibold text-[0.6875rem] text-main leading-3.5 tracking-wider">
                                        <ImpactIcon aria-hidden="true" className="size-5 text-sub3 shrink-0" />
                                        <span>{item.impact}</span>
                                    </div>
                                    <Link
                                        href={getMistakeHref(item.id)}
                                        aria-label={`Xem cách khắc phục: ${item.title}`}
                                        className={buttonVariants({ variant: 'primary', size: 'sm' })}
                                    >
                                        Xem cách khắc phục
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
