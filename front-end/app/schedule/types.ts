import type { MistakeItem } from '@/app/mistakes/types';
import type { PlanTaskKind, Skill } from '@/lib/domain/types';

export type DayStatus = 'done' | 'today' | 'missed' | 'upcoming';

export type TaskStatus = 'done' | 'today' | 'overdue' | 'scheduled';

export interface ExamGoal {
    /** `null` khi chưa đặt ngày thi. */
    daysLeft: number | null;
    examDate: string | null;
    minutesPerDay: number;
    daysPerWeek: number;
    streakDays: number;
}

export interface SkillProgress {
    skill: Skill;
    label: string;
    /** Điểm lượt làm cả đề gần nhất. */
    current: number | null;
    target: number | null;
    targetLevel: number | null;
    focus: MistakeItem | null;
}

export interface MonthlyProgress {
    completed: number;
    total: number;
    overdue: number;
}

/** Một `plan_tasks` đã gắn nhãn, trạng thái và link để hiển thị. */
export interface TaskView {
    id: string;
    kind: PlanTaskKind;
    label: string;
    title: string;
    description: string | null;
    goal: string | null;
    duration: number;
    status: TaskStatus;
    statusLabel: string;
    actionLabel: string;
    href: string;
}

export interface StudyDay {
    id: string;
    weekday: string;
    date: string;
    status: DayStatus;
    tasks: TaskView[];
}

export interface StudyWeek {
    index: number;
    theme: string | null;
    range: string;
    isCurrent: boolean;
    completedTasks: number;
    totalTasks: number;
    days: StudyDay[];
}
