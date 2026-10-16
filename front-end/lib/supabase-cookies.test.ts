import { describe, expect, it } from 'vitest';
import { sessionCookieOptions } from './supabase-cookies';

const options = { path: '/', maxAge: 400 * 24 * 3600, sameSite: 'lax' as const };

describe('sessionCookieOptions', () => {
    it('giữ hạn cookie khi ghi nhớ đăng nhập', () => {
        expect(sessionCookieOptions(true, 'token', options)).toEqual(options);
    });

    it('bỏ hạn để thành cookie phiên khi không ghi nhớ', () => {
        expect(sessionCookieOptions(false, 'token', options)).toEqual({ path: '/', sameSite: 'lax' });
    });

    it('vẫn xoá được cookie khi không ghi nhớ', () => {
        expect(sessionCookieOptions(false, '', { ...options, maxAge: 0 }).maxAge).toBe(0);
    });
});
