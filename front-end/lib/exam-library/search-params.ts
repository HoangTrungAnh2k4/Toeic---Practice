import type { AttemptMode, Skill } from '@/lib/domain/types';
import { STATUS_OPTIONS, TAB_OPTIONS, TOPIC_OPTIONS } from './options';
import type { LibraryQuery, Option } from './types';

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Id của khu vực danh sách đề, dùng làm anchor khi chuyển trang. */
export const LIBRARY_SECTION_ID = 'exam-library';

export const DEFAULT_LIBRARY_QUERY: LibraryQuery = {
    tab: 'all',
    searchQuery: '',
    status: 'all',
    topic: 'all',
    page: 1,
};

/** Tên param trên URL cho từng field của query. */
const PARAM_KEYS = {
    tab: 'tab',
    searchQuery: 'q',
    status: 'status',
    topic: 'topic',
    page: 'page',
} as const satisfies Record<keyof LibraryQuery, string>;

const QUERY_KEYS = Object.keys(PARAM_KEYS) as (keyof LibraryQuery)[];

function pickOption<T extends string | number>(raw: string | undefined, options: Option<T>[], fallback: T): T {
    return options.find((option) => String(option.value) === raw)?.value ?? fallback;
}

function toPositiveInt(raw: string | undefined, fallback: number) {
    const value = Number(raw);
    return Number.isInteger(value) && value > 0 ? value : fallback;
}

/** Đọc & validate search params; giá trị không hợp lệ sẽ rơi về mặc định. */
export function parseLibraryQuery(raw: RawSearchParams): LibraryQuery {
    const get = (key: keyof LibraryQuery) => {
        const value = raw[PARAM_KEYS[key]];
        return Array.isArray(value) ? value[0] : value;
    };
    const defaults = DEFAULT_LIBRARY_QUERY;

    return {
        tab: pickOption(get('tab'), TAB_OPTIONS, defaults.tab),
        searchQuery: get('searchQuery') ?? defaults.searchQuery,
        status: pickOption(get('status'), STATUS_OPTIONS, defaults.status),
        topic: pickOption(get('topic'), TOPIC_OPTIONS, defaults.topic),
        page: toPositiveInt(get('page'), defaults.page),
    };
}

/**
 * Tạo URL thư viện đề từ query hiện tại + phần thay đổi.
 * Mọi thay đổi bộ lọc đều quay về trang 1, trừ khi `patch` chỉ định `page`.
 * Giá trị trùng mặc định được lược khỏi URL cho gọn.
 */
export function buildLibraryHref(skill: Skill, query: LibraryQuery, patch: Partial<LibraryQuery> = {}) {
    const next: LibraryQuery = { ...query, page: 1, ...patch };
    const params = new URLSearchParams();

    for (const key of QUERY_KEYS) {
        if (next[key] !== DEFAULT_LIBRARY_QUERY[key]) {
            params.set(PARAM_KEYS[key], String(next[key]));
        }
    }

    const search = params.toString();
    return search ? `/${skill}?${search}` : `/${skill}`;
}

/** Link vào phòng thi của đề; bỏ trống `mode` = thi thử chuẩn CBT, bỏ trống `partTemplateId` = Part đầu tiên. */
export function buildTestHref(skill: Skill, examId: string, mode?: AttemptMode, partTemplateId?: number | null) {
    const params = new URLSearchParams({ id: examId });
    if (mode) params.set('mode', mode);
    if (partTemplateId) params.set('part', String(partTemplateId));
    return `/${skill}/test?${params}`;
}
