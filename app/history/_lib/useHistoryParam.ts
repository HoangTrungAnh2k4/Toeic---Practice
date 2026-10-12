import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { HistoryQuery } from '../types';
import { buildHistoryHref } from './searchParams';

/**
 * Bind một field của HistoryQuery với URL.
 * - `value` cập nhật ngay (optimistic) trong lúc server render lại kết quả.
 * - `isPending` dùng cho `data-pending` để làm mờ bảng qua `group-has-data-pending:`.
 */
export function useHistoryParam<K extends keyof HistoryQuery>(query: HistoryQuery, key: K) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [value, setOptimisticValue] = useOptimistic(query[key]);

    const setValue = (next: HistoryQuery[K]) => {
        startTransition(() => {
            setOptimisticValue(next);
            router.replace(buildHistoryHref(query, { [key]: next }), { scroll: false });
        });
    };

    return { value, setValue, isPending };
}
