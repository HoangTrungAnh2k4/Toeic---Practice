import { describe, expect, it } from 'vitest';
import { EMPTY_USER_STATE, withBookmark } from './entries';

describe('withBookmark', () => {
    it('đổi cờ của đề đã có trạng thái, giữ nguyên tiến độ và không sửa map cũ', () => {
        const states = new Map([['a', { ...EMPTY_USER_STATE, completedCount: 2 }]]);
        const next = withBookmark(states, 'a', true);

        expect(next.get('a')).toEqual({ ...EMPTY_USER_STATE, completedCount: 2, bookmarked: true });
        expect(states.get('a')?.bookmarked).toBe(false);
    });

    it('tạo trạng thái rỗng cho đề chưa có trong map', () => {
        const next = withBookmark(new Map(), 'b', true);
        expect(next.get('b')).toEqual({ ...EMPTY_USER_STATE, bookmarked: true });
    });
});
