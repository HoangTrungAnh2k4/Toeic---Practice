import { LuClock, LuCoffee, LuPlay } from 'react-icons/lu';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SKILL_STYLE } from '../_lib/skillStyle';
import { StudyDay } from '../types';
import { formatMinutes, getTotalDuration } from '../utils';

interface TodayFocusProps {
    day?: StudyDay;
}

export default function TodayFocus({ day }: TodayFocusProps) {
    if (!day || day.tasks.length === 0) {
        return (
            <section className="flex flex-col justify-center items-center gap-2 bg-white p-8 border h-full border-sub2/30 rounded-xl text-center">
                <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                    <LuCoffee className="size-6" aria-hidden="true" />
                </span>
                <h2 className="font-semibold text-main text-sm">Hôm nay không có phiên học</h2>
                <p className="text-subText text-xs">Nghỉ ngơi hợp lý giúp duy trì phong độ cho các ngày tiếp theo.</p>
            </section>
        );
    }

    const firstTask = day.tasks[0];
    const startHref = firstTask.skill === 'writing' ? '/writing' : '/speaking';

    return (
        <section
            aria-labelledby="today-focus-title"
            className="flex flex-col gap-4 bg-main shadow-main/20 shadow-md p-5 rounded-xl h-full"
        >
            <div className="flex justify-between items-start gap-3">
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sub2 text-xs uppercase tracking-wider">
                        {day.weekday} · {day.date}
                    </span>
                    <h2 id="today-focus-title" className="font-bold text-white text-lg">
                        Phiên học hôm nay
                    </h2>
                </div>
                <span className="bg-sub3 px-2 py-0.5 rounded-md font-bold text-[11px] text-main uppercase tracking-wider">
                    Ưu tiên cao
                </span>
            </div>

            <ol className="flex flex-col gap-2">
                {day.tasks.map((task, index) => {
                    const style = SKILL_STYLE[task.skill];

                    return (
                        <li key={task.id} className="flex items-start gap-3 bg-white/10 p-3 rounded-lg">
                            <span
                                className={cn(
                                    'flex justify-center items-center rounded-lg size-9 shrink-0',
                                    index === 0 ? 'bg-sub3 text-main' : 'bg-white/15 text-sub3',
                                )}
                            >
                                <style.Icon className="size-4" aria-hidden="true" />
                            </span>
                            <div className="flex flex-col flex-1 gap-0.5 min-w-0">
                                <div className="flex justify-between items-center gap-2">
                                    <span className="font-semibold text-[11px] text-sub3">{task.label}</span>
                                    <span className="flex items-center gap-1 font-medium text-sub1 text-xs tabular-nums">
                                        <LuClock className="size-3.5" aria-hidden="true" />
                                        {formatMinutes(task.duration)}
                                    </span>
                                </div>
                                <span className="font-semibold text-white text-sm">{task.title}</span>
                                {task.description && (
                                    <span className="text-sub1 text-xs leading-relaxed">{task.description}</span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>

            <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-3 mt-auto">
                <span className="text-sub1 text-xs">
                    Tổng dự kiến:{' '}
                    <strong className="font-semibold text-white">{formatMinutes(getTotalDuration(day.tasks))}</strong>
                </span>
                <Link href={startHref} className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'gap-2')}>
                    <LuPlay className="size-4" aria-hidden="true" />
                    <span>Bắt đầu học ngay</span>
                </Link>
            </div>
        </section>
    );
}
