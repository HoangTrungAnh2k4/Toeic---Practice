import LandingScheduleGoal from './LandingScheduleGoal';
import LandingScheduleWeek from './LandingScheduleWeek';

/** Section lộ trình: thẻ mục tiêu bên trái, lịch tuần + giải thích AI bên phải. */
export function LandingSchedule() {
    return (
        <section id="lo-trinh" aria-labelledby="schedule-title" className="bg-grid-paper px-4 sm:px-8 py-12 w-full">
            <div className="flex flex-col gap-10 mx-auto max-w-300">
                <div className="flex flex-col gap-3">
                    <p className="font-semibold text-subText text-xs uppercase tracking-wider">Lộ trình, Schedule</p>
                    <h2 id="schedule-title" className="font-bold text-main text-4xl sm:text-5xl leading-[1.05] tracking-tight">
                        Lên lịch theo giờ rảnh.
                        <br />
                        Hôm nay bận? Dời sang mai.
                    </h2>
                    <p className="max-w-xl font-medium text-subText leading-relaxed">
                        Chọn điểm mục tiêu, Toeco xếp bài vào đúng những ngày bạn rảnh và tự dời lịch khi bạn bận.
                    </p>
                </div>

                <div className="items-stretch gap-6 lg:gap-8 grid lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <LandingScheduleGoal />
                    </div>
                    <div className="lg:col-span-7">
                        <LandingScheduleWeek />
                    </div>
                </div>
            </div>
        </section>
    );
}
