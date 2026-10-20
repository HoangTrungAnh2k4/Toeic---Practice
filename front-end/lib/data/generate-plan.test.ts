import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({ supabase: {} }));

import type { ExamSummary } from '@/lib/exam-library/types';
import { generatePlan, type PlanInput } from './generate-plan';

const exam = (id: string, skill: 'speaking' | 'writing', durationMin: number) =>
    ({ id, code: id, title: id, skill, status: 'published', durationMin }) as ExamSummary;

// Thứ 2, 2026-10-19
const input = (patch: Partial<PlanInput> = {}): PlanInput => ({
    today: new Date(2026, 9, 19, 9),
    examDate: '2026-12-14',
    targets: { speaking: 160, writing: 150 },
    currentScores: { speaking: 150, writing: 100 },
    partRatios: new Map([
        [6, 0.9],
        [7, 0.2],
        [8, 0.9],
    ]),
    topMistakes: { speaking: null, writing: { id: '00000000-0000-4000-8000-000000000002', title: 'Bỏ sót nhiệm vụ' } },
    exams: [
        exam('S1', 'speaking', 20),
        exam('W1', 'writing', 60),
        exam('W2', 'writing', 60),
        { ...exam('D', 'writing', 60), status: 'draft' },
    ],
    lastAttemptAt: new Map([['W1', '2026-10-01T00:00:00Z']]),
    minutesPerDay: 45,
    daysPerWeek: 5,
    ...patch,
});

function byDay<T extends { scheduled_date: string }>(tasks: T[]) {
    const days = new Map<string, T[]>();
    for (const task of tasks) days.set(task.scheduled_date, [...(days.get(task.scheduled_date) ?? []), task]);
    return days;
}

describe('generatePlan', () => {
    it('schedules study days before the exam within the daily budget, mocks aside', () => {
        const plan = generatePlan(input());
        const days = byDay(plan.tasks);

        expect(
            plan.tasks.every((task) => task.scheduled_date >= '2026-10-19' && task.scheduled_date < '2026-12-14'),
        ).toBe(true);
        for (const tasks of days.values()) {
            if (tasks.some((task) => task.kind === 'mock')) continue;
            expect(tasks.reduce((sum, task) => sum + task.duration_min, 0)).toBeLessThanOrEqual(45);
        }
        // 8 tuần trọn trước ngày thi, 5 buổi mỗi tuần
        expect(days.size).toBe(40);
    });

    it('gives the skill with the bigger gap more days and still trains the other', () => {
        const plan = generatePlan(input());
        const count = (kind: string) => plan.tasks.filter((task) => task.kind === kind).length;

        expect(count('writing')).toBeGreaterThan(count('speaking'));
        expect(count('speaking')).toBeGreaterThan(0);
        // Part yếu nhất (Q6-7) được luyện nhiều nhất
        const writingParts = plan.tasks.filter((task) => task.kind === 'writing').map((task) => task.part_template_id);
        const partCount = (id: number) => writingParts.filter((part) => part === id).length;
        expect(partCount(7)).toBeGreaterThan(partCount(6));
        expect(plan.ai_rationale).toContain('Writing');
    });

    it('uses only mocks and reviews in the final week, and never a draft exam', () => {
        const plan = generatePlan(input());
        const sprint = plan.tasks.filter((task) => task.scheduled_date >= '2026-12-07');

        expect(sprint.length).toBeGreaterThan(0);
        expect(sprint.every((task) => task.kind === 'mock' || task.kind === 'review')).toBe(true);
        expect(plan.tasks.some((task) => task.exam_id === 'D')).toBe(false);
        expect(plan.weeks.at(-1)?.theme).toContain('Nước rút');
    });

    it('starts with a baseline mock per skill without a full-test score, unseen exam first', () => {
        const plan = generatePlan(input({ currentScores: { speaking: null, writing: null } }));

        expect(plan.tasks.slice(0, 2).map((task) => [task.kind, task.exam_id])).toEqual([
            ['mock', 'S1'],
            ['mock', 'W2'],
        ]);
    });

    it('links the review task to the top mistake pattern', () => {
        const review = generatePlan(input()).tasks.find((task) => task.kind === 'review');

        expect(review?.title).toBe('Bỏ sót nhiệm vụ');
        expect(review?.mistake_pattern_id).toBe('00000000-0000-4000-8000-000000000002');
    });

    it('is deterministic, caps at 12 weeks and handles an exam tomorrow', () => {
        expect(generatePlan(input())).toEqual(generatePlan(input()));

        const far = generatePlan(input({ examDate: '2027-12-01' }));
        expect(far.weeks.length).toBe(12);
        expect(far.tasks.some((task) => task.kind === 'mock')).toBe(false);

        // Chủ nhật: không trúng lịch 5 buổi nhưng vẫn có một buổi trước ngày thi
        const tomorrow = generatePlan(input({ today: new Date(2026, 9, 25, 9), examDate: '2026-10-26' }));
        expect(tomorrow.tasks.map((task) => task.scheduled_date)).toEqual(['2026-10-25']);
    });

    it('rejects plans without a target or with a past exam date', () => {
        expect(() => generatePlan(input({ targets: { speaking: null, writing: null } }))).toThrow();
        expect(() => generatePlan(input({ examDate: '2026-10-19' }))).toThrow();
    });
});
