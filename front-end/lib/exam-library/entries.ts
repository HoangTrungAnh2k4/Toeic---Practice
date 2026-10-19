import type { Attempt } from '@/lib/domain/types';
import { PAGE_SIZE } from './options';
import type {
    ExamSummary,
    LibraryEntry,
    LibraryQuery,
    LibraryTab,
    TargetFilter,
    UserExamState,
} from './types';

export const EMPTY_USER_STATE: UserExamState = {
    progress: 'not_started',
    completedCount: 0,
    inProgress: null,
    answeredCount: 0,
    lastCompleted: null,
    bookmarked: false,
};

const isCompleted = (attempt: Attempt) => ['submitted', 'scoring', 'scored'].includes(attempt.status);

/**
 * Gom attempt theo đề. `attempts` sắp mới nhất trước; `answeredByAttempt` là số câu đã trả lời của từng attempt.
 * Lượt bị gián đoạn không tính là đã làm cũng không tính là đang làm dở.
 */
export function buildUserStates(
    attempts: Attempt[],
    bookmarkedIds: string[],
    answeredByAttempt: Map<string, number>,
): Map<string, UserExamState> {
    const states = new Map<string, UserExamState>();
    const stateOf = (examId: string) => {
        const state = states.get(examId) ?? { ...EMPTY_USER_STATE };
        states.set(examId, state);
        return state;
    };

    for (const attempt of attempts) {
        const state = stateOf(attempt.exam_id);
        // Duyệt mới → cũ: lượt dở dang cũ hơn một lượt đã nộp coi như đã bỏ
        if (attempt.status === 'in_progress' && !state.inProgress && state.completedCount === 0) {
            state.inProgress = attempt;
            state.answeredCount = answeredByAttempt.get(attempt.id) ?? 0;
        } else if (isCompleted(attempt)) {
            state.completedCount += 1;
            state.lastCompleted ??= attempt;
        }
    }

    for (const examId of bookmarkedIds) stateOf(examId).bookmarked = true;

    for (const state of states.values()) {
        state.progress = state.inProgress ? 'in_progress' : state.completedCount > 0 ? 'completed' : 'not_started';
    }
    return states;
}

export function toEntries(exams: ExamSummary[], states: Map<string, UserExamState>): LibraryEntry[] {
    return exams.map((exam) => ({ exam, user: states.get(exam.id) ?? EMPTY_USER_STATE }));
}

const TAB_MATCHERS: Record<LibraryTab, (entry: LibraryEntry) => boolean> = {
    all: () => true,
    retake: (entry) => entry.user.completedCount > 0,
    bookmark: (entry) => entry.user.bookmarked,
};

const TARGET_MATCHERS: Record<Exclude<TargetFilter, 'all'>, (level: number) => boolean> = {
    level_5: (level) => level <= 5,
    level_6_7: (level) => level >= 6 && level <= 7,
    level_8: (level) => level >= 8,
};

export function countTabs(entries: LibraryEntry[]): Record<LibraryTab, number> {
    return {
        all: entries.length,
        retake: entries.filter(TAB_MATCHERS.retake).length,
        bookmark: entries.filter(TAB_MATCHERS.bookmark).length,
    };
}

export function filterEntries(entries: LibraryEntry[], { tab, searchQuery, target, status, topic }: LibraryQuery) {
    const keyword = searchQuery.trim().toLowerCase();

    return entries.filter(({ exam, user }) => {
        if (!TAB_MATCHERS[tab]({ exam, user })) return false;
        if (target !== 'all' && (exam.target_level === null || !TARGET_MATCHERS[target](exam.target_level))) {
            return false;
        }
        if (status !== 'all' && user.progress !== status) return false;
        if (topic !== 'all' && exam.topic !== topic) return false;
        if (!keyword) return true;
        return [exam.code, exam.title].some((field) => field.toLowerCase().includes(keyword));
    });
}

export function paginate<T>(items: T[], page: number) {
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const current = Math.min(page, totalPages);
    const start = (current - 1) * PAGE_SIZE;
    return { items: items.slice(start, start + PAGE_SIZE), total: items.length, page: current, totalPages };
}

/** Đề gợi ý: đề chưa làm đầu tiên theo thứ tự hiển thị. */
export function pickRecommended(entries: LibraryEntry[]): LibraryEntry | undefined {
    return entries.find((entry) => entry.user.progress === 'not_started');
}

/** Bản sao `states` với đề `examId` đổi cờ đánh dấu; giữ nguyên các đề khác. */
export function withBookmark(states: Map<string, UserExamState>, examId: string, bookmarked: boolean) {
    const next = new Map(states);
    next.set(examId, { ...(states.get(examId) ?? EMPTY_USER_STATE), bookmarked });
    return next;
}
