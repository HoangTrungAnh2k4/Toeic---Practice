import { cn } from 'cn';
import { Skill, SKILL_META } from './types';

export function SkillBadge({ skill }: { skill: Skill }) {
    const { label } = SKILL_META[skill];
    return (
        <span
            className={cn(
                'inline-flex justify-center items-center gap-1 px-2 py-1 pt-1 rounded-md w-full font-semibold text-xs text-center',
                skill === 'S' ? 'bg-[#3C3454] text-white' : 'bg-[#F5B841] text-[#3C3454]',
            )}
        >
            {label}
        </span>
    );
}
