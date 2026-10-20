import { getPartTemplates } from '@/lib/domain/parts';
import type { PlanTask, Skill, StudyPlanWeek } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { getPlanWeekNo, parseDayKey } from './study-plan';
import { toDayKey } from './user-stats';

const MAX_WEEKS = 12;
const SPRINT_DAYS = 7;
const SUMMARY_MIN = 10;
const SKILLS: Skill[] = ['speaking', 'writing'];
const SKILL_LABEL: Record<Skill, string> = { speaking: 'Speaking', writing: 'Writing' };

export interface PlanInput {
    today: Date;
    /** `YYYY-MM-DD`, sau hôm nay. */
    examDate: string;
    /** `null` = không luyện kỹ năng này; phải có ít nhất một kỹ năng. */
    targets: Record<Skill, number | null>;
    /** Điểm cả đề gần nhất; `null` = chưa có. */
    currentScores: Record<Skill, number | null>;
    /** Điểm trung bình theo Part (0-1), key `part_template_id`; thiếu hoặc `null` = chưa có điểm. */
    partRatios: Map<number, number | null>;
    /** Mẫu lỗi đang mắc nặng nhất của từng kỹ năng. */
    topMistakes: Record<Skill, { id: string; title: string } | null>;
    exams: ExamSummary[];
    /** Lượt làm gần nhất của mỗi đề (ISO), để ưu tiên đề chưa làm / làm lâu nhất. */
    lastAttemptAt: Map<string, string>;
    minutesPerDay: number;
    daysPerWeek: number;
}

export type PlanTaskDraft = Omit<PlanTask, 'id' | 'plan_id' | 'attempt_id' | 'completed_at'>;

export interface PlanDraft {
    minutes_per_day: number;
    days_per_week: number;
    ai_rationale: string;
    weeks: Omit<StudyPlanWeek, 'plan_id'>[];
    tasks: PlanTaskDraft[];
}

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const formatDate = (key: string) => `${key.slice(8)}/${key.slice(5, 7)}/${key.slice(0, 4)}`;

/** Weighted round-robin: lấy khoá có số lần đã chọn / trọng số nhỏ nhất, hoà thì theo thứ tự `keys`. */
function pickWeighted<K>(keys: K[], weight: (key: K) => number, picks: Map<K, number>): K {
    let best = keys[0];
    for (const key of keys) {
        if ((picks.get(key) ?? 0) / weight(key) < (picks.get(best) ?? 0) / weight(best)) best = key;
    }
    picks.set(best, (picks.get(best) ?? 0) + 1);
    return best;
}

/** Ngày học trong tuần (0 = Thứ 2) trải đều theo số buổi/tuần. */
const studyWeekdays = (daysPerWeek: number) =>
    new Set(Array.from({ length: daysPerWeek }, (_, index) => Math.floor((index * 7) / daysPerWeek)));

/**
 * Lộ trình rule-based (E6-2, `docs/prd/study-plan.md`): từ hôm nay tới hết ngày trước ngày thi, tối đa 12 tuần.
 * Hàm thuần, cùng đầu vào cho cùng kết quả.
 */
export function generatePlan(input: PlanInput): PlanDraft {
    const skills = SKILLS.filter((skill) => input.targets[skill] !== null);
    if (skills.length === 0) throw new Error('At least one target score is required');

    const todayKey = toDayKey(input.today);
    if (input.examDate <= todayKey) throw new Error('Exam date must be after today');

    const weekNoOf = (key: string) => getPlanWeekNo({ created_at: input.today.toISOString() }, parseDayKey(key));
    const examDay = parseDayKey(input.examDate);
    const sprintFrom = toDayKey(addDays(examDay, -SPRINT_DAYS));
    const capped = weekNoOf(toDayKey(addDays(examDay, -1))) > MAX_WEEKS;

    // Ngày học: theo lịch tuần, trong 12 tuần, trước ngày thi; không trúng ngày nào thì học mọi ngày còn lại
    const allDays: string[] = [];
    for (let day = parseDayKey(todayKey); day < examDay; day = addDays(day, 1)) {
        const key = toDayKey(day);
        if (weekNoOf(key) > MAX_WEEKS) break;
        allDays.push(key);
    }
    const weekdays = studyWeekdays(input.daysPerWeek);
    const picked = allDays.filter((key) => weekdays.has((parseDayKey(key).getDay() + 6) % 7));
    const days = picked.length > 0 ? picked : allDays;

    const gap = (skill: Skill) => Math.max((input.targets[skill] ?? 0) - (input.currentScores[skill] ?? 0), 10);
    const skillsByGap = [...skills].sort((a, b) => gap(b) - gap(a));
    const examQueues = new Map(
        skills.map((skill) => [
            skill,
            input.exams
                .filter((exam) => exam.skill === skill && exam.status === 'published')
                .sort(
                    (a, b) =>
                        (input.lastAttemptAt.get(a.id) ?? '').localeCompare(input.lastAttemptAt.get(b.id) ?? '') ||
                        a.code.localeCompare(b.code),
                ),
        ]),
    );
    const nextExam = (skill: Skill) => {
        const queue = examQueues.get(skill)!;
        const exam = queue.shift();
        if (exam) queue.push(exam);
        return exam ?? null;
    };
    const partPicks = new Map<number, number>();
    const partWeight = (id: number) => 1.2 - (input.partRatios.get(id) ?? 0);

    const reviewMistake = skillsByGap.map((skill) => input.topMistakes[skill]).find((item) => item !== null) ?? null;

    const base = (key: string, sortOrder: number, minutes: number) => ({
        scheduled_date: key,
        sort_order: sortOrder,
        duration_min: minutes,
        exam_id: null,
        part_template_id: null,
        mistake_pattern_id: null,
    });
    const mock = (key: string, skill: Skill): PlanTaskDraft => {
        const exam = nextExam(skill);
        return {
            ...base(key, 0, exam?.durationMin ?? input.minutesPerDay),
            kind: 'mock',
            title: exam ? `Thi thử: ${exam.title}` : `Thi thử ${SKILL_LABEL[skill]} cả đề`,
            description: 'Làm trọn đề trong thời gian thật, không xem bài mẫu.',
            goal: 'Lấy điểm cả đề làm mốc so với mục tiêu',
            exam_id: exam?.id ?? null,
        };
    };
    const practice = (key: string, skill: Skill, minutes: number): PlanTaskDraft => {
        const parts = getPartTemplates(skill);
        const partId = pickWeighted(
            parts.map((part) => part.id),
            partWeight,
            partPicks,
        );
        const part = parts.find((item) => item.id === partId)!;
        return {
            ...base(key, 0, minutes),
            kind: skill,
            title: part.task,
            description: `Part ${part.part_no} · Q${part.q_from}${part.q_to > part.q_from ? `–${part.q_to}` : ''}`,
            goal: 'Làm lại Part, đối chiếu nhận xét và bài mẫu',
            exam_id: nextExam(skill)?.id ?? null,
            part_template_id: part.id,
        };
    };
    const review = (key: string, minutes: number): PlanTaskDraft => ({
        ...base(key, 0, minutes),
        kind: 'review',
        title: reviewMistake!.title,
        description: 'Ôn mẫu lỗi trong Sổ lỗi, làm theo các bước khắc phục.',
        goal: 'Tự kiểm tra theo checklist của mẫu lỗi',
        mistake_pattern_id: reviewMistake!.id,
    });

    const tasks: PlanTaskDraft[] = [];
    const needsMock = skills.filter((skill) => input.currentScores[skill] === null);
    const weekNos = [...new Set(days.map(weekNoOf))];
    const themes = new Map<number, string>();
    const sprintPicks = new Map<Skill, number>();

    for (const weekNo of weekNos) {
        const weekDays = days.filter((key) => weekNoOf(key) === weekNo);
        const skillPicks = new Map<Skill, number>();
        let sprintWeek = false;

        weekDays.forEach((key, index) => {
            const isLast = index === weekDays.length - 1 && weekDays.length > 1;
            const sprint = !capped && key >= sprintFrom;
            sprintWeek ||= sprint;

            if (sprint) {
                // Nước rút: xen kẽ thi thử và ôn lỗi, không xếp Part mới
                const sprintIndex = days.filter((day) => day >= sprintFrom).indexOf(key);
                tasks.push(
                    sprintIndex % 2 === 1 && reviewMistake
                        ? review(key, input.minutesPerDay)
                        : mock(key, pickWeighted(skillsByGap, gap, sprintPicks)),
                );
                return;
            }

            const mainMinutes = isLast ? input.minutesPerDay - SUMMARY_MIN : input.minutesPerDay;
            if (weekNo === weekNos[0] && index < needsMock.length) {
                tasks.push(mock(key, needsMock[index]));
            } else if (isLast && reviewMistake) {
                tasks.push(review(key, mainMinutes));
            } else {
                tasks.push(practice(key, pickWeighted(skillsByGap, gap, skillPicks), mainMinutes));
            }
            if (isLast) {
                tasks.push({
                    ...base(key, 1, SUMMARY_MIN),
                    kind: 'summary',
                    title: 'Tổng kết tuần',
                    description: 'Xem lại điểm và lỗi của tuần, ghi chú điều cần giữ cho tuần sau.',
                    goal: null,
                });
            }
        });

        themes.set(
            weekNo,
            sprintWeek
                ? 'Nước rút: thi thử & ôn lỗi'
                : weekNo === weekNos[0] && needsMock.length > 0
                  ? 'Chẩn đoán & làm quen đề'
                  : 'Củng cố Part yếu',
        );
    }

    const [focus] = skillsByGap;
    const current = input.currentScores[focus];
    const reason =
        current === null
            ? `${SKILL_LABEL[focus]} chưa có điểm cả đề nên tuần đầu thi thử để lấy mốc`
            : `Ưu tiên ${SKILL_LABEL[focus]} vì còn thiếu ${Math.max(input.targets[focus]! - current, 0)} điểm so với mục tiêu ${input.targets[focus]}`;
    const until = capped ? '12 tuần đầu' : `đến ngày thi ${formatDate(input.examDate)}`;

    return {
        minutes_per_day: input.minutesPerDay,
        days_per_week: input.daysPerWeek,
        ai_rationale: `${reason}. Lịch ${input.daysPerWeek} buổi/tuần × ${input.minutesPerDay} phút, ${until}.`,
        weeks: [...themes].map(([week_no, theme]) => ({ week_no, theme })),
        tasks,
    };
}
