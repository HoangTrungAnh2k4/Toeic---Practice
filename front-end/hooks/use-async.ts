'use client';

import { useCallback, useEffect, useState } from 'react';

export interface AsyncState<T> {
    /** `null` khi chưa tải xong lần nào. Lần tải lại lỗi vẫn giữ dữ liệu cũ. */
    data: T | null;
    failed: boolean;
    retry: () => void;
}

/**
 * Chạy `load` sau khi mount và mỗi khi `load` đổi; `load` phải ổn định (`useCallback` hoặc hàm module).
 * Dữ liệu khách nằm trong localStorage nên mọi chỗ đọc dữ liệu người dùng đều chạy ở client.
 */
export function useAsync<T>(load: () => Promise<T>): AsyncState<T> {
    const [data, setData] = useState<T | null>(null);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        load().then(
            (result) => {
                if (cancelled) return;
                setData(result);
                setFailed(false);
            },
            () => !cancelled && setFailed(true),
        );
        return () => {
            cancelled = true;
        };
    }, [load, attempt]);

    const retry = useCallback(() => {
        setFailed(false);
        setAttempt((n) => n + 1);
    }, []);

    return { data, failed, retry };
}

/** Gộp nhiều nguồn cho một màn: lỗi nếu có nguồn lỗi, thử lại chỉ các nguồn lỗi. */
export function combineAsync(...states: AsyncState<unknown>[]) {
    return {
        failed: states.some((state) => state.failed),
        retry: () => states.forEach((state) => state.failed && state.retry()),
    };
}
