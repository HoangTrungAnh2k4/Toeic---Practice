'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

/** shadcn Select gắn với một field trên URL — client island cho các bộ lọc dạng dropdown. */
export default function MistakesParamSelect<K extends SelectableKey>({
    query,
    name,
    options,
    label,
    className,
}: MistakesParamSelectProps<K>) {
    const { value, setValue, isPending } = useMistakesParam(query, name);

    const items = options.map((option) => ({ value: String(option.value), label: option.label }));

    return (
        <Select
            items={items}
            value={value}
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
