export type TaskSkill = 'speaking' | 'writing' | 'review' | 'mock' | 'summary';

export type DayStatus = 'done' | 'today' | 'upcoming';

export type TaskStatus = 'done' | 'today' | 'todo' | 'scheduled';

export type InsightTone = 'critical' | 'warning';

export interface ExamGoal {
    daysLeft: number;
    examDate: string;
    minutesPerDay: number;
    daysPerWeek: number;
    streakDays: number;
}

export interface SkillProgress {
    skill: 'speaking' | 'writing';
    label: string;
    current: number;
    target: number;
    targetLevel: string;
    focus: string;
}

export interface MonthlyProgress {
    completed: number;
    total: number;
    note: string;
}

export interface DayTask {
    id: string;
    skill: TaskSkill;
    label: string;
    title: string;
    description?: string;
    duration: number;
}

export interface StudyDay {
    id: string;
    weekday: string;
    date: string;
    status: DayStatus;
    tasks: DayTask[];
    meta?: { label: string; value: string };
}

export interface StudyWeek {
    index: number;
    theme: string;
    range: string;
    isCurrent: boolean;
    completedSessions: number;
    totalSessions: number;
    days: StudyDay[];
}

export interface AiInsight {
    id: string;
    skill: TaskSkill;
    title: string;
    metric: string;
    tone: InsightTone;
    summary: string;
    highlight: string;
    conclusion: string;
    tag: string;
    linkLabel: string;
    href: string;
}

export interface WeeklyTask {
    id: string;
    skill: TaskSkill;
    partLabel: string;
    topic: string;
    rubric: string;
    duration: number;
    status: TaskStatus;
    statusLabel?: string;
    actionLabel: string;
    href: string;
}
