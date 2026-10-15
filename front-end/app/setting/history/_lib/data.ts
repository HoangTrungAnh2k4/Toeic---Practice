import { listAttempts, listResponses } from '@/lib/data/user-data';
import { PART_TEMPLATES } from '@/lib/domain/parts';
import type { Attempt, Skill } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import {
    CategoryFilterType,
    DateScopeType,
    HistoryKpis,
    HistoryQuery,
    HistoryRow,
    HistoryRowPage,
    SkillType,
} from '../types';
import { getAttemptCode, STATUS_GROUP } from '../utils';

const DAY_MS = 24 * 60 * 60 * 1000;

function countQuestions(attempt: Attempt, exam: ExamSummary) {
    const template = PART_TEMPLATES.find((part) => part.id === attempt.part_template_id);
    return template ? template.q_to - template.q_from + 1 : exam.questionCount;
}

/**
 * Lượt làm của người dùng kèm đề, mới nhất trước. Lượt của đề không còn trong `exams` bị bỏ qua.
 * Chỉ đếm câu đã trả lời cho lượt chưa nộp (đang làm, gián đoạn) vì chỉ chúng cần hiển thị tiến độ.
 */
export async function loadHistoryRows(exams: ExamSummary[]): Promise<HistoryRow[]> {
    const examById = new Map(exams.map((exam) => [exam.id, exam]));
    const attempts = (await listAttempts()).filter((attempt) => examById.has(attempt.exam_id));

    // Duyệt cũ → mới để đánh số lần làm và so điểm với lượt đã chấm liền trước của cùng đề
    const seen = new Map<string, { count: number; lastScore: number | null }>();
    const derived = new Map<string, { attemptNo: number; scoreDelta: number | null }>();
    for (const attempt of [...attempts].reverse()) {
        const prev = seen.get(attempt.exam_id) ?? { count: 0, lastScore: null };
        const score = attempt.status === 'scored' ? attempt.score : null;
        derived.set(attempt.id, {
            attemptNo: prev.count + 1,
            scoreDelta: score !== null && prev.lastScore !== null ? score - prev.lastScore : null,
        });
        seen.set(attempt.exam_id, { count: prev.count + 1, lastScore: score ?? prev.lastScore });
    }

    return Promise.all(
        attempts.map(async (attempt) => {
            // Có trong `examById` nhờ filter phía trên
            const exam = examById.get(attempt.exam_id) as ExamSummary;
            const isOpen = attempt.status === 'in_progress' || attempt.status === 'interrupted';
            const responses = isOpen ? await listResponses(attempt.id) : [];
            return {
                attempt,
                exam,
                ...(derived.get(attempt.id) ?? { attemptNo: 1, scoreDelta: null }),
                questionCount: countQuestions(attempt, exam),
                answeredCount: responses.filter((r) => r.text_answer?.trim() || r.audio_path).length,
            };
        }),
    );
}

const CATEGORY_MATCHERS: Record<Exclude<CategoryFilterType, 'all'>, (row: HistoryRow) => boolean> = {
    fresh: (row) => row.attemptNo === 1,
    retake: (row) => row.attemptNo > 1,
    sample_viewed: (row) => row.attempt.sample_viewed,
    independent: (row) => !row.attempt.sample_viewed,
};

function isInDateScope(iso: string, scope: DateScopeType, now: Date) {
    const time = Date.parse(iso);
    if (scope === '7d') return now.getTime() - time <= 7 * DAY_MS;
    if (scope === '30d') return now.getTime() - time <= 30 * DAY_MS;
    if (scope === 'this_month') {
        const date = new Date(time);
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }
    return true;
}

function matchesQuery(row: HistoryRow, { skill, searchQuery, mode, status, category, dateScope }: HistoryQuery, now: Date) {
    const { attempt, exam } = row;
    const keyword = searchQuery.trim().toLowerCase();
    return (
        (skill === 'all' || exam.skill === skill) &&
        (mode === 'all' || attempt.mode === mode) &&
        (status === 'all' || STATUS_GROUP[attempt.status] === status) &&
        (category === 'all' || CATEGORY_MATCHERS[category](row)) &&
        isInDateScope(attempt.started_at, dateScope, now) &&
        (!keyword ||
            [getAttemptCode(attempt), exam.code, exam.title].some((field) => field.toLowerCase().includes(keyword)))
    );
}

export function filterHistoryRows(rows: HistoryRow[], query: HistoryQuery, now = new Date()): HistoryRowPage {
    const filtered = rows.filter((row) => matchesQuery(row, query, now));
    const totalPages = Math.max(1, Math.ceil(filtered.length / query.pageSize));
    const page = Math.min(query.page, totalPages);
    const start = (page - 1) * query.pageSize;
    return { items: filtered.slice(start, start + query.pageSize), total: filtered.length, page, totalPages };
}

export function countSkills(rows: HistoryRow[]): Record<SkillType, number> {
    const counts: Record<SkillType, number> = { all: rows.length, speaking: 0, writing: 0 };
    for (const row of rows) counts[row.exam.skill] += 1;
    return counts;
}

const average = (values: number[]) =>
    values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;

export function getHistoryKpis(rows: HistoryRow[], now = new Date()): HistoryKpis {
    const scoresOf = (skill: Skill) =>
        rows.flatMap(({ attempt, exam }) =>
            exam.skill === skill && attempt.status === 'scored' && attempt.score !== null ? [attempt.score] : [],
        );
    const groupCount = (group: string) => rows.filter((row) => STATUS_GROUP[row.attempt.status] === group).length;
    const submitted = rows.filter((row) => row.attempt.submitted_at !== null);
    const counts = countSkills(rows);

    return {
        total: rows.length,
        thisWeek: rows.filter((row) => isInDateScope(row.attempt.started_at, '7d', now)).length,
        bySkill: { speaking: counts.speaking, writing: counts.writing },
        avgScore: { speaking: average(scoresOf('speaking')), writing: average(scoresOf('writing')) },
        independent: {
            count: submitted.filter((row) => !row.attempt.sample_viewed).length,
            total: submitted.length,
        },
        pendingCount: groupCount('pending'),
        inProgressCount: groupCount('in_progress'),
        interruptedCount: groupCount('interrupted'),
    };
}
