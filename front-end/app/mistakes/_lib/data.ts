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
import { MOCK_MISTAKES } from './mock';
import { HistoryAttempt, MOCK_ATTEMPTS } from './mock-attempts';
import { MOCK_REVIEWS } from './mock-reviews';

/** Bài đang chấm hoặc bị gián đoạn chưa có nhận xét → không được tính vào thống kê lỗi. */
function isScored(attempt: HistoryAttempt) {
    const { score, isScoring, isInterrupted } = attempt.scoreInfo;
    return score !== undefined && !isScoring && !isInterrupted;
}

/** Bài được tính cho một mẫu lỗi khi đã chấm, cùng kỹ năng và có làm ít nhất một câu thuộc phạm vi của lỗi. */
function isInScope(attempt: HistoryAttempt, def: MistakeDefinition) {
    if (!isScored(attempt) || attempt.skill !== def.skill) return false;
    return (MOCK_REVIEWS[attempt.id] ?? []).some((q) => def.questions.includes(q.number));
}

function getEvidence(attempt: HistoryAttempt, mistakeId: string): MistakeEvidence[] {
    return (MOCK_REVIEWS[attempt.id] ?? []).flatMap((question) =>
        question.annotations
            .filter((annotation) => annotation.mistakeId === mistakeId)
            .map((annotation) => ({
                attemptId: attempt.id,
                code: attempt.code,
                attemptTitle: attempt.title,
                submittedAt: attempt.submittedAt,
                assisted: Boolean(attempt.hasSampleViewed),
                question: question.number,
                annotation,
            })),
    );
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

interface ComputedMistake {
    item: MistakeItem;
    window: MistakeCheck[];
    evidence: MistakeEvidence[];
    /** Vị trí bài gặp lỗi gần nhất trong lịch sử (0 = mới nhất) — dùng để sắp xếp. */
    lastSeenRank: number;
}

function computeMistake(def: MistakeDefinition): ComputedMistake {
    const window: MistakeCheck[] = MOCK_ATTEMPTS.filter((attempt) => isInScope(attempt, def))
        .slice(0, WINDOW_SIZE)
        .map((attempt) => ({
            attemptId: attempt.id,
            code: attempt.code,
            title: attempt.title,
            submittedAt: attempt.submittedAt,
            hit: getEvidence(attempt, def.id).length > 0,
            assisted: Boolean(attempt.hasSampleViewed),
        }));

    const evidence = MOCK_ATTEMPTS.flatMap((attempt) => getEvidence(attempt, def.id));
    const lastSeenRank = MOCK_ATTEMPTS.findIndex((attempt) => evidence.some((e) => e.attemptId === attempt.id));
    const lastSeenAttempt = MOCK_ATTEMPTS[lastSeenRank];

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
            lastSeen: lastSeenAttempt && {
                attemptId: lastSeenAttempt.id,
                code: lastSeenAttempt.code,
                submittedAt: lastSeenAttempt.submittedAt,
            },
            priority: getPriority(def, status, hit, window.length),
        },
        window,
        evidence,
        lastSeenRank: lastSeenRank < 0 ? Number.MAX_SAFE_INTEGER : lastSeenRank,
    };
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

function computeAll() {
    return MOCK_MISTAKES.map(computeMistake);
}

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

// TODO: thay bằng API sổ lỗi; giữ nguyên signature để component không phải đổi.
export async function getMistakes(query: MistakeQuery): Promise<MistakeItem[]> {
    return computeAll()
        .filter((computed) => matchesQuery(computed, query))
        .sort(SORTERS[query.sort])
        .map(({ item }) => item);
}

export async function getMistakeSummary(): Promise<MistakeSummary> {
    const items = computeAll().map(({ item }) => item);
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
        analyzedAttempts: MOCK_ATTEMPTS.filter(isScored).length,
        scoringAttempts: MOCK_ATTEMPTS.filter((attempt) => attempt.scoreInfo.isScoring).length,
        interruptedAttempts: MOCK_ATTEMPTS.filter((attempt) => attempt.scoreInfo.isInterrupted).length,
    };
}

export async function getMistakeDetail(id: string): Promise<MistakeDetail | null> {
    const all = computeAll();
    const current = all.find(({ item }) => item.id === id);
    if (!current) return null;

    const related = all
        .filter(
            ({ item }) =>
                item.id !== id &&
                item.skill === current.item.skill &&
                (item.criteria.some((c) => current.item.criteria.includes(c)) ||
                    item.questions.some((q) => current.item.questions.includes(q))),
        )
        .sort(byPriority)
        .slice(0, 3)
        .map(({ item }) => item);

    return { ...current.item, window: current.window, evidence: current.evidence, related };
}

/** Các lỗi cần khắc phục có độ ưu tiên cao nhất — dùng cho Overview. */
export async function getPriorityMistakes(limit: number) {
    const open = computeAll()
        .filter(({ item }) => isOpen(item.status))
        .sort(byPriority);

    return {
        items: open.slice(0, limit).map(({ item }) => item),
        openCount: open.length,
        analyzedAttempts: MOCK_ATTEMPTS.filter(isScored).length,
    };
}

/** Tra cứu nhanh mẫu lỗi theo id — dùng để gắn nhãn nhận xét trong trang xem lại bài. */
export async function getMistakeIndex(): Promise<Record<string, MistakeItem>> {
    return Object.fromEntries(computeAll().map(({ item }) => [item.id, item]));
}
