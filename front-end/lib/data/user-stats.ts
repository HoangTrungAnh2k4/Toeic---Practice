import { PART_TEMPLATES } from '@/lib/domain/parts';
import { summarizeWriting } from '@/lib/scoring/scale';
import type {
    Attempt,
    Exam,
    ExamPart,
    Question,
    AttemptResponse,
    Skill,
    UserPartStats,
    UserSkillStats,
    UserStudyStats,
} from '@/lib/domain/types';
import { listExamParts, listQuestions } from './content';
import { GUEST_USER_ID, listAttempts, listResponses } from './user-data';

/** Thống kê học tập của người dùng — logic của các view `user_skill_stats`, `user_part_stats`, `user_study_stats`. */
export interface UserStats {
    skills: Record<Skill, UserSkillStats>;
    parts: UserPartStats[];
    study: UserStudyStats;
    /** Điểm các lượt làm cả đề đã chấm, cũ → mới; lượt luyện riêng Part không phản ánh điểm 0-200 của kỹ năng. */
    fullTestScores: { attempt_id: string; skill: Skill; score: number; scored_at: string }[];
    /** Số phút học theo ngày, key `YYYY-MM-DD` giờ địa phương. */
    minutesByDay: Record<string, number>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** `YYYY-MM-DD` theo giờ địa phương (toISOString lệch ngày ở múi giờ +7). */
export function toDayKey(date: Date) {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Phút làm bài của một lượt đã nộp; lượt chưa nộp tính 0.
 * Không vượt quá `ends_at` để lượt bỏ dở rồi quay lại nộp muộn không thổi phồng thời gian học.
 */
function attemptMinutes(attempt: Attempt) {
    if (!attempt.submitted_at) return 0;
    const end = Math.min(Date.parse(attempt.submitted_at), attempt.ends_at ? Date.parse(attempt.ends_at) : Infinity);
    return Math.max(0, Math.round((end - Date.parse(attempt.started_at)) / 60000));
}

/** Chuỗi ngày học hiện tại (tính tới hôm nay, hoặc hôm qua nếu hôm nay chưa học) và chuỗi dài nhất. */
function getStreaks(days: Set<string>, now: Date) {
    const sorted = [...days].sort();
    let best = 0;
    let run = 0;
    let prev: number | null = null;
    for (const key of sorted) {
        const time = Date.parse(`${key}T00:00:00`);
        run = prev !== null && Math.round((time - prev) / DAY_MS) === 1 ? run + 1 : 1;
        best = Math.max(best, run);
        prev = time;
    }

    const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (!days.has(toDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let current = 0;
    while (days.has(toDayKey(cursor))) {
        current += 1;
        cursor.setDate(cursor.getDate() - 1);
    }
    return { current, best };
}

/** Câu trả lời, Part và câu hỏi của một lượt đã chấm; nạp một lần, dùng cho điểm theo Part và điểm Writing cả bài. */
export interface AttemptDetails {
    responses: AttemptResponse[];
    parts: ExamPart[];
    questions: Question[];
}

async function loadAttemptDetails(attempts: Attempt[]) {
    const entries = await Promise.all(
        attempts.map(async (attempt) => {
            const [responses, parts, questions] = await Promise.all([
                listResponses(attempt.id),
                listExamParts(attempt.exam_id),
                listQuestions(attempt.exam_id),
            ]);
            return [attempt.id, { responses, parts, questions }] as const;
        }),
    );
    return new Map<string, AttemptDetails>(entries);
}

/** Tổng điểm / điểm tối đa của các câu đã chấm, gom theo Part. */
function scoreParts(details: Iterable<AttemptDetails>) {
    const totals = new Map<number, { score: number; max: number }>();
    for (const { responses, parts, questions } of details) {
        const partTemplateOf = new Map(parts.map((part) => [part.id, part.part_template_id]));
        const examPartOf = new Map(questions.map((question) => [question.id, question.exam_part_id]));
        for (const { question_id, score, max_score } of responses) {
            const examPartId = examPartOf.get(question_id);
            const partTemplateId = examPartId && partTemplateOf.get(examPartId);
            if (!partTemplateId || score === null || !max_score) continue;
            const total = totals.get(partTemplateId) ?? { score: 0, max: 0 };
            totals.set(partTemplateId, { score: total.score + score, max: total.max + max_score });
        }
    }
    return totals;
}

/**
 * Writing lưu mỗi Part một lượt: lượt chấm nào làm đề đủ mọi Part thì sinh một điểm cả bài, gộp lượt chấm gần nhất của
 * từng Part (giống tổng ở trang xem bài). `attempts` là lượt Writing theo từng Part đã chấm.
 */
export function combineWritingScores(attempts: Attempt[], details: Map<string, AttemptDetails>) {
    const latestByExam = new Map<string, Map<number, Attempt>>();
    const scores: UserStats['fullTestScores'] = [];
    const byScoredAt = [...attempts].sort((a, b) => (a.scored_at ?? '').localeCompare(b.scored_at ?? ''));
    for (const attempt of byScoredAt) {
        const detail = details.get(attempt.id);
        if (attempt.part_template_id === null || !attempt.scored_at || !detail) continue;
        const latest = latestByExam.get(attempt.exam_id) ?? new Map<number, Attempt>();
        latestByExam.set(attempt.exam_id, latest.set(attempt.part_template_id, attempt));
        if (!detail.parts.every((part) => latest.has(part.part_template_id))) continue;

        const responses = [...latest.values()].flatMap((item) => details.get(item.id)?.responses ?? []);
        const { score } = summarizeWriting(detail.questions, responses);
        scores.push({ attempt_id: attempt.id, skill: 'writing', score, scored_at: attempt.scored_at });
    }
    return scores;
}

/** Thống kê từ bài làm của người dùng. Lượt của đề không còn trong `exams` bị bỏ qua. */
export async function loadUserStats(exams: Exam[], now = new Date()): Promise<UserStats> {
    const skillOf = new Map(exams.map((exam) => [exam.id, exam.skill]));
    const attempts = (await listAttempts()).filter((attempt) => skillOf.has(attempt.exam_id)).reverse();
    const scored = attempts.filter((attempt) => attempt.status === 'scored');
    const submitted = attempts.filter((attempt) => attempt.submitted_at !== null);
    // Có trong `skillOf` nhờ filter phía trên
    const skillOfAttempt = (attempt: Attempt) => skillOf.get(attempt.exam_id) as Skill;

    const details = await loadAttemptDetails(scored);
    const fullTestScores = [
        ...scored.flatMap((attempt) =>
            attempt.part_template_id === null && attempt.score !== null && attempt.scored_at
                ? [{ attempt_id: attempt.id, skill: skillOfAttempt(attempt), score: attempt.score, scored_at: attempt.scored_at }]
                : [],
        ),
        ...combineWritingScores(
            scored.filter((attempt) => skillOfAttempt(attempt) === 'writing'),
            details,
        ),
    ].sort((a, b) => a.scored_at.localeCompare(b.scored_at));

    const skillStats = (skill: Skill): UserSkillStats => {
        const latest = fullTestScores.filter((item) => item.skill === skill).at(-1);
        return {
            user_id: GUEST_USER_ID,
            skill,
            attempt_count: attempts.filter((attempt) => skillOfAttempt(attempt) === skill).length,
            scored_count: scored.filter((attempt) => skillOfAttempt(attempt) === skill).length,
            latest_score: latest?.score ?? null,
            latest_scored_at: latest?.scored_at ?? null,
            total_minutes: submitted
                .filter((attempt) => skillOfAttempt(attempt) === skill)
                .reduce((sum, attempt) => sum + attemptMinutes(attempt), 0),
        };
    };

    const partTotals = scoreParts(details.values());
    const parts: UserPartStats[] = PART_TEMPLATES.map((template) => {
        const total = partTotals.get(template.id);
        return {
            user_id: GUEST_USER_ID,
            part_template_id: template.id,
            // Lượt làm cả đề tính cho mọi Part của kỹ năng
            attempt_count: submitted.filter(
                (attempt) =>
                    attempt.part_template_id === template.id ||
                    (attempt.part_template_id === null && skillOfAttempt(attempt) === template.skill),
            ).length,
            avg_score_ratio: total && total.max > 0 ? total.score / total.max : null,
        };
    });

    const minutesByDay: Record<string, number> = {};
    for (const attempt of submitted) {
        // Có submitted_at nhờ filter `submitted`
        const key = toDayKey(new Date(attempt.submitted_at as string));
        minutesByDay[key] = (minutesByDay[key] ?? 0) + attemptMinutes(attempt);
    }
    const monthPrefix = toDayKey(now).slice(0, 7);
    const streaks = getStreaks(new Set(Object.keys(minutesByDay)), now);

    return {
        skills: { speaking: skillStats('speaking'), writing: skillStats('writing') },
        parts,
        study: {
            user_id: GUEST_USER_ID,
            streak_days: streaks.current,
            best_streak_days: streaks.best,
            minutes_this_month: Object.entries(minutesByDay)
                .filter(([key]) => key.startsWith(monthPrefix))
                .reduce((sum, [, minutes]) => sum + minutes, 0),
        },
        fullTestScores,
        minutesByDay,
    };
}
