'use client';

import { LuSearch } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Skill } from '@/lib/domain/types';
import type { LibraryQuery } from '@/lib/exam-library/types';
import { useLibraryParam } from '@/lib/exam-library/use-library-param';
import { SKILL_COPY } from './skill-copy';

interface LibrarySearchInputProps {
    skill: Skill;
    query: LibraryQuery;
    className?: string;
}

export function LibrarySearchInput({ skill, query, className }: LibrarySearchInputProps) {
    const { value, setValue, isPending } = useLibraryParam(skill, query, 'searchQuery');
    const copy = SKILL_COPY[skill];

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
                aria-label={`Tìm kiếm đề ${copy.label}`}
                placeholder={copy.searchPlaceholder}
                className="bg-sub1/50 focus-visible:bg-white pl-9 border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 h-10 text-main md:text-xs placeholder:text-sub2"
            />
        </div>
    );
}
