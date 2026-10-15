'use client';

import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import type { Skill } from '@/lib/domain/types';
import { buildLibraryHref } from './search-params';
import type { LibraryQuery } from './types';

/**
 * Bind một field của LibraryQuery với URL.
 * - `value` cập nhật ngay (optimistic) trong lúc router chuyển URL.
 * - `isPending` dùng cho `data-pending` để làm mờ danh sách qua `group-has-data-pending:`.
 */
export function useLibraryParam<K extends keyof LibraryQuery>(skill: Skill, query: LibraryQuery, key: K) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [value, setOptimisticValue] = useOptimistic(query[key]);

    const setValue = (next: LibraryQuery[K]) => {
        startTransition(() => {
            setOptimisticValue(next);
            router.replace(buildLibraryHref(skill, query, { [key]: next }), { scroll: false });
        });
    };

    return { value, setValue, isPending };
}
