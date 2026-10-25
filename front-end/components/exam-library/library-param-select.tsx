'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

/** shadcn Select gắn với một field trên URL — client island cho các bộ lọc dạng dropdown. */
export function LibraryParamSelect<K extends keyof LibraryQuery>({
    skill,
    query,
    name,
    options,
    label,
    className,
}: LibraryParamSelectProps<K>) {
    const { value, setValue, isPending } = useLibraryParam(skill, query, name);

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
