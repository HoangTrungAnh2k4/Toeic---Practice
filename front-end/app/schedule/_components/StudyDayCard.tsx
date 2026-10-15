import { LuCheck, LuClock } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { SKILL_STYLE } from '../_lib/skillStyle';
import { StudyDay } from '../types';
import { formatMinutes, getTotalDuration } from '../utils';

interface StudyDayCardProps {
    day: StudyDay;
}

export default function StudyDayCard({ day }: StudyDayCardProps) {
    const isToday = day.status === 'today';
    const isDone = day.status === 'done';
    const [mainTask, ...extraTasks] = day.tasks;
    const style = mainTask ? SKILL_STYLE[mainTask.kind] : null;

    return (
        <article
            aria-current={isToday ? 'date' : undefined}
            className={cn(
                'flex flex-col gap-3 bg-white p-4 border border-sub2/30 rounded-xl h-full transition-shadow hover:shadow-md',
                isDone && 'bg-sub1/30',
                isToday && 'bg-sub3/10 border-sub3 ring-2 ring-sub3 shadow-md',
            )}
        >
            {/* Day header */}
            <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col">
                    <span className={cn('font-bold text-sm', isToday ? 'text-main' : 'text-subText')}>
                        {isToday ? 'Hôm nay' : day.weekday}
                    </span>
                    <span className="font-medium text-sub2 text-xs tabular-nums">{day.date}</span>
                </div>
                {isDone && (
                    <span className="flex justify-center items-center bg-main rounded-full size-6 text-sub3">
                        <LuCheck className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">Đã hoàn thành</span>
                    </span>
                )}
                {isToday && (
                    <span className="bg-main px-2 py-0.5 rounded-md font-bold text-[10px] text-sub3 uppercase tracking-wider">
                        Ưu tiên
                    </span>
                )}
                {day.status === 'missed' && (
                    <span className="bg-destructive/10 px-2 py-0.5 rounded-md font-bold text-[10px] text-destructive">
                        Bỏ lỡ
                    </span>
                )}
                {day.status === 'upcoming' && (
                    <span className="bg-sub2/40 mt-1.5 rounded-full size-2" aria-hidden="true" />
                )}
            </div>

            {/* Main task */}
            {mainTask && style ? (
                <div className="flex flex-col flex-1 gap-1.5">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[11px] text-main">
                        <span className={cn('flex justify-center items-center rounded-md size-5', style.className)}>
                            <style.Icon className="size-3" aria-hidden="true" />
                        </span>
                        {mainTask.label}
                    </span>
                    <h3 className="font-semibold text-main text-sm line-clamp-2 leading-snug">{mainTask.title}</h3>
                    {extraTasks.length > 0 && (
                        <span className="font-medium text-[11px] text-subText">+{extraTasks.length} bài bổ trợ</span>
                    )}
                    <span className="flex items-center gap-1 mt-auto font-medium text-subText text-xs">
                        <LuClock className="size-3.5" aria-hidden="true" />
                        {formatMinutes(getTotalDuration(day.tasks))}
                    </span>
                </div>
            ) : (
                <p className="flex-1 font-medium text-sub2 text-xs">Ngày nghỉ – không có bài</p>
            )}

            {/* Tiêu chí cần đạt của bài chính */}
            {mainTask?.goal && (
                <div className="flex justify-between items-center gap-2 bg-white px-2.5 py-1.5 border border-sub2/20 rounded-lg text-[11px]">
                    <span className="text-subText shrink-0">Mục tiêu</span>
                    <span className="font-bold text-main truncate" title={mainTask.goal}>
                        {mainTask.goal}
                    </span>
                </div>
            )}
        </article>
    );
}
