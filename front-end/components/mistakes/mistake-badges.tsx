import { MistakeSkill, MistakeStatus } from '@/app/mistakes/types';
import { SKILL_META, STATUS_META } from '@/app/mistakes/utils';
import { cn } from '@/lib/utils';

const BADGE_CLASS = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] leading-4 tracking-wider';

type SkillPartBadgeProps = {
    skill: MistakeSkill;
    partLabel: string;
    className?: string;
};

export function SkillPartBadge({ skill, partLabel, className }: SkillPartBadgeProps) {
    return (
        <span className={cn(BADGE_CLASS, SKILL_META[skill].badge, className)}>
            {SKILL_META[skill].label} {partLabel}
        </span>
    );
}

type MistakeStatusBadgeProps = {
    status: MistakeStatus;
    className?: string;
};

export function MistakeStatusBadge({ status, className }: MistakeStatusBadgeProps) {
    const { label, description, Icon, className: tone } = STATUS_META[status];

    return (
        <span className={cn(BADGE_CLASS, 'rounded-full', tone, className)} title={description}>
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
        </span>
    );
}
