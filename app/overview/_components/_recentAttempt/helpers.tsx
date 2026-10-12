import { cn } from 'cn';
import { ATTEMPTS, Skill, SKILL_META } from './types';
import { useMemo } from 'react';

export function SkillBadge({ skill, compact }: { skill: Skill; compact?: boolean }) {
    const { label, Icon } = SKILL_META[skill];
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-xs',
                skill === 'S' ? 'bg-[#3C3454] text-white' : 'bg-[#F5B841] text-[#3C3454]',
            )}
        >
            <Icon className="size-3.5" />
            {compact ? skill : label}
        </span>
    );
}

export const counts = useMemo(
    () => ({
        all: ATTEMPTS.length,
        speaking: ATTEMPTS.filter((a) => a.skills.includes('S')).length,
        writing: ATTEMPTS.filter((a) => a.skills.includes('W')).length,
    }),
    [],
);
