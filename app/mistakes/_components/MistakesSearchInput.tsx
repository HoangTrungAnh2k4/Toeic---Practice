'use client';

import { LuSearch } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMistakesParam } from '../_lib/useMistakesParam';
import { MistakeQuery } from '../types';

interface MistakesSearchInputProps {
    query: MistakeQuery;
    className?: string;
}

export default function MistakesSearchInput({ query, className }: MistakesSearchInputProps) {
    const { value, setValue, isPending } = useMistakesParam(query, 'searchQuery');

    return (
        <div className={cn('relative', className)} data-pending={isPending ? '' : undefined}>
            <LuSearch
                className="top-1/2 left-3 absolute size-4 text-sub2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
            />
            <Input
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-label="Tìm kiếm lỗi"
                placeholder="Tìm theo tên lỗi, dạng câu (vd: email, picture, Q11)..."
                className="bg-sub1/50 focus-visible:bg-card pl-9 border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 h-10 text-main md:text-xs placeholder:text-sub2"
            />
        </div>
    );
}
