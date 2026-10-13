import { LuArrowRight } from 'react-icons/lu';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckStatuses, SkillReadiness, StepId } from '../types';
import { DEVICE_CHECK_STEPS } from '../utils';
import CheckStatusBadge from './CheckStatusBadge';

interface SkillReadinessCardProps {
    skill: SkillReadiness;
    statuses: CheckStatuses;
    onSelectStep: (step: StepId) => void;
}

export default function SkillReadinessCard({ skill, statuses, onSelectStep }: SkillReadinessCardProps) {
    const { id, title, checks, href, actionLabel, Icon } = skill;
    const titleId = `skill-readiness-${id}`;
    const isReady = checks.every((check) => statuses[check] === 'passed');

    return (
        <article
            aria-labelledby={titleId}
            className="flex flex-col gap-4 bg-white p-4 border border-sub2/30 rounded-xl"
        >
            <div className="flex items-center gap-3">
                <span className="flex justify-center items-center bg-main rounded-lg size-10 text-sub3 shrink-0">
                    <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col">
                    <h3 id={titleId} className="font-bold text-main text-base">
                        {title}
                    </h3>
                    <span className="text-subText text-xs">
                        {isReady ? 'Thiết bị đã sẵn sàng' : 'Còn mục chưa đạt'}
                    </span>
                </div>
            </div>

            <ul className="flex flex-col gap-2">
                {checks.map((check) => {
                    const status = statuses[check];
                    const stepTitle = DEVICE_CHECK_STEPS[check].title;

                    return (
                        <li
                            key={check}
                            className="flex flex-wrap justify-between items-center gap-2 bg-sub1/30 px-3 py-2 rounded-lg"
                        >
                            <span className="font-medium text-main text-sm">{stepTitle}</span>
                            <span className="flex items-center gap-2">
                                <CheckStatusBadge status={status} />
                                {status !== 'passed' && (
                                    <button
                                        type="button"
                                        onClick={() => onSelectStep(check)}
                                        className="rounded font-semibold text-main text-xs hover:underline underline-offset-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
                                    >
                                        {status === 'failed' ? 'Kiểm tra lại' : 'Bắt đầu'}
                                        <span className="sr-only"> bước {stepTitle}</span>
                                    </button>
                                )}
                            </span>
                        </li>
                    );
                })}
            </ul>

            <Link
                href={href}
                className={cn(
                    buttonVariants({ variant: isReady ? 'primary' : 'third', size: 'md' }),
                    'gap-2 mt-auto',
                    !isReady && 'bg-white',
                )}
            >
                {actionLabel}
                <LuArrowRight className="size-4" aria-hidden="true" />
            </Link>
        </article>
    );
}
