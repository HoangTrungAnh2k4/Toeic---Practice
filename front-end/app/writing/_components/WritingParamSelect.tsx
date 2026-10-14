'use client';

import { cn } from '@/lib/utils';
import { useWritingParam } from '../_lib/useWritingParam';
import { Option, WritingQuery } from '../types';

interface WritingParamSelectProps<K extends keyof WritingQuery> {
    query: WritingQuery;
    name: K;
    options: Option<WritingQuery[K]>[];
    label: string;
    className?: string;
}

/** Native select gắn với một field trên URL — client island cho các bộ lọc dạng dropdown. */
export default function WritingParamSelect<K extends keyof WritingQuery>({
    query,
    name,
    options,
    label,
    className,
}: WritingParamSelectProps<K>) {
    const { value, setValue, isPending } = useWritingParam(query, name);

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
