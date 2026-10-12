import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { MistakeQuery } from '../types';
import { buildMistakesHref } from './searchParams';

/**
 * Bind một field của MistakeQuery với URL.
 * - `value` cập nhật ngay (optimistic) trong lúc server render lại kết quả.
 * - `isPending` dùng cho `data-pending` để làm mờ danh sách qua `group-has-data-pending:`.
 */
export function useMistakesParam<K extends keyof MistakeQuery>(query: MistakeQuery, key: K) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [value, setOptimisticValue] = useOptimistic(query[key]);

    const setValue = (next: MistakeQuery[K]) => {
        startTransition(() => {
            setOptimisticValue(next);
            router.replace(buildMistakesHref(query, { [key]: next }), { scroll: false });
        });
    };

    return { value, setValue, isPending };
}
