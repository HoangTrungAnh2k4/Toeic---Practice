import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { PART_TEMPLATES } from '@/lib/domain/parts';
import type { Skill, UserPartStats } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { PROFILE_CARD_CLASS, SKILL_BAR_CLASS, STRONG_PART_RATIO } from '../utils';

interface PartScoreCardProps {
    parts: UserPartStats[];
    className?: string;
}

const SKILL_GROUPS: { skill: Skill; label: string; borderClass: string }[] = [
    { skill: 'speaking', label: 'Speaking', borderClass: 'border-main' },
    { skill: 'writing', label: 'Writing', borderClass: 'border-sub2' },
];

/** Tỉ lệ điểm đạt từng Part, gắn nhãn Mạnh / Cần luyện để không phân biệt chỉ bằng màu. */
export default function PartScoreCard({ parts, className }: PartScoreCardProps) {
    const statsOf = new Map(parts.map((item) => [item.part_template_id, item]));

    return (
        <Card role="region" aria-labelledby="profile-parts-title" className={cn(PROFILE_CARD_CLASS, className)}>
            <CardHeader className="px-5 sm:px-6 pt-5 sm:pt-6">
                <h2 id="profile-parts-title" className="font-semibold text-main text-lg">
                    Điểm mạnh và điểm cần luyện
                </h2>
                <CardDescription className="font-medium text-subText">
                    Tỉ lệ điểm đạt trên điểm tối đa của các câu đã chấm, theo từng Part.
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-6 grid grid-cols-1 md:grid-cols-2 px-5 sm:px-6 pt-5 pb-5 sm:pb-6">
                {SKILL_GROUPS.map(({ skill, label, borderClass }) => (
                    <div key={skill} className="flex flex-col gap-3.5">
                        <h3
                            className={cn(
                                'pb-1.5 border-b-2 font-semibold text-main text-xs uppercase tracking-wider',
                                borderClass,
                            )}
                        >
                            {label}
                        </h3>
                        <ul className="flex flex-col gap-3.5">
                            {PART_TEMPLATES.filter((template) => template.skill === skill).map((template) => {
                                const ratio = statsOf.get(template.id)?.avg_score_ratio ?? null;
                                const percent = ratio === null ? 0 : Math.round(ratio * 100);
                                const isStrong = ratio !== null && ratio >= STRONG_PART_RATIO;
                                return (
                                    <li key={template.id} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between gap-2 text-main text-sm">
                                            <span>
                                                <b>Part {template.part_no}</b> · {template.task}
                                            </span>
                                            <span className="font-bold whitespace-nowrap">
                                                {ratio === null ? '—' : `${percent}%`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                aria-hidden="true"
                                                className="flex-1 bg-sub2/30 rounded-full h-1.5 overflow-hidden"
                                            >
                                                <div
                                                    className={cn('rounded-full h-full', SKILL_BAR_CLASS[skill])}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span
                                                className={cn(
                                                    'px-1.5 py-px rounded-md font-semibold text-[0.6875rem] uppercase tracking-wider whitespace-nowrap',
                                                    ratio === null
                                                        ? 'bg-card text-subText ring-1 ring-sub2/40'
                                                        : isStrong
                                                          ? 'bg-sub1 text-main'
                                                          : 'bg-sub3/30 text-main',
                                                )}
                                            >
                                                {ratio === null ? 'Chưa có' : isStrong ? 'Mạnh' : 'Cần luyện'}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
