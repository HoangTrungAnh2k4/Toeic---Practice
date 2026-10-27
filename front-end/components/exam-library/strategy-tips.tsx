import type { Skill } from '@/lib/domain/types';
import type { PartStrategy } from '@/lib/exam-library/types';

interface StrategyTipsProps {
    skill: Skill;
    strategies: PartStrategy[];
}

export function StrategyTips({ skill, strategies }: StrategyTipsProps) {
    return (
        <section
            aria-labelledby={`${skill}-strategy-title`}
            className="flex flex-col gap-5 bg-white shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl"
        >
            <h2 id={`${skill}-strategy-title`} className="font-bold text-main text-xl tracking-tight">
                Chiến thuật từng Part
            </h2>

            <div className="gap-4 grid grid-cols-1 lg:grid-cols-3">
                {strategies.map(({ part, timing, tips, formula }) => (
                    <div key={part} className="flex flex-col justify-between gap-4 bg-sub1/50 p-4 rounded-xl">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                                <h3 className="font-bold text-main text-xs uppercase tracking-wider">{part}</h3>
                                <span className="bg-white px-2 py-0.5 rounded-md font-semibold text-[11px] text-subText">
                                    {timing}
                                </span>
                            </div>
                            <ul className="flex flex-col gap-2">
                                {tips.map(({ icon: Icon, title, description }) => (
                                    <li key={title} className="flex flex-col gap-1 bg-white p-3 rounded-lg">
                                        <span className="flex items-center gap-1.5 font-semibold text-main text-sm">
                                            <Icon className="size-4 text-sub2 shrink-0" aria-hidden="true" />
                                            {title}
                                        </span>
                                        <p className="text-subText text-xs leading-relaxed">{description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="bg-main px-3 py-2 rounded-lg font-semibold text-sub3 text-xs">{formula}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
