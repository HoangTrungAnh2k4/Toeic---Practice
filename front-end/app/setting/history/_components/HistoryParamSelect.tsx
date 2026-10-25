'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

/** shadcn Select gắn với một field trên URL — client island duy nhất cho các bộ lọc dạng dropdown. */
export default function HistoryParamSelect<K extends keyof HistoryQuery>({
    query,
    name,
    options,
    label,
    className,
}: HistoryParamSelectProps<K>) {
    const { value, setValue, isPending } = useHistoryParam(query, name);

    const items = options.map((option) => ({ value: String(option.value), label: option.label }));

    return (
        <Select
            items={items}
            value={String(value)}
            onValueChange={(next) => {
                const option = options.find((item) => String(item.value) === next);
                if (option) setValue(option.value);
            }}
        >
            <SelectTrigger
                aria-label={label}
                data-pending={isPending ? '' : undefined}
                className={cn('cursor-pointer focus-visible:ring-2 focus-visible:ring-sub3/60', className)}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {items.map((item) => (
                    <SelectItem key={item.value} value={item.value} className="text-xs">
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
