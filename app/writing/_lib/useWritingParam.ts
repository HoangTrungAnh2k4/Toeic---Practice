import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { WritingQuery } from '../types';
import { buildWritingHref } from './searchParams';

/**
 * Bind một field của WritingQuery với URL.
 * - `value` cập nhật ngay (optimistic) trong lúc server render lại kết quả.
 * - `isPending` dùng cho `data-pending` để làm mờ danh sách qua `group-has-data-pending:`.
 */
export function useWritingParam<K extends keyof WritingQuery>(query: WritingQuery, key: K) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [value, setOptimisticValue] = useOptimistic(query[key]);

    const setValue = (next: WritingQuery[K]) => {
        startTransition(() => {
            setOptimisticValue(next);
            router.replace(buildWritingHref(query, { [key]: next }), { scroll: false });
        });
    };

    return { value, setValue, isPending };
}
