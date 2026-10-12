'use client';

import { cn } from '@/lib/utils';
import { useSpeakingParam } from '../_lib/useSpeakingParam';
import { Option, SpeakingQuery } from '../types';

interface SpeakingParamSelectProps<K extends keyof SpeakingQuery> {
    query: SpeakingQuery;
    name: K;
    options: Option<SpeakingQuery[K]>[];
    label: string;
    className?: string;
}

/** Native select gắn với một field trên URL — client island cho các bộ lọc dạng dropdown. */
export default function SpeakingParamSelect<K extends keyof SpeakingQuery>({
    query,
    name,
    options,
    label,
    className,
}: SpeakingParamSelectProps<K>) {
    const { value, setValue, isPending } = useSpeakingParam(query, name);

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
