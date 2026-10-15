import { HistoryQuery, Option } from '../types';
import {
    CATEGORY_OPTIONS,
    DATE_SCOPE_OPTIONS,
    MODE_OPTIONS,
    PAGE_SIZE_OPTIONS,
    SKILL_OPTIONS,
    STATUS_OPTIONS,
} from '../utils';

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const HISTORY_PATH = '/setting/history';

export const DEFAULT_HISTORY_QUERY: HistoryQuery = {
    skill: 'all',
    searchQuery: '',
    mode: 'all',
    category: 'all',
    status: 'all',
    dateScope: 'all',
    page: 1,
    pageSize: 10,
};

/** Tên param trên URL cho từng field của query. */
const PARAM_KEYS = {
    skill: 'skill',
    searchQuery: 'q',
    mode: 'mode',
    category: 'category',
    status: 'status',
    dateScope: 'range',
    page: 'page',
    pageSize: 'size',
} as const satisfies Record<keyof HistoryQuery, string>;

const QUERY_KEYS = Object.keys(PARAM_KEYS) as (keyof HistoryQuery)[];

function pickOption<T extends string | number>(raw: string | undefined, options: Option<T>[], fallback: T): T {
    return options.find((option) => String(option.value) === raw)?.value ?? fallback;
}

function toPositiveInt(raw: string | undefined, fallback: number) {
    const value = Number(raw);
    return Number.isInteger(value) && value > 0 ? value : fallback;
}

/** Đọc & validate search params; giá trị không hợp lệ sẽ rơi về mặc định. */
export function parseHistoryQuery(raw: RawSearchParams): HistoryQuery {
    const get = (key: keyof HistoryQuery) => {
        const value = raw[PARAM_KEYS[key]];
        return Array.isArray(value) ? value[0] : value;
    };
    const defaults = DEFAULT_HISTORY_QUERY;

    return {
        skill: pickOption(get('skill'), SKILL_OPTIONS, defaults.skill),
        searchQuery: get('searchQuery') ?? defaults.searchQuery,
        mode: pickOption(get('mode'), MODE_OPTIONS, defaults.mode),
        category: pickOption(get('category'), CATEGORY_OPTIONS, defaults.category),
        status: pickOption(get('status'), STATUS_OPTIONS, defaults.status),
        dateScope: pickOption(get('dateScope'), DATE_SCOPE_OPTIONS, defaults.dateScope),
        page: toPositiveInt(get('page'), defaults.page),
        pageSize: pickOption(get('pageSize'), PAGE_SIZE_OPTIONS, defaults.pageSize),
    };
}

/**
 * Tạo URL mới từ query hiện tại + phần thay đổi.
 * Mọi thay đổi bộ lọc đều quay về trang 1, trừ khi `patch` chỉ định `page`.
 * Giá trị trùng mặc định được lược khỏi URL cho gọn.
 */
export function buildHistoryHref(query: HistoryQuery, patch: Partial<HistoryQuery> = {}) {
    const next: HistoryQuery = { ...query, page: 1, ...patch };
    const params = new URLSearchParams();

    for (const key of QUERY_KEYS) {
        if (next[key] !== DEFAULT_HISTORY_QUERY[key]) {
            params.set(PARAM_KEYS[key], String(next[key]));
        }
    }

    const search = params.toString();
    return search ? `${HISTORY_PATH}?${search}` : HISTORY_PATH;
}
