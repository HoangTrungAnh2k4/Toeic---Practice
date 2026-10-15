import { LuCalendarRange, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { StudyWeek } from '../types';
import { getProgressPercent } from '../utils';
import StudyDayCard from './StudyDayCard';

interface WeekSprintProps {
    week: StudyWeek;
    weekCount: number;
    onWeekChange: (weekNo: number) => void;
}

export default function WeekSprint({ week, weekCount, onWeekChange }: WeekSprintProps) {
    const percent = getProgressPercent(week.completedTasks, week.totalTasks);

    return (
        <section
            aria-labelledby="week-sprint-title"
            className="flex flex-col gap-4 bg-white shadow-sm p-5 border border-sub2/30 rounded-xl"
        >
            {/* Week header & navigator */}
            <div className="flex lg:flex-row flex-col justify-between lg:items-center gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    <span className="flex justify-center items-center bg-sub1 rounded-lg size-10 text-main shrink-0">
                        <LuCalendarRange className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 id="week-sprint-title" className="font-bold text-main text-lg">
                                Tuần {week.index}
                                {week.theme && `: ${week.theme}`}
                            </h2>
                            {week.isCurrent && (
                                <span className="bg-sub3 px-2 py-0.5 rounded-md font-bold text-[11px] text-main">
                                    Tuần hiện tại
                                </span>
                            )}
                        </div>
                        <span className="font-medium text-subText text-xs tabular-nums">{week.range}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex flex-col gap-1 min-w-40">
                        <span className="font-semibold text-subText text-xs">
                            Hoàn thành{' '}
                            <strong className="text-main">
                                {week.completedTasks}/{week.totalTasks}
                            </strong>{' '}
                            bài
                        </span>
                        <div
                            role="progressbar"
                            aria-label="Tiến độ tuần"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={percent}
                            className="bg-sub1 rounded-full w-full h-1.5 overflow-hidden"
                        >
                            <div className="bg-main rounded-full h-full" style={{ width: `${percent}%` }} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="third"
                            className="bg-white px-0 w-9"
                            aria-label="Tuần trước"
                            disabled={week.index <= 1}
                            onClick={() => onWeekChange(week.index - 1)}
                        >
                            <LuChevronLeft className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="third"
                            className="bg-white px-0 w-9"
                            aria-label="Tuần sau"
                            disabled={week.index >= weekCount}
                            onClick={() => onWeekChange(week.index + 1)}
                        >
                            <LuChevronRight className="size-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Day strip: cuộn ngang trên màn nhỏ, lưới 7 cột trên màn rộng */}
            {week.totalTasks === 0 ? (
                <p className="bg-sub1/40 p-6 rounded-lg font-medium text-subText text-xs text-center">
                    Tuần này chưa có lịch học. Dùng “Tối ưu lộ trình (AI)” để tạo lịch mới.
                </p>
            ) : (
                <ol className="flex 2xl:grid 2xl:grid-cols-7 gap-3 -mx-1 px-1 pt-1 pb-2 overflow-x-auto 2xl:overflow-visible snap-x snap-mandatory">
                    {week.days.map((day) => (
                        <li key={day.id} className="w-44 2xl:w-auto snap-start shrink-0">
                            <StudyDayCard day={day} />
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
