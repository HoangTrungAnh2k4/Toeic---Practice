import { describe, expect, it, vi } from 'vitest';
import { combineAsync } from './use-async';

const state = (failed: boolean) => ({ data: null, failed, retry: vi.fn() });

describe('combineAsync', () => {
    it('lỗi khi có một nguồn lỗi, thử lại chỉ nguồn lỗi', () => {
        const ok = state(false);
        const broken = state(true);
        const combined = combineAsync(ok, broken);

        expect(combined.failed).toBe(true);
        combined.retry();
        expect(broken.retry).toHaveBeenCalledOnce();
        expect(ok.retry).not.toHaveBeenCalled();
    });

    it('không lỗi khi mọi nguồn đều ổn', () => {
        expect(combineAsync(state(false), state(false)).failed).toBe(false);
    });
});
