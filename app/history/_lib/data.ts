import { CategoryFilterType, HistoryAttempt, HistoryAttemptPage, HistoryQuery, SkillType, StatusFilterType } from '../types';
import { isRetakeAttempt, MOCK_ATTEMPTS } from '../utils';

type AttemptMatcher = (attempt: HistoryAttempt) => boolean;

const STATUS_MATCHERS: Record<Exclude<StatusFilterType, 'all'>, AttemptMatcher> = {
    completed: (attempt) => !attempt.isPendingRow && !attempt.isWarningRow,
    scoring: (attempt) => Boolean(attempt.scoreInfo.isScoring),
    sync_pending: (attempt) => attempt.storage === 'sync_pending',
    interrupted: (attempt) => Boolean(attempt.scoreInfo.isInterrupted),
};

const CATEGORY_MATCHERS: Record<Exclude<CategoryFilterType, 'all'>, AttemptMatcher> = {
    fresh: (attempt) => attempt.categoryBadge.includes('chưa gặp'),
    retake: isRetakeAttempt,
    sample_viewed: (attempt) => Boolean(attempt.hasSampleViewed),
    independent: (attempt) => !attempt.hasSampleViewed,
};

function matchesQuery(attempt: HistoryAttempt, { skill, searchQuery, mode, status, category }: HistoryQuery) {
    const keyword = searchQuery.trim().toLowerCase();

    return (
        (skill === 'all' || attempt.skill === skill) &&
        (mode === 'all' || attempt.modeType === mode) &&
        (status === 'all' || STATUS_MATCHERS[status](attempt)) &&
        (category === 'all' || CATEGORY_MATCHERS[category](attempt)) &&
        (!keyword || [attempt.code, attempt.title, attempt.topic].some((field) => field.toLowerCase().includes(keyword)))
    );
}

// TODO: thay MOCK_ATTEMPTS bằng API/DB thật; giữ nguyên signature để component không phải đổi.
export async function getHistoryAttempts(query: HistoryQuery): Promise<HistoryAttemptPage> {
    const filtered = MOCK_ATTEMPTS.filter((attempt) => matchesQuery(attempt, query));
    const totalPages = Math.max(1, Math.ceil(filtered.length / query.pageSize));
    const page = Math.min(query.page, totalPages);
    const start = (page - 1) * query.pageSize;

    return {
        items: filtered.slice(start, start + query.pageSize),
        total: filtered.length,
        page,
        totalPages,
    };
}

export async function getSkillCounts(): Promise<Record<SkillType, number>> {
    const counts: Record<SkillType, number> = { all: MOCK_ATTEMPTS.length, speaking: 0, writing: 0, full_mock: 0 };
    for (const attempt of MOCK_ATTEMPTS) counts[attempt.skill] += 1;
    return counts;
}
