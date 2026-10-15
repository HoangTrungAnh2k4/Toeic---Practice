import { getTopMistake, type MistakeBook } from '@/app/mistakes/_lib/data';
import { getMistakeHref } from '@/app/mistakes/utils';
import { getAttemptHref } from '@/app/setting/history/utils';
import { getDaysUntil } from '@/app/setting/profile/utils';
import { getPlanWeekDays, getPlanWeekNo, isTaskDone, parseDayKey } from '@/lib/data/study-plan';
import type { ActivePlan } from '@/lib/data/user-data';
import { toDayKey, type UserStats } from '@/lib/data/user-stats';
import { PART_TEMPLATES } from '@/lib/domain/parts';
import { getScoreLevel } from '@/lib/domain/score-levels';
import type { PlanTask, Profile, Skill, StudyPlan } from '@/lib/domain/types';
import { buildTestHref } from '@/lib/exam-library/search-params';
import type { ExamSummary } from '@/lib/exam-library/types';
import type { DayStatus, ExamGoal, SkillProgress, StudyDay, StudyWeek, TaskStatus, TaskView } from './types';

export const SESSION_DURATION_OPTIONS = [30, 45, 60] as const;

const SKILL_LABEL: Record<Skill, string> = { speaking: 'Speaking', writing: 'Writing' };

const WEEKDAY = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

/** `YYYY-MM-DD` → `DD/MM`; Intl vi-VN in ra `DD-MM` nên tự ghép. */
const formatDayMonth = (key: string) => `${key.slice(8)}/${key.slice(5, 7)}`;

export function getProgressPercent(current: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
}

export function getTotalDuration(tasks: TaskView[]): number {
    return tasks.reduce((sum, task) => sum + task.duration, 0);
}

export function formatMinutes(minutes: number): string {
    return `${minutes} phút`;
}

export function buildExamGoal(profile: Profile, plan: StudyPlan, streakDays: number): ExamGoal {
    return {
        daysLeft: profile.exam_date ? getDaysUntil(profile.exam_date) : null,
        examDate: profile.exam_date ? `${formatDayMonth(profile.exam_date)}/${profile.exam_date.slice(0, 4)}` : null,
        minutesPerDay: plan.minutes_per_day,
        daysPerWeek: plan.days_per_week,
        streakDays,
    };
}

export function buildSkillProgress(stats: UserStats, profile: Profile, book: MistakeBook): SkillProgress[] {
    return (['speaking', 'writing'] as const).map((skill) => {
        const target = skill === 'speaking' ? profile.target_speaking : profile.target_writing;
        return {
            skill,
            label: SKILL_LABEL[skill],
            current: stats.skills[skill].latest_score,
            target,
            targetLevel: target === null ? null : getScoreLevel(skill, target),
            focus: getTopMistake(book, skill),
        };
    });
}

function getTaskLabel(task: PlanTask, exam: ExamSummary | undefined) {
    if (task.kind === 'review') return 'Ôn tập Sổ lỗi';
    if (task.kind === 'summary') return 'Tổng kết tuần';
    if (task.kind === 'mock') return exam ? `Thi thử ${SKILL_LABEL[exam.skill]}` : 'Thi thử';

    const template = PART_TEMPLATES.find((item) => item.id === task.part_template_id);
    return template ? `${SKILL_LABEL[task.kind]} Part ${template.part_no}` : `${SKILL_LABEL[task.kind]} cả đề`;
}

function getTaskAction(task: PlanTask, exam: ExamSummary | undefined, isToday: boolean) {
    if (task.attempt_id) return { actionLabel: 'Xem lại bài làm', href: getAttemptHref(task.attempt_id) };
    if (task.kind === 'review') {
        return {
            actionLabel: 'Mở sổ lỗi',
            href: task.mistake_pattern_id ? getMistakeHref(task.mistake_pattern_id) : '/mistakes',
        };
    }
    if (task.kind === 'summary') return { actionLabel: 'Xem hồ sơ học', href: '/setting/profile' };
    if (!exam) return { actionLabel: 'Chọn đề', href: task.kind === 'writing' ? '/writing' : '/speaking' };
    return { actionLabel: isToday ? 'Vào học' : 'Bắt đầu', href: buildTestHref(exam.skill, exam.id) };
}

export function buildTaskView(task: PlanTask, today: string, examById: Map<string, ExamSummary>): TaskView {
    const exam = task.exam_id ? examById.get(task.exam_id) : undefined;
    const isToday = task.scheduled_date === today;
    const status: TaskStatus = isTaskDone(task)
        ? 'done'
        : isToday
          ? 'today'
          : task.scheduled_date < today
            ? 'overdue'
            : 'scheduled';
    const statusLabel: Record<TaskStatus, string> = {
        done: 'Hoàn thành',
        today: 'Cần học hôm nay',
        overdue: 'Quá hạn',
        scheduled: `Dự kiến ${WEEKDAY[parseDayKey(task.scheduled_date).getDay()]}`,
    };

    return {
        id: task.id,
        kind: task.kind,
        label: getTaskLabel(task, exam),
        title: task.title,
        description: task.description,
        goal: task.goal,
        duration: task.duration_min,
        status,
        statusLabel: statusLabel[status],
        ...getTaskAction(task, exam, isToday),
    };
}

function getDayStatus(key: string, today: string, tasks: TaskView[]): DayStatus {
    if (key === today) return 'today';
    if (tasks.length === 0) return 'upcoming';
    if (tasks.every((task) => task.status === 'done')) return 'done';
    return key < today ? 'missed' : 'upcoming';
}

/** Tuần `weekNo` của lộ trình, Thứ 2 → Chủ nhật. */
export function buildWeek(
    { plan, weeks, tasks }: ActivePlan,
    weekNo: number,
    now: Date,
    examById: Map<string, ExamSummary>,
): StudyWeek {
    const today = toDayKey(now);
    const dates = getPlanWeekDays(plan, weekNo);
    const days: StudyDay[] = dates.map((date) => {
        const key = toDayKey(date);
        const dayTasks = tasks
            .filter((task) => task.scheduled_date === key)
            .map((task) => buildTaskView(task, today, examById));
        return {
            id: key,
            weekday: WEEKDAY[date.getDay()],
            date: formatDayMonth(key),
            status: getDayStatus(key, today, dayTasks),
            tasks: dayTasks,
        };
    });
    const weekTasks = days.flatMap((day) => day.tasks);

    return {
        index: weekNo,
        theme: weeks.find((week) => week.week_no === weekNo)?.theme ?? null,
        range: `${formatDayMonth(toDayKey(dates[0]))} – ${formatDayMonth(toDayKey(dates[6]))}`,
        isCurrent: weekNo === getPlanWeekNo(plan, now),
        completedTasks: weekTasks.filter((task) => task.status === 'done').length,
        totalTasks: weekTasks.length,
        days,
    };
}
