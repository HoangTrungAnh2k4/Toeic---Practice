import { TestStatusFilterType, WritingQuery, WritingTabType, WritingTest, WritingTestPage } from '../types';
import { MOCK_WRITING_TESTS, PAGE_SIZE } from '../utils';

type TestMatcher = (test: WritingTest) => boolean;

const TAB_MATCHERS: Record<WritingTabType, TestMatcher> = {
    all: () => true,
    cbt: (test) => test.isCbt,
    by_part: (test) => test.supportsPartPractice,
    retake: (test) => test.kind === 'attempted',
    bookmark: (test) => test.isBookmarked,
};

const STATUS_MATCHERS: Record<Exclude<TestStatusFilterType, 'all'>, TestMatcher> = {
    not_started: (test) => test.kind === 'fresh' || test.kind === 'guided',
    in_progress: (test) => test.kind === 'in_progress',
    completed: (test) => test.kind === 'attempted',
};

function matchesQuery(test: WritingTest, { tab, searchQuery, target, status, topic }: WritingQuery) {
    const keyword = searchQuery.trim().toLowerCase();
    const searchable = [test.code, test.title, ...('tags' in test ? test.tags : [])];

    return (
        TAB_MATCHERS[tab](test) &&
        (target === 'all' || test.target === target) &&
        (status === 'all' || STATUS_MATCHERS[status](test)) &&
        (topic === 'all' || test.topic === topic) &&
        (!keyword || searchable.some((field) => field.toLowerCase().includes(keyword)))
    );
}

// TODO: thay MOCK_WRITING_TESTS bằng API/DB thật; giữ nguyên signature để component không phải đổi.
export async function getWritingTests(query: WritingQuery): Promise<WritingTestPage> {
    const filtered = MOCK_WRITING_TESTS.filter((test) => matchesQuery(test, query));
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const page = Math.min(query.page, totalPages);
    const start = (page - 1) * PAGE_SIZE;

    return {
        items: filtered.slice(start, start + PAGE_SIZE),
        total: filtered.length,
        page,
        totalPages,
    };
}

export async function getTabCounts(): Promise<Record<WritingTabType, number>> {
    const entries = Object.entries(TAB_MATCHERS).map(([tab, matcher]) => [
        tab,
        MOCK_WRITING_TESTS.filter(matcher).length,
    ]);
    return Object.fromEntries(entries) as Record<WritingTabType, number>;
}
