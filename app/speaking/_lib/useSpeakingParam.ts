import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { SpeakingQuery } from '../types';
import { buildSpeakingHref } from './searchParams';

/**
 * Bind một field của SpeakingQuery với URL.
 * - `value` cập nhật ngay (optimistic) trong lúc server render lại kết quả.
 * - `isPending` dùng cho `data-pending` để làm mờ danh sách qua `group-has-data-pending:`.
 */
export function useSpeakingParam<K extends keyof SpeakingQuery>(query: SpeakingQuery, key: K) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [value, setOptimisticValue] = useOptimistic(query[key]);

    const setValue = (next: SpeakingQuery[K]) => {
        startTransition(() => {
            setOptimisticValue(next);
            router.replace(buildSpeakingHref(query, { [key]: next }), { scroll: false });
        });
    };

    return { value, setValue, isPending };
}
