import { Option, SpeakingQuery } from '../types';
import { STATUS_OPTIONS, TAB_OPTIONS, TARGET_OPTIONS, TOPIC_OPTIONS } from '../utils';

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const SPEAKING_PATH = '/speaking';

/** Id của khu vực danh sách đề, dùng làm anchor khi chuyển trang. */
export const SPEAKING_LIBRARY_ID = 'speaking-library';

export const DEFAULT_SPEAKING_QUERY: SpeakingQuery = {
    tab: 'all',
    searchQuery: '',
    target: 'all',
    status: 'all',
    topic: 'all',
    page: 1,
};

/** Tên param trên URL cho từng field của query. */
const PARAM_KEYS = {
    tab: 'tab',
    searchQuery: 'q',
    target: 'target',
    status: 'status',
    topic: 'topic',
    page: 'page',
} as const satisfies Record<keyof SpeakingQuery, string>;

const QUERY_KEYS = Object.keys(PARAM_KEYS) as (keyof SpeakingQuery)[];

function pickOption<T extends string | number>(raw: string | undefined, options: Option<T>[], fallback: T): T {
    return options.find((option) => String(option.value) === raw)?.value ?? fallback;
}

function toPositiveInt(raw: string | undefined, fallback: number) {
    const value = Number(raw);
    return Number.isInteger(value) && value > 0 ? value : fallback;
}

/** Đọc & validate search params; giá trị không hợp lệ sẽ rơi về mặc định. */
export function parseSpeakingQuery(raw: RawSearchParams): SpeakingQuery {
    const get = (key: keyof SpeakingQuery) => {
        const value = raw[PARAM_KEYS[key]];
        return Array.isArray(value) ? value[0] : value;
    };
    const defaults = DEFAULT_SPEAKING_QUERY;

    return {
        tab: pickOption(get('tab'), TAB_OPTIONS, defaults.tab),
        searchQuery: get('searchQuery') ?? defaults.searchQuery,
        target: pickOption(get('target'), TARGET_OPTIONS, defaults.target),
        status: pickOption(get('status'), STATUS_OPTIONS, defaults.status),
        topic: pickOption(get('topic'), TOPIC_OPTIONS, defaults.topic),
        page: toPositiveInt(get('page'), defaults.page),
    };
}

/**
 * Tạo URL mới từ query hiện tại + phần thay đổi.
 * Mọi thay đổi bộ lọc đều quay về trang 1, trừ khi `patch` chỉ định `page`.
 * Giá trị trùng mặc định được lược khỏi URL cho gọn.
 */
export function buildSpeakingHref(query: SpeakingQuery, patch: Partial<SpeakingQuery> = {}) {
    const next: SpeakingQuery = { ...query, page: 1, ...patch };
    const params = new URLSearchParams();

    for (const key of QUERY_KEYS) {
        if (next[key] !== DEFAULT_SPEAKING_QUERY[key]) {
            params.set(PARAM_KEYS[key], String(next[key]));
        }
    }

    const search = params.toString();
    return search ? `${SPEAKING_PATH}?${search}` : SPEAKING_PATH;
}
