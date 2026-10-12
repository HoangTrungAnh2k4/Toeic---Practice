import { LuFlag, LuFlame, LuTrendingUp } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { SKILL_STYLE } from '../_lib/skillStyle';
import { EXAM_GOAL, MONTHLY_PROGRESS, SKILL_PROGRESS, getProgressPercent } from '../utils';

const CARD_CLASS =
    'flex flex-col justify-between gap-4 bg-white p-5 border border-sub2/30 rounded-xl shadow-sm transition-shadow hover:shadow-md';

const LABEL_CLASS = 'font-semibold text-subText text-xs uppercase tracking-wider';

interface ProgressBarProps {
    value: number;
    label: string;
    barClassName: string;
}

function ProgressBar({ value, label, barClassName }: ProgressBarProps) {
    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            className="bg-sub1 rounded-full w-full h-2 overflow-hidden"
        >
            <div
                className={cn('rounded-full h-full transition-all duration-500', barClassName)}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

export default function ScheduleMilestones() {
    const monthlyPercent = getProgressPercent(MONTHLY_PROGRESS.completed, MONTHLY_PROGRESS.total);

    return (
        <section aria-label="Cột mốc mục tiêu" className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {/* Exam countdown — highlighted card */}
            <div className="flex flex-col justify-between gap-4 bg-main shadow-main/20 shadow-md p-5 rounded-xl">
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className="font-semibold text-sub2 text-xs uppercase tracking-wider">
                            Mục tiêu kỳ thi
                        </span>
                        <div className="flex flex-wrap items-baseline gap-x-2">
                            <span className="font-bold text-white text-3xl tracking-tight">
                                {EXAM_GOAL.daysLeft} ngày
                            </span>
                            <span className="font-semibold text-sub3 text-xs">đến {EXAM_GOAL.examDate}</span>
                        </div>
                    </div>
                    <div className="flex justify-center items-center bg-sub3 rounded-lg size-10 text-main shrink-0">
                        <LuFlag className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg text-sub1 text-xs">
                        <span>
                            <strong className="font-semibold text-white">{EXAM_GOAL.minutesPerDay}</strong> phút/ngày
                        </span>
                        <span className="bg-sub2/50 w-px h-3" aria-hidden="true" />
                        <span>
                            <strong className="font-semibold text-white">{EXAM_GOAL.daysPerWeek}</strong> ngày/tuần
                        </span>
                    </div>
                    <span className="flex items-center gap-1.5 font-medium text-sub1 text-xs">
                        <LuFlame className="size-4 text-sub3" aria-hidden="true" />
                        Chuỗi học {EXAM_GOAL.streakDays} ngày liên tục
                    </span>
                </div>
            </div>

            {/* Skill target vs current */}
            {SKILL_PROGRESS.map((item) => {
                const style = SKILL_STYLE[item.skill];
                const percent = getProgressPercent(item.current, item.target);

                return (
                    <div key={item.skill} className={CARD_CLASS}>
                        <div className="flex justify-between items-start gap-3">
                            <div className="space-y-1 min-w-0">
                                <span className={LABEL_CLASS}>{item.label}</span>
                                <div className="flex flex-wrap items-baseline gap-x-2">
                                    <span className="font-bold tabular-nums text-main text-3xl tracking-tight">
                                        {item.current}
                                        <span className="font-normal text-sub2 text-sm"> / {item.target}</span>
                                    </span>
                                    <span className="bg-sub1 px-1.5 py-0.5 rounded font-bold text-[10px] text-main">
                                        {item.targetLevel}
                                    </span>
                                </div>
                            </div>
                            <div
                                className={cn(
                                    'flex justify-center items-center rounded-lg size-10 shrink-0',
                                    style.className,
                                )}
                            >
                                <style.Icon className="size-5" aria-hidden="true" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center font-semibold text-xs">
                                <span className="text-subText">{percent}% mục tiêu</span>
                                <span className="flex items-center gap-1 text-main">
                                    <LuTrendingUp className="size-3.5 text-sub2" aria-hidden="true" />+
                                    {item.target - item.current} điểm
                                </span>
                            </div>
                            <ProgressBar
                                value={percent}
                                label={`Tiến độ ${item.label}`}
                                barClassName="bg-linear-to-r from-sub2 to-main"
                            />
                            <span className="font-medium text-[11px] text-subText">Trọng tâm: {item.focus}</span>
                        </div>
                    </div>
                );
            })}

            {/* Monthly progress */}
            <div className="flex flex-col justify-between gap-4 bg-sub3/10 shadow-sm p-5 border border-sub3/50 rounded-xl">
                <div className="space-y-1">
                    <span className={LABEL_CLASS}>Chặng tháng này</span>
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold tabular-nums text-main text-3xl tracking-tight">
                            {monthlyPercent}%
                        </span>
                        <span className="font-semibold text-main/70 text-xs">
                            {MONTHLY_PROGRESS.completed}/{MONTHLY_PROGRESS.total} bài trọng tâm
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <ProgressBar value={monthlyPercent} label="Tiến độ chặng tháng" barClassName="bg-sub3" />
                    <span className="font-medium text-[11px] text-main">{MONTHLY_PROGRESS.note}</span>
                </div>
            </div>
        </section>
    );
}
