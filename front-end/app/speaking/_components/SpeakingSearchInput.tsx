'use client';

import { LuSearch } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSpeakingParam } from '../_lib/useSpeakingParam';
import { SpeakingQuery } from '../types';

interface SpeakingSearchInputProps {
    query: SpeakingQuery;
    className?: string;
}

export default function SpeakingSearchInput({ query, className }: SpeakingSearchInputProps) {
    const { value, setValue, isPending } = useSpeakingParam(query, 'searchQuery');

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
                aria-label="Tìm kiếm đề Speaking"
                placeholder="Tìm theo mã đề (ETS SP-09), chủ đề (Office, Travel)..."
                className="bg-sub1/50 focus-visible:bg-white pl-9 border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 h-10 text-main md:text-xs placeholder:text-sub2"
            />
        </div>
    );
}
