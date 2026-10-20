import type { PlanTask, StudyPlan } from '@/lib/domain/types';
import type { ActivePlan } from './user-data';
import { toDayKey } from './user-stats';

const WEEK_MS = 7 * 86_400_000;

/** `YYYY-MM-DD` → 00:00 giờ máy (không parse như UTC). */
export function parseDayKey(key: string) {
    return new Date(`${key}T00:00:00`);
}

/** Thứ 2 của tuần chứa `date`, lúc 00:00 giờ máy. */
function startOfWeek(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
}

/** Tuần 1 là tuần (Thứ 2 – Chủ nhật) chứa ngày tạo lộ trình. */
export function getPlanWeekNo(plan: Pick<StudyPlan, 'created_at'>, date: Date): number {
    // round: tuần qua đổi giờ mùa hè dài/ngắn hơn 7 ngày một giờ
    return Math.round((startOfWeek(date).getTime() - startOfWeek(new Date(plan.created_at)).getTime()) / WEEK_MS) + 1;
}

/** 7 ngày Thứ 2 → Chủ nhật của tuần `weekNo`. */
export function getPlanWeekDays(plan: StudyPlan, weekNo: number): Date[] {
    const monday = startOfWeek(new Date(plan.created_at));
    return Array.from(
        { length: 7 },
        (_, index) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + (weekNo - 1) * 7 + index),
    );
}

/** Số tuần của lộ trình: tuần có chủ đề hoặc có task, lấy tuần muộn nhất. */
export function getPlanWeekCount({ plan, weeks, tasks }: ActivePlan): number {
    return Math.max(
        1,
        ...weeks.map((week) => week.week_no),
        ...tasks.map((task) => getPlanWeekNo(plan, parseDayKey(task.scheduled_date))),
    );
}

export function isTaskDone(task: PlanTask) {
    return task.attempt_id !== null || task.completed_at !== null;
}

/** Task xếp trong tháng của `now`. */
export function getMonthTaskProgress(tasks: PlanTask[], now: Date) {
    const today = toDayKey(now);
    const inMonth = tasks.filter((task) => task.scheduled_date.startsWith(today.slice(0, 7)));
    return {
        completed: inMonth.filter(isTaskDone).length,
        total: inMonth.length,
        overdue: inMonth.filter((task) => !isTaskDone(task) && task.scheduled_date < today).length,
    };
}
