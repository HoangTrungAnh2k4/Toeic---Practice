'use client';

import { cn } from '@/lib/utils';
import { useMistakesParam } from '../_lib/useMistakesParam';
import { MistakeQuery, Option } from '../types';

type SelectableKey = 'criterion' | 'sort';

interface MistakesParamSelectProps<K extends SelectableKey> {
    query: MistakeQuery;
    name: K;
    options: Option<MistakeQuery[K]>[];
    label: string;
    className?: string;
}

/** Native select gắn với một field trên URL — client island cho các bộ lọc dạng dropdown. */
export default function MistakesParamSelect<K extends SelectableKey>({
    query,
    name,
    options,
    label,
    className,
}: MistakesParamSelectProps<K>) {
    const { value, setValue, isPending } = useMistakesParam(query, name);

    return (
        <select
            value={value}
            onChange={(e) => {
                const option = options.find((item) => item.value === e.target.value);
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
