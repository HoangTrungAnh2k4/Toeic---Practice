import { formatDateTime, getAttemptCode } from '@/app/setting/history/utils';
import { listExamParts, listQuestions } from '@/lib/data/content';
import { listAnnotations, listAttempts, listResponses } from '@/lib/data/user-data';
import { getPartTemplates, PART_TEMPLATES } from '@/lib/domain/parts';
import type { Annotation, Attempt, MistakePattern, Skill } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import {
    Criterion,
    MistakeCheck,
    MistakeDefinition,
    MistakeDetail,
    MistakeEvidence,
    MistakeItem,
    MistakeQuery,
    MistakeStatus,
    MistakeSummary,
} from '../types';
import { RESOLVE_STREAK, SEVERITY_META, WINDOW_SIZE } from '../utils';

/** Một lượt đã chấm kèm các Part đã trả lời và lỗi được ghi nhận. */
interface ScoredAttempt {
    attempt: Attempt;
    exam: ExamSummary;
    /** `part_template_id` của các câu có câu trả lời. */
    answeredParts: Set<number>;
    findings: { annotation: Annotation; question: number }[];
}

/** Dữ liệu đầu vào của sổ lỗi, đọc từ bài làm của người dùng. */
export interface MistakeBookInput {
    /** Mới nhất trước. */
    scored: ScoredAttempt[];
    pendingCount: number;
    interruptedCount: number;
}

interface ComputedMistake {
    item: MistakeItem;
    window: MistakeCheck[];
    evidence: MistakeEvidence[];
    /** Vị trí bài gặp lỗi gần nhất trong lịch sử (0 = mới nhất) — dùng để sắp xếp. */
    lastSeenRank: number;
}

/** Sổ lỗi đã tính: mỗi mẫu lỗi kèm trạng thái của người dùng (logic của view `user_mistake_stats`). */
export interface MistakeBook {
    mistakes: ComputedMistake[];
    input: MistakeBookInput;
}

const hasAnswer = (r: { text_answer: string | null; transcript: string | null; audio_path: string | null }) =>
    Boolean(r.text_answer?.trim() || r.transcript?.trim() || r.audio_path);

async function loadScoredAttempt(attempt: Attempt, exam: ExamSummary): Promise<ScoredAttempt> {
    const [responses, parts, questions] = await Promise.all([
        listResponses(attempt.id),
        listExamParts(exam.id),
        listQuestions(exam.id),
    ]);
    const annotations = await listAnnotations(responses.map((response) => response.id));
    const partTemplateOf = new Map(parts.map((part) => [part.id, part.part_template_id]));
    const questionById = new Map(questions.map((question) => [question.id, question]));
    const responseById = new Map(responses.map((response) => [response.id, response]));

    const answeredParts = new Set<number>();
    for (const response of responses) {
        const question = questionById.get(response.question_id);
        const partTemplateId = question && partTemplateOf.get(question.exam_part_id);
        if (partTemplateId !== undefined && hasAnswer(response)) answeredParts.add(partTemplateId);
    }

    const findings = annotations.flatMap((annotation) => {
        const response = responseById.get(annotation.response_id);
        const question = response && questionById.get(response.question_id);
        return question ? [{ annotation, question: question.number }] : [];
    });
    return { attempt, exam, answeredParts, findings };
}

/** Đọc bài làm của người dùng; chỉ bài đã chấm mới vào thống kê lỗi. Lượt của đề không còn trong `exams` bị bỏ qua. */
export async function loadMistakeBookInput(exams: ExamSummary[]): Promise<MistakeBookInput> {
    const examById = new Map(exams.map((exam) => [exam.id, exam]));
    const attempts = (await listAttempts()).filter((attempt) => examById.has(attempt.exam_id));
    const scored = await Promise.all(
        attempts
            .filter((attempt) => attempt.status === 'scored')
            // Có trong `examById` nhờ filter phía trên
            .map((attempt) => loadScoredAttempt(attempt, examById.get(attempt.exam_id) as ExamSummary)),
    );

    return {
        scored,
        pendingCount: attempts.filter((a) => a.status === 'submitted' || a.status === 'scoring').length,
        interruptedCount: attempts.filter((a) => a.status === 'interrupted').length,
    };
}

function toDefinition(pattern: MistakePattern): MistakeDefinition {
    const template = PART_TEMPLATES.find((part) => part.id === pattern.part_template_id);
    if (template) {
        const range = template.q_from === template.q_to ? `${template.q_from}` : `${template.q_from}-${template.q_to}`;
        return { ...pattern, partLabel: `Q${range}`, task: template.task };
    }
    const lastQuestion = Math.max(...getPartTemplates(pattern.skill).map((part) => part.q_to));
    const skillLabel = pattern.skill === 'speaking' ? 'Speaking' : 'Writing';
    return { ...pattern, partLabel: `Q1-${lastQuestion}`, task: `Toàn bài ${skillLabel}` };
}

/** Bài được tính cho một mẫu lỗi khi cùng kỹ năng và có trả lời ít nhất một câu thuộc phạm vi của lỗi. */
function isInScope({ exam, answeredParts }: ScoredAttempt, def: MistakeDefinition) {
    if (exam.skill !== def.skill) return false;
    return def.part_template_id === null ? answeredParts.size > 0 : answeredParts.has(def.part_template_id);
}

function getEvidence({ attempt, exam, findings }: ScoredAttempt, mistakeId: string): MistakeEvidence[] {
    return findings
        .filter(({ annotation }) => annotation.mistake_pattern_id === mistakeId)
        .map(({ annotation, question }) => ({
            attemptId: attempt.id,
            code: getAttemptCode(attempt),
            attemptTitle: exam.title,
            submittedAt: formatDateTime(attempt.submitted_at ?? attempt.started_at),
            assisted: attempt.sample_viewed,
            question,
            annotation,
        }));
}

/**
 * Bài có trợ giúp (xem bài mẫu) bị bỏ qua khi đếm chuỗi "không lặp lại":
 * làm đúng nhờ xem mẫu chưa chứng minh được đã tự khắc phục.
 */
function getCleanStreak(window: MistakeCheck[]) {
    let streak = 0;
    for (const check of window) {
        if (check.hit) break;
        if (!check.assisted) streak += 1;
    }
    return streak;
}

function getStatus(cleanStreak: number): MistakeStatus {
    if (cleanStreak >= RESOLVE_STREAK) return 'resolved';
    return cleanStreak > 0 ? 'improving' : 'active';
}

/**
 * Điểm ưu tiên = mức ảnh hưởng × tỉ lệ lặp lại × hệ số trạng thái × độ tin cậy dữ liệu.
 * Lỗi mới thấy ở 1-2 bài bị giảm độ tin cậy để không lấn át lỗi đã lặp lại nhiều lần.
 */
function getPriority(def: MistakeDefinition, status: MistakeStatus, hit: number, total: number) {
    if (status === 'resolved' || total === 0) return 0;
    const statusFactor = status === 'active' ? 1 : 0.5;
    const confidence = Math.min(total, 3) / 3;
    return SEVERITY_META[def.severity].weight * (hit / total) * statusFactor * confidence;
}

function computeMistake(def: MistakeDefinition, { scored }: MistakeBookInput): ComputedMistake {
    const window: MistakeCheck[] = scored
        .filter((item) => isInScope(item, def))
        .slice(0, WINDOW_SIZE)
        .map((item) => ({
            attemptId: item.attempt.id,
            code: getAttemptCode(item.attempt),
            title: item.exam.title,
            submittedAt: formatDateTime(item.attempt.submitted_at ?? item.attempt.started_at),
            hit: getEvidence(item, def.id).length > 0,
            assisted: item.attempt.sample_viewed,
        }));

    const evidence = scored.flatMap((item) => getEvidence(item, def.id));
    const lastSeenRank = scored.findIndex(({ attempt }) => evidence.some((e) => e.attemptId === attempt.id));
    const lastSeen = evidence.find((e) => e.attemptId === scored[lastSeenRank]?.attempt.id);

    const hit = window.filter((check) => check.hit).length;
    const cleanStreak = getCleanStreak(window);
    const status = getStatus(cleanStreak);

    return {
        item: {
            ...def,
            status,
            frequency: { hit, total: window.length },
            cleanStreak,
            occurrenceCount: evidence.length,
            lastSeen: lastSeen && { attemptId: lastSeen.attemptId, code: lastSeen.code, submittedAt: lastSeen.submittedAt },
            priority: getPriority(def, status, hit, window.length),
        },
        window,
        evidence,
        lastSeenRank: lastSeenRank < 0 ? Number.MAX_SAFE_INTEGER : lastSeenRank,
    };
}

export function buildMistakeBook(patterns: MistakePattern[], input: MistakeBookInput): MistakeBook {
    return { mistakes: patterns.map((pattern) => computeMistake(toDefinition(pattern), input)), input };
}

const byPriority = (a: ComputedMistake, b: ComputedMistake) =>
    b.item.priority - a.item.priority ||
    b.item.frequency.hit - a.item.frequency.hit ||
    a.lastSeenRank - b.lastSeenRank;

const SORTERS: Record<MistakeQuery['sort'], (a: ComputedMistake, b: ComputedMistake) => number> = {
    priority: byPriority,
    frequency: (a, b) => {
        const rate = (m: ComputedMistake) => (m.item.frequency.total ? m.item.frequency.hit / m.item.frequency.total : 0);
        return rate(b) - rate(a) || b.item.frequency.hit - a.item.frequency.hit || byPriority(a, b);
    },
    recent: (a, b) => a.lastSeenRank - b.lastSeenRank || byPriority(a, b),
};

const isOpen = (status: MistakeStatus) => status !== 'resolved';

/** Mẫu lỗi người dùng đã thực sự gặp — sổ lỗi không liệt kê lỗi chưa từng mắc. */
const tracked = ({ mistakes }: MistakeBook) => mistakes.filter(({ item }) => item.occurrenceCount > 0);

function matchesQuery({ item }: ComputedMistake, { skill, status, criterion, searchQuery }: MistakeQuery) {
    const keyword = searchQuery.trim().toLowerCase();
    return (
        (skill === 'all' || item.skill === skill) &&
        (status === 'all' || (status === 'open' ? isOpen(item.status) : item.status === status)) &&
        (criterion === 'all' || item.criteria.includes(criterion)) &&
        (!keyword ||
            [item.title, item.summary, item.task, item.partLabel].some((field) => field.toLowerCase().includes(keyword)))
    );
}

export function getMistakes(book: MistakeBook, query: MistakeQuery): MistakeItem[] {
    return tracked(book)
        .filter((computed) => matchesQuery(computed, query))
        .sort(SORTERS[query.sort])
        .map(({ item }) => item);
}

/** Lỗi đang mở cần ưu tiên khắc phục nhất của kỹ năng — "Trọng tâm" ở overview và lịch học. */
export function getTopMistake(book: MistakeBook, skill: Skill): MistakeItem | null {
    const [top] = getMistakes(book, { skill, status: 'open', criterion: 'all', sort: 'priority', searchQuery: '' });
    return top ?? null;
}

export function getMistakeSummary(book: MistakeBook): MistakeSummary {
    const items = tracked(book).map(({ item }) => item);
    const byStatus: Record<MistakeStatus, number> = { active: 0, improving: 0, resolved: 0 };
    const criterionStats = new Map<Criterion, { count: number; hits: number }>();

    for (const item of items) {
        byStatus[item.status] += 1;
        if (!isOpen(item.status)) continue;
        for (const criterion of item.criteria) {
            const stat = criterionStats.get(criterion) ?? { count: 0, hits: 0 };
            criterionStats.set(criterion, { count: stat.count + 1, hits: stat.hits + item.frequency.hit });
        }
    }

    // Xếp theo số lần lặp lại thực tế, không chỉ số mẫu lỗi — tránh hoà điểm vô nghĩa
    const [weakest] = [...criterionStats.entries()].sort((a, b) => b[1].hits - a[1].hits || b[1].count - a[1].count);

    return {
        total: items.length,
        byStatus,
        bySkill: {
            all: items.length,
            speaking: items.filter((item) => item.skill === 'speaking').length,
            writing: items.filter((item) => item.skill === 'writing').length,
        },
        weakestCriterion: weakest && { criterion: weakest[0], ...weakest[1] },
        analyzedAttempts: book.input.scored.length,
        scoringAttempts: book.input.pendingCount,
        interruptedAttempts: book.input.interruptedCount,
    };
}

const sharesPart = (a: MistakeDefinition, b: MistakeDefinition) =>
    a.part_template_id === null || b.part_template_id === null || a.part_template_id === b.part_template_id;

/** Chi tiết một mẫu lỗi; `null` khi không có mẫu lỗi này. Mẫu chưa từng gặp vẫn xem được (cách khắc phục). */
export function getMistakeDetail(book: MistakeBook, id: string): MistakeDetail | null {
    const current = book.mistakes.find(({ item }) => item.id === id);
    if (!current) return null;

    const related = tracked(book)
        .filter(
            ({ item }) =>
                item.id !== id &&
                item.skill === current.item.skill &&
                (item.criteria.some((c) => current.item.criteria.includes(c)) || sharesPart(item, current.item)),
        )
        .sort(byPriority)
        .slice(0, 3)
        .map(({ item }) => item);

    return { ...current.item, window: current.window, evidence: current.evidence, related };
}

/** Tra cứu nhanh mẫu lỗi theo id — dùng để gắn nhãn nhận xét trong trang xem lại bài. */
export function getMistakeIndex(book: MistakeBook): Record<string, MistakeItem> {
    return Object.fromEntries(book.mistakes.map(({ item }) => [item.id, item]));
}
