import { LuArrowRight } from 'react-icons/lu';
import type { SkillProgress } from '@/app/schedule/types';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScorePoint } from '../types';
import { getAverageGain, MAX_SKILL_SCORE, PROFILE_CARD_CLASS, SKILL_BAR_CLASS, toPercent } from '../utils';
import ScoreTrendChart from './ScoreTrendChart';

interface ProfileGoalCardProps {
    skills: SkillProgress[];
    history: ScorePoint[];
    className?: string;
}

function GoalProgress({ skill, label, current, target, targetLevel }: SkillProgress) {
    const gap = Math.max(0, target - current);

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap justify-between items-end gap-2">
                <div className="flex items-center gap-3">
                    <span aria-hidden="true" className={cn('rounded-full w-1.5 h-9', SKILL_BAR_CLASS[skill])} />
                    <div className="flex flex-col">
                        <span className="font-bold text-main">{label}</span>
                        <span className="font-medium text-subText text-xs">
                            Hiện tại <b className="text-main">{current}</b> / {MAX_SKILL_SCORE}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="font-medium text-subText text-xs">
                        Mục tiêu <b className="text-main text-base">{target} điểm</b> · {targetLevel}
                    </span>
                    <span
                        className={cn(
                            'px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] uppercase tracking-wider',
                            gap > 0 ? 'bg-sub3/30 text-main' : 'bg-success text-main',
                        )}
                    >
                        {gap > 0 ? `Còn thiếu ${gap} điểm` : 'Đã đạt mục tiêu'}
                    </span>
                </div>
            </div>

            <div
                role="meter"
                aria-label={`${label}: ${current} trên mục tiêu ${target} điểm`}
                aria-valuemin={0}
                aria-valuemax={MAX_SKILL_SCORE}
                aria-valuenow={current}
                className="relative bg-sub2/30 rounded-full h-3.5"
            >
                <div
                    className={cn('absolute inset-y-0 left-0 rounded-full', SKILL_BAR_CLASS[skill])}
                    style={{ width: `${toPercent(current, MAX_SKILL_SCORE)}%` }}
                />
                {/* Vạch mục tiêu */}
                <div
                    aria-hidden="true"
                    className="-top-1.5 -bottom-1.5 absolute bg-black -ml-px rounded-full w-0.75"
                    style={{ left: `${toPercent(target, MAX_SKILL_SCORE)}%` }}
                />
            </div>
            <div aria-hidden="true" className="flex justify-between font-medium text-[0.6875rem] text-subText">
                <span>0</span>
                <span>{MAX_SKILL_SCORE}</span>
            </div>
        </div>
    );
}

export default function ProfileGoalCard({ skills, history, className }: ProfileGoalCardProps) {
    const averageGain = getAverageGain(history);

    return (
        <Card role="region" aria-labelledby="profile-goal-title" className={cn(PROFILE_CARD_CLASS, className)}>
            <CardHeader className="px-5 sm:px-6 pt-5 sm:pt-6">
                <h2 id="profile-goal-title" className="font-semibold text-main text-lg">
                    Mục tiêu luyện thi
                </h2>
                <CardDescription className="font-medium text-subText">
                    Khoảng cách từ điểm hiện tại tới mục tiêu, theo bài thi thử gần nhất.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-6 px-5 sm:px-6 pt-5 pb-5">
                {skills.map((skill) => (
                    <GoalProgress key={skill.skill} {...skill} />
                ))}

                <div className="flex flex-col gap-3 pt-5 border-sub2/30 border-t">
                    <h3 className="font-bold text-main text-sm">Điểm qua {history.length} bài thi thử</h3>
                    <ScoreTrendChart data={history} />
                </div>
            </CardContent>

            <CardFooter className="flex-wrap justify-between gap-3 bg-sub1/30 px-5 sm:px-6 py-3 border-sub2/20">
                <span className="font-medium text-subText text-sm">
                    {averageGain > 0 ? (
                        <>
                            Tăng trung bình <b className="text-main">+{averageGain} điểm</b> mỗi bài thi thử
                        </>
                    ) : (
                        'Làm thêm bài thi thử để thấy xu hướng điểm'
                    )}
                </span>
                <Link
                    href="/schedule"
                    className={cn(buttonVariants({ variant: 'third', size: 'sm' }), 'gap-2 bg-white')}
                >
                    <span>Xem lộ trình</span>
                    <LuArrowRight className="size-4" aria-hidden="true" />
                </Link>
            </CardFooter>
        </Card>
    );
}
