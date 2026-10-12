import AiRationale from './_components/AiRationale';
import FlexibilityPanel from './_components/FlexibilityPanel';
import ScheduleMilestones from './_components/ScheduleMilestones';
import SchedulePageHeader from './_components/SchedulePageHeader';
import TodayFocus from './_components/TodayFocus';
import WeekSprint from './_components/WeekSprint';
import WeeklyTaskTable from './_components/WeeklyTaskTable';
import { AI_CONFIDENCE, AI_INSIGHTS, CURRENT_WEEK, WEEKLY_TASKS } from './utils';

export default function SchedulePage() {
    const today = CURRENT_WEEK.days.find((day) => day.status === 'today');

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <SchedulePageHeader />
            <ScheduleMilestones />

            {/* Hành động trước: việc cần làm hôm nay + điều chỉnh khi bận */}
            <div className="gap-4 grid grid-cols-1 xl:grid-cols-12">
                <div className="xl:col-span-7">
                    <TodayFocus day={today} />
                </div>
                <div className="xl:col-span-5">
                    <FlexibilityPanel />
                </div>
            </div>

            <WeekSprint week={CURRENT_WEEK} />
            <AiRationale insights={AI_INSIGHTS} confidence={AI_CONFIDENCE} />
            <WeeklyTaskTable tasks={WEEKLY_TASKS} />
        </main>
    );
}
