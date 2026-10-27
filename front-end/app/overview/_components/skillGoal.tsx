import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LuMic, LuPenLine } from 'react-icons/lu';
import type { UserStats } from '@/lib/data/user-stats';
import type { Skill } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { FaMicrophoneLines, FaPenNib } from 'react-icons/fa6';

const MAX_SCORE = 200;

interface SkillGoalsProps {
    stats: UserStats;
    /** Mục tiêu từ `profiles`; `null` khi chưa đặt hoặc là khách. */
    targets: Record<Skill, number | null>;
    isGuest: boolean;
}

const SKILL_STYLE: Record<Skill, { label: string; Icon: IconType;iconColor:string ; tile: string; track: string; bar: string}> = {
    writing: {
        label: 'Writing',
        Icon: FaPenNib,
        iconColor: 'text-sub3',
        tile: 'bg-sub3/15 text-main',
        track: 'bg-sub3/15',
        bar: 'bg-sub3',
    },
    speaking: {
        label: 'Speaking',
        Icon: FaMicrophoneLines,
        iconColor: 'text-main',
        tile: 'bg-sub1 text-main',
        track: 'bg-sub1',
        bar: 'bg-main',
    },
};

interface SkillGoalCardProps {
    skill: Skill;
    stats: UserStats;
    target: number | null;
    isGuest: boolean;
}

function SkillGoalCard({ skill, stats, target, isGuest }: SkillGoalCardProps) {
    const style = SKILL_STYLE[skill];
    const scores = stats.fullTestScores.filter((item) => item.skill === skill).map((item) => item.score);
    const current = scores.at(-1) ?? null;
    const previous = scores.at(-2) ?? null;
    const delta = current !== null && previous !== null ? current - previous : null;
    const scale = target ?? MAX_SCORE;
    const percent = current === null ? 0 : Math.min(100, Math.round((current / scale) * 100));

    return (
        <div className="flex flex-col gap-4 bg-white shadow-sm hover:shadow-md p-4 border border-sub1/50 rounded-xl">
            <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2">
                    <div className={cn('flex justify-center items-center rounded-lg size-10', style.tile)}>
                        <style.Icon className={cn('size-5', style.iconColor)} aria-hidden="true" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-main text-xl tracking-tight">TOEIC {style.label}</h4>
                        <p className="font-medium text-subText text-xs">Thang điểm ETS: 0 - {MAX_SCORE} điểm</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-main text-2xl tracking-tight">
                        {current ?? '—'}{' '}
                        <span className="font-medium text-main text-sm tracking-normal">
                            {target === null ? `/ ${MAX_SCORE}` : `/ ${target} Mục tiêu`}
                        </span>
                    </div>
                    <span className="font-semibold text-[0.6875rem] text-main tracking-wider">
                        {delta === null
                            ? current === null
                                ? 'Chưa có bài làm cả đề'
                                : 'Bài làm cả đề đầu tiên'
                            : `${delta >= 0 ? '+' : ''}${delta} điểm so với bài trước`}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between font-semibold text-xs tracking-wider">
                    <span className="text-main">
                        {target === null ? `Điểm trên thang ${MAX_SCORE}` : 'Tiến độ đạt mục tiêu'}
                    </span>
                    <span className="font-bold text-main">{percent}%</span>
                </div>
                <div
                    role="progressbar"
                    aria-label={target === null ? `Điểm ${style.label} trên thang ${MAX_SCORE}` : `Tiến độ đạt mục tiêu ${style.label}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    className={cn('rounded-xl w-full h-3 overflow-hidden', style.track)}
                >
                    <div
                        className={cn('rounded-xl h-full origin-left motion-safe:animate-grow-x', style.bar)}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                {target === null && (
                    <span className="font-medium text-subText text-xs">
                        {isGuest ? (
                            <>
                                <Link href="/register" className="font-semibold text-main hover:underline">
                                    Đăng ký
                                </Link>{' '}
                                để đặt mục tiêu điểm.
                            </>
                        ) : (
                            'Chưa đặt mục tiêu điểm.'
                        )}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function SkillGoals({ stats, targets, isGuest }: SkillGoalsProps) {
    return (
        <div className="flex flex-col flex-1 gap-4">
            {(['writing', 'speaking'] as const).map((skill) => (
                <SkillGoalCard
                    key={skill}
                    skill={skill}
                    stats={stats}
                    target={targets[skill]}
                    isGuest={isGuest}
                />
            ))}
        </div>
    );
}
