import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { getScoreLevel } from '@/lib/domain/score-levels';
import type { Skill, UserSkillStats } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { ScorePoint } from '../types';
import { MAX_SKILL_SCORE, PROFILE_CARD_CLASS, SKILL_BAR_CLASS, toPercent } from '../utils';
import ScoreTrendChart from './ScoreTrendChart';

interface ProfileScoreCardProps {
    skills: Record<Skill, UserSkillStats>;
    history: ScorePoint[];
    averageGain: number;
    className?: string;
}

const SKILL_LABEL: Record<Skill, string> = { speaking: 'Speaking', writing: 'Writing' };

function SkillScore({ skill, current }: { skill: Skill; current: number | null }) {
    const label = SKILL_LABEL[skill];

    return (
        <div className="flex flex-col gap-2.5">
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

            <div
                role="meter"
                aria-label={`${label}: ${current ?? 0} trên ${MAX_SKILL_SCORE} điểm`}
                aria-valuemin={0}
                aria-valuemax={MAX_SKILL_SCORE}
                aria-valuenow={current ?? 0}
                className="relative bg-sub2/30 rounded-full h-3.5"
            >
                <div
                    className={cn('absolute inset-y-0 left-0 rounded-full', SKILL_BAR_CLASS[skill])}
                    style={{ width: `${toPercent(current ?? 0, MAX_SKILL_SCORE)}%` }}
                />
            </div>
            <div aria-hidden="true" className="flex justify-between font-medium text-[0.6875rem] text-subText">
                <span>0</span>
                <span>{MAX_SKILL_SCORE}</span>
            </div>
        </div>
    );
}

export default function ProfileScoreCard({ skills, history, averageGain, className }: ProfileScoreCardProps) {
    return (
        <Card role="region" aria-labelledby="profile-score-title" className={cn(PROFILE_CARD_CLASS, className)}>
            <CardHeader className="px-5 sm:px-6 pt-5 sm:pt-6">
                <h2 id="profile-score-title" className="font-semibold text-main text-lg">
                    Điểm của bạn
                </h2>
                <CardDescription className="font-medium text-subText">
                    Điểm hiện tại theo bài làm cả đề gần nhất của từng kỹ năng.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-6 px-5 sm:px-6 pt-5 pb-5">
                {(Object.keys(skills) as Skill[]).map((skill) => (
                    <SkillScore key={skill} skill={skill} current={skills[skill].latest_score} />
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

            <CardFooter className="bg-sub1/30 px-5 sm:px-6 py-3 border-sub2/20">
                <span className="font-medium text-subText text-sm">
                    {averageGain > 0 ? (
                        <>
                            Tăng trung bình <b className="text-main">+{averageGain} điểm</b> mỗi bài làm cả đề
                        </>
                    ) : (
                        'Làm thêm bài cả đề để thấy xu hướng điểm'
                    )}
                </span>
            </CardFooter>
        </Card>
    );
}
