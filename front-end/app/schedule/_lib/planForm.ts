import { z } from 'zod';
import { getTopMistake, type MistakeBook } from '@/app/mistakes/_lib/data';
import { MISTAKES_ENABLED } from '@/app/mistakes/utils';
import { generatePlan } from '@/lib/data/generate-plan';
import { toDayKey, type UserStats } from '@/lib/data/user-stats';
import { createStudyPlan, listAttempts, type PlanGoals } from '@/lib/data/user-data';
import type { Profile, StudyPlan } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { SESSION_DURATION_OPTIONS } from '../utils';

const target = z.number().int().min(10).max(200).nullable();

export const planGoalsSchema = z
    .object({
        target_speaking: target,
        target_writing: target,
        exam_date: z.iso.date('Chọn ngày thi'),
        days_per_week: z.number().int().min(3).max(7),
        minutes_per_day: z.union(SESSION_DURATION_OPTIONS.map((option) => z.literal(option))),
    })
    .refine((values) => values.target_speaking !== null || values.target_writing !== null, {
        message: 'Đặt mục tiêu cho ít nhất một kỹ năng',
        path: ['target_speaking'],
    })
    // so chuỗi `YYYY-MM-DD` theo giờ máy
    .refine((values) => values.exam_date > toDayKey(new Date()), {
        message: 'Ngày thi phải sau hôm nay',
        path: ['exam_date'],
    });

export type PlanGoalsValues = z.infer<typeof planGoalsSchema>;

export function getPlanGoalsDefaults(profile: Profile, plan: StudyPlan | null): PlanGoalsValues {
    const minutes = SESSION_DURATION_OPTIONS.find((option) => option === plan?.minutes_per_day) ?? 45;
    return {
        target_speaking: profile.target_speaking,
        target_writing: profile.target_writing,
        exam_date: profile.exam_date ?? '',
        days_per_week: plan?.days_per_week ?? 5,
        minutes_per_day: minutes,
    };
}

export interface PlanContext {
    stats: UserStats;
    book: MistakeBook;
    exams: ExamSummary[];
}

/** Sinh lộ trình rule-based từ mục tiêu + thống kê hiện có, rồi lưu cùng mục tiêu (thay lộ trình `active` cũ). */
export async function savePlan(values: PlanGoalsValues, { stats, book, exams }: PlanContext): Promise<void> {
    const attempts = await listAttempts();
    const lastAttemptAt = new Map<string, string>();
    // mới nhất trước nên giữ lượt đầu tiên gặp
    for (const attempt of attempts)
        if (!lastAttemptAt.has(attempt.exam_id)) lastAttemptAt.set(attempt.exam_id, attempt.started_at);

    const goals: PlanGoals = {
        target_speaking: values.target_speaking,
        target_writing: values.target_writing,
        exam_date: values.exam_date,
    };
    const draft = generatePlan({
        today: new Date(),
        examDate: values.exam_date,
        targets: { speaking: values.target_speaking, writing: values.target_writing },
        currentScores: { speaking: stats.skills.speaking.latest_score, writing: stats.skills.writing.latest_score },
        partRatios: new Map(stats.parts.map((part) => [part.part_template_id, part.avg_score_ratio])),
        // Không có mẫu lỗi thì generatePlan không xếp task ôn Sổ lỗi
        topMistakes: MISTAKES_ENABLED
            ? { speaking: getTopMistake(book, 'speaking'), writing: getTopMistake(book, 'writing') }
            : { speaking: null, writing: null },
        exams,
        lastAttemptAt,
        minutesPerDay: values.minutes_per_day,
        daysPerWeek: values.days_per_week,
    });
    await createStudyPlan(goals, draft);
}
