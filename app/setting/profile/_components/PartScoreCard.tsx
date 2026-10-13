import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PartScore, ProfileSkill } from '../types';
import { PROFILE_CARD_CLASS, SKILL_BAR_CLASS, STRONG_PART_RATIO, toPercent } from '../utils';

interface PartScoreCardProps {
    scores: PartScore[];
    className?: string;
}

const SKILL_GROUPS: { skill: ProfileSkill; label: string; borderClass: string }[] = [
    { skill: 'speaking', label: 'Speaking', borderClass: 'border-main' },
    { skill: 'writing', label: 'Writing', borderClass: 'border-sub2' },
];

/** Điểm trung bình từng Part, gắn nhãn Mạnh / Cần luyện để không phân biệt chỉ bằng màu. */
export default function PartScoreCard({ scores, className }: PartScoreCardProps) {
    return (
        <Card role="region" aria-labelledby="profile-parts-title" className={cn(PROFILE_CARD_CLASS, className)}>
            <CardHeader className="px-5 sm:px-6 pt-5 sm:pt-6">
                <h2 id="profile-parts-title" className="font-semibold text-main text-lg">
                    Điểm mạnh và điểm cần luyện
                </h2>
                <CardDescription className="font-medium text-subText">
                    Điểm trung bình từng Part, chấm theo thang ETS.
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
                            {scores
                                .filter((item) => item.skill === skill)
                                .map((item) => {
                                    const percent = toPercent(item.score, item.max);
                                    const isStrong = item.score / item.max >= STRONG_PART_RATIO;
                                    return (
                                        <li key={item.id} className="flex flex-col gap-1.5">
                                            <div className="flex justify-between gap-2 text-main text-sm">
                                                <span>
                                                    <b>{item.part}</b> · {item.name}
                                                </span>
                                                <span className="font-bold whitespace-nowrap">
                                                    {item.score}/{item.max}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div aria-hidden="true" className="flex-1 bg-sub2/30 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={cn('rounded-full h-full', SKILL_BAR_CLASS[skill])}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span
                                                    className={cn(
                                                        'px-1.5 py-px rounded-md font-semibold text-[0.6875rem] uppercase tracking-wider whitespace-nowrap',
                                                        isStrong ? 'bg-sub1 text-main' : 'bg-sub3/30 text-main',
                                                    )}
                                                >
                                                    {isStrong ? 'Mạnh' : 'Cần luyện'}
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
