import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FrequencyMeter from './_components/FrequencyMeter';
import Header from './_components/Header';
import { ERRORS, SKILL_STYLE } from './types';

export default function PriorityError() {
    return (
        <section className="flex flex-col gap-4">
            {/* Header */}
            <Header count={ERRORS.length} />

            {/* Cards */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                {ERRORS.map((err) => {
                    const style = SKILL_STYLE[err.skill];
                    const ImpactIcon = err.impactIcon;

                    return (
                        <article
                            key={err.id}
                            className="relative flex flex-col justify-between gap-5 bg-card shadow-sm p-6 pl-7 border border-sub1 rounded-xl overflow-hidden"
                        >
                            {/* Accent bar */}
                            <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-1.5', style.accent)} />

                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap justify-between items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] leading-3.5 tracking-wider',
                                                style.badge,
                                            )}
                                        >
                                            {err.skill} {err.part}
                                        </span>
                                        <span className="font-medium text-sub2 text-xs tracking-wider">{err.task}</span>
                                    </div>
                                    <FrequencyMeter hit={err.frequency.hit} total={err.frequency.total} />
                                </div>

                                <h4 className="font-semibold text-main text-lg leading-6 tracking-[-0.01em]">
                                    {err.title}
                                </h4>
                                <p className="font-medium text-subText text-sm leading-5.5">{err.description}</p>
                            </div>

                            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 pt-4 border-sub1 border-t">
                                <div className="flex items-center gap-1.5 font-semibold text-[0.6875rem] text-main leading-3.5 tracking-wider">
                                    <ImpactIcon aria-hidden="true" className="size-5 text-sub3 shrink-0" />
                                    <span>{err.impact}</span>
                                </div>
                                <Button type="button" variant="primary" size="sm">
                                    {err.ctaLabel}
                                </Button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
