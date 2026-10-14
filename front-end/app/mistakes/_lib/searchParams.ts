import { MistakeQuery, Option } from '../types';
import { CRITERION_OPTIONS, MISTAKES_PATH, SKILL_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from '../utils';

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Mặc định chỉ hiện lỗi chưa khắc phục — sổ lỗi phục vụ việc sửa, không phải lưu trữ. */
export const DEFAULT_MISTAKE_QUERY: MistakeQuery = {
    skill: 'all',
    status: 'open',
    criterion: 'all',
    sort: 'priority',
    searchQuery: '',
};

/** Tên param trên URL cho từng field của query. */
const PARAM_KEYS = {
    skill: 'skill',
    status: 'status',
    criterion: 'criterion',
    sort: 'sort',
    searchQuery: 'q',
} as const satisfies Record<keyof MistakeQuery, string>;

const QUERY_KEYS = Object.keys(PARAM_KEYS) as (keyof MistakeQuery)[];

function pickOption<T extends string>(raw: string | undefined, options: Option<T>[], fallback: T): T {
    return options.find((option) => option.value === raw)?.value ?? fallback;
}

/** Đọc & validate search params; giá trị không hợp lệ sẽ rơi về mặc định. */
export function parseMistakeQuery(raw: RawSearchParams): MistakeQuery {
    const get = (key: keyof MistakeQuery) => {
        const value = raw[PARAM_KEYS[key]];
        return Array.isArray(value) ? value[0] : value;
    };
    const defaults = DEFAULT_MISTAKE_QUERY;

    return {
        skill: pickOption(get('skill'), SKILL_OPTIONS, defaults.skill),
        status: pickOption(get('status'), STATUS_OPTIONS, defaults.status),
        criterion: pickOption(get('criterion'), CRITERION_OPTIONS, defaults.criterion),
        sort: pickOption(get('sort'), SORT_OPTIONS, defaults.sort),
        searchQuery: get('searchQuery') ?? defaults.searchQuery,
    };
}

/** Tạo URL mới từ query hiện tại + phần thay đổi; giá trị trùng mặc định được lược khỏi URL. */
export function buildMistakesHref(query: MistakeQuery, patch: Partial<MistakeQuery> = {}) {
    const next: MistakeQuery = { ...query, ...patch };
    const params = new URLSearchParams();

    for (const key of QUERY_KEYS) {
        if (next[key] !== DEFAULT_MISTAKE_QUERY[key]) {
            params.set(PARAM_KEYS[key], next[key]);
        }
    }

    const search = params.toString();
    return search ? `${MISTAKES_PATH}?${search}` : MISTAKES_PATH;
}
