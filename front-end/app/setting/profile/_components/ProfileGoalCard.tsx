import { LuArrowRight } from 'react-icons/lu';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { getScoreLevel } from '@/lib/domain/score-levels';
import type { Skill, UserSkillStats } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { ScorePoint } from '../types';
import { MAX_SKILL_SCORE, PROFILE_CARD_CLASS, SKILL_BAR_CLASS, toPercent } from '../utils';
import ScoreTrendChart from './ScoreTrendChart';

interface ProfileGoalCardProps {
    skills: Record<Skill, UserSkillStats>;
    /** Mục tiêu từ `profiles`; `null` khi chưa đặt hoặc là khách. */
    targets: Record<Skill, number | null>;
    isGuest: boolean;
    history: ScorePoint[];
    averageGain: number;
    className?: string;
}

const SKILL_LABEL: Record<Skill, string> = { speaking: 'Speaking', writing: 'Writing' };

interface GoalProgressProps {
    skill: Skill;
    current: number | null;
    target: number | null;
    isGuest: boolean;
}

function GoalProgress({ skill, current, target, isGuest }: GoalProgressProps) {
    const label = SKILL_LABEL[skill];
    const gap = current !== null && target !== null ? Math.max(0, target - current) : null;

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap justify-between items-end gap-2">
                <div className="flex items-center gap-3">
                    <span aria-hidden="true" className={cn('rounded-full w-1.5 h-9', SKILL_BAR_CLASS[skill])} />
                    <div className="flex flex-col">
                        <span className="font-bold text-main">{label}</span>
                        <span className="font-medium text-subText text-xs">
                            {current === null ? (
                                'Chưa có bài làm cả đề được chấm'
                            ) : (
                                <>
                                    Hiện tại <b className="text-main">{current}</b> / {MAX_SKILL_SCORE} · Level{' '}
                                    {getScoreLevel(skill, current)}
                                </>
                            )}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {target === null ? (
                        <span className="font-medium text-subText text-xs">
                            {isGuest ? 'Đăng ký để đặt mục tiêu' : 'Chưa đặt mục tiêu'}
                        </span>
                    ) : (
                        <>
                            <span className="font-medium text-subText text-xs">
                                Mục tiêu <b className="text-main text-base">{target} điểm</b> · Level{' '}
                                {getScoreLevel(skill, target)}
                            </span>
                            {gap !== null && (
                                <span
                                    className={cn(
                                        'px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] uppercase tracking-wider',
                                        gap > 0 ? 'bg-sub3/30 text-main' : 'bg-success text-main',
                                    )}
                                >
                                    {gap > 0 ? `Còn thiếu ${gap} điểm` : 'Đã đạt mục tiêu'}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div
                role="meter"
                aria-label={
                    target === null
                        ? `${label}: ${current ?? 0} trên ${MAX_SKILL_SCORE} điểm`
                        : `${label}: ${current ?? 0} trên mục tiêu ${target} điểm`
                }
                aria-valuemin={0}
                aria-valuemax={MAX_SKILL_SCORE}
                aria-valuenow={current ?? 0}
                className="relative bg-sub2/30 rounded-full h-3.5"
            >
                <div
                    className={cn('absolute inset-y-0 left-0 rounded-full', SKILL_BAR_CLASS[skill])}
                    style={{ width: `${toPercent(current ?? 0, MAX_SKILL_SCORE)}%` }}
                />
                {target !== null && (
                    // Vạch mục tiêu
                    <div
                        aria-hidden="true"
                        className="-top-1.5 -bottom-1.5 absolute bg-black -ml-px rounded-full w-0.75"
                        style={{ left: `${toPercent(target, MAX_SKILL_SCORE)}%` }}
                    />
                )}
            </div>
            <div aria-hidden="true" className="flex justify-between font-medium text-[0.6875rem] text-subText">
                <span>0</span>
                <span>{MAX_SKILL_SCORE}</span>
            </div>
        </div>
    );
}

export default function ProfileGoalCard({
    skills,
    targets,
    isGuest,
    history,
    averageGain,
    className,
}: ProfileGoalCardProps) {
    return (
        <Card role="region" aria-labelledby="profile-goal-title" className={cn(PROFILE_CARD_CLASS, className)}>
            <CardHeader className="px-5 sm:px-6 pt-5 sm:pt-6">
                <h2 id="profile-goal-title" className="font-semibold text-main text-lg">
                    Mục tiêu luyện thi
                </h2>
                <CardDescription className="font-medium text-subText">
                    Điểm hiện tại theo bài làm cả đề gần nhất của từng kỹ năng.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-6 px-5 sm:px-6 pt-5 pb-5">
                {(Object.keys(skills) as Skill[]).map((skill) => (
                    <GoalProgress
                        key={skill}
                        skill={skill}
                        current={skills[skill].latest_score}
                        target={targets[skill]}
                        isGuest={isGuest}
                    />
                ))}

                <div className="flex flex-col gap-3 pt-5 border-sub2/30 border-t">
                    <h3 className="font-bold text-main text-sm">Điểm qua {history.length} bài làm cả đề gần nhất</h3>
                    {history.length === 0 ? (
                        <p className="bg-sub1/40 p-4 rounded-lg font-medium text-subText text-sm">
                            Làm và nộp một đề đầy đủ để bắt đầu theo dõi điểm.
                        </p>
                    ) : (
                        <ScoreTrendChart data={history} />
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex-wrap justify-between gap-3 bg-sub1/30 px-5 sm:px-6 py-3 border-sub2/20">
                <span className="font-medium text-subText text-sm">
                    {averageGain > 0 ? (
                        <>
                            Tăng trung bình <b className="text-main">+{averageGain} điểm</b> mỗi bài làm cả đề
                        </>
                    ) : (
                        'Làm thêm bài cả đề để thấy xu hướng điểm'
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
