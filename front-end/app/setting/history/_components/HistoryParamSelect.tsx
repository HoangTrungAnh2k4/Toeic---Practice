'use client';

import { cn } from '@/lib/utils';
import { useHistoryParam } from '../_lib/useHistoryParam';
import { HistoryQuery, Option } from '../types';

interface HistoryParamSelectProps<K extends keyof HistoryQuery> {
    query: HistoryQuery;
    name: K;
    options: Option<HistoryQuery[K]>[];
    label: string;
    className?: string;
}

/** Native select gắn với một field trên URL — client island duy nhất cho các bộ lọc dạng dropdown. */
export default function HistoryParamSelect<K extends keyof HistoryQuery>({
    query,
    name,
    options,
    label,
    className,
}: HistoryParamSelectProps<K>) {
    const { value, setValue, isPending } = useHistoryParam(query, name);

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
