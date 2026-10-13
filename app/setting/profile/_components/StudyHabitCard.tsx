import { LuCalendarCog } from 'react-icons/lu';
import LinkButton from '@/components/ui/link-button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProfileField, StudyDay } from '../types';
import { PROFILE_CARD_CLASS, toPercent } from '../utils';
import ProfileFieldList from './ProfileFieldList';

interface StudyHabitCardProps {
    days: StudyDay[];
    goalMinutes: number;
    fields: ProfileField[];
    className?: string;
}

/** Số phút học 7 ngày gần nhất so với mục tiêu mỗi ngày. */
export default function StudyHabitCard({ days, goalMinutes, fields, className }: StudyHabitCardProps) {
    // Chừa khoảng trống phía trên để nhãn số phút không bị cắt
    const scaleMax = Math.max(goalMinutes, ...days.map((day) => day.minutes)) * 1.15;
    const metCount = days.filter((day) => day.minutes >= goalMinutes).length;

    return (
        <Card role="region" aria-labelledby="profile-habit-title" className={cn(PROFILE_CARD_CLASS, className)}>
            <CardHeader className="px-5 sm:px-6 pt-5 sm:pt-6">
                <h2 id="profile-habit-title" className="font-semibold text-main text-lg">
                    Thói quen học
                </h2>
                <CardDescription className="font-medium text-subText">
                    {days.length} ngày gần nhất · mục tiêu {goalMinutes} phút/ngày
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 gap-5 px-5 sm:px-6 pt-5 pb-5 sm:pb-6">
                <div
                    role="img"
                    aria-label={`Số phút học ${days.length} ngày gần nhất, ${metCount} ngày đạt mục tiêu ${goalMinutes} phút`}
                    className="flex flex-col gap-1.5"
                >
                    <div aria-hidden="true" className="relative grid grid-cols-7 gap-2 h-36">
                        {/* Vạch mục tiêu */}
                        <div
                            className="right-0 left-0 absolute border-sub3 border-t-2 border-dashed"
                            style={{ bottom: `${toPercent(goalMinutes, scaleMax)}%` }}
                        >
                            <span className="right-0 -top-5 absolute bg-card px-1 font-semibold text-[0.6875rem] text-subText">
                                {goalMinutes}′
                            </span>
                        </div>

                        {days.map((day) => (
                            <div key={day.id} className="flex flex-col justify-end items-center gap-1 min-w-0 h-full">
                                <span className="font-semibold text-[0.6875rem] text-main">{day.minutes}</span>
                                <div
                                    className={cn(
                                        'rounded-t-md rounded-b-sm w-full max-w-7 shrink-0',
                                        day.minutes >= goalMinutes ? 'bg-main' : 'bg-sub2/45',
                                    )}
                                    style={{ height: `${toPercent(day.minutes, scaleMax)}%` }}
                                />
                            </div>
                        ))}
                    </div>
                    <div aria-hidden="true" className="grid grid-cols-7 gap-2">
                        {days.map((day) => (
                            <span
                                key={day.id}
                                className={cn('text-[0.6875rem] text-main text-center', day.isToday ? 'font-bold' : 'font-medium')}
                            >
                                {day.label}
                            </span>
                        ))}
                    </div>
                </div>

                <ProfileFieldList fields={fields} />

                <LinkButton
                    href="/schedule" variant="secondary" size="md" className="gap-2 mt-auto w-full"
                >
                    <LuCalendarCog className="size-4" aria-hidden="true" />
                    <span>Chỉnh lịch học</span>
                </LinkButton>
            </CardContent>
        </Card>
    );
}
