'use client';

import { cn } from '@/lib/utils';
import type { Skill } from '@/lib/domain/types';
import type { LibraryQuery, Option } from '@/lib/exam-library/types';
import { useLibraryParam } from '@/lib/exam-library/use-library-param';

interface LibraryParamSelectProps<K extends keyof LibraryQuery> {
    skill: Skill;
    query: LibraryQuery;
    name: K;
    options: Option<LibraryQuery[K]>[];
    label: string;
    className?: string;
}

/** Native select gắn với một field trên URL — client island cho các bộ lọc dạng dropdown. */
export function LibraryParamSelect<K extends keyof LibraryQuery>({
    skill,
    query,
    name,
    options,
    label,
    className,
}: LibraryParamSelectProps<K>) {
    const { value, setValue, isPending } = useLibraryParam(skill, query, name);

    return (
        <select
            value={String(value)}
            onChange={(e) => {
                const option = options.find((item) => String(item.value) === e.target.value);
                if (option) setValue(option.value);
            }}
            aria-label={label}
            data-pending={isPending ? '' : undefined}
            className={cn('cursor-pointer focus:outline-none focus:ring-2 focus:ring-sub3/60', className)}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
