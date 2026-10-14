import { MistakeDetail } from '../../types';
import { CRITERION_LABEL, SEVERITY_META } from '../../utils';
import SectionHeading from './SectionHeading';

interface MistakeWhyProps {
    mistake: MistakeDetail;
}

export default function MistakeWhy({ mistake }: MistakeWhyProps) {
    const severity = SEVERITY_META[mistake.severity];

    return (
        <section
            aria-labelledby="mistake-why-title"
            className="flex flex-col gap-4 bg-card shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl"
        >
            <SectionHeading id="mistake-why-title" eyebrow="Theo rubric ETS" title="Vì sao bị trừ điểm" />

            <p className="font-medium text-main text-sm leading-relaxed">{mistake.why}</p>

            <div className="flex sm:flex-row flex-col sm:items-center gap-3 bg-sub3/10 p-4 border border-sub3/50 rounded-xl">
                <span className="flex items-center gap-2 font-semibold text-main text-sm">
                    <severity.Icon className="size-5 text-main shrink-0" aria-hidden="true" />
                    {severity.label}:
                </span>
                <span className="font-medium text-main text-sm">{mistake.impact}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-subText text-xs">Tiêu chí bị ảnh hưởng:</span>
                <ul className="flex flex-wrap gap-1.5">
                    {mistake.criteria.map((criterion) => (
                        <li
                            key={criterion}
                            className="bg-sub1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] text-main tracking-wider"
                        >
                            {CRITERION_LABEL[criterion]}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
