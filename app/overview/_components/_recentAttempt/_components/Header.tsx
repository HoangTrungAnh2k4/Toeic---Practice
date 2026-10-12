'use client';
import { SkillFilter, SKILL_META, ATTEMPTS } from '../types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MdHistory } from 'react-icons/md';
import { cn } from '@/lib/utils';
import { counts } from '../helpers';
import { useState } from 'react';

export default function Header() {
    const [filter, setFilter] = useState<SkillFilter>('all');
    const visibleAttempts = ATTEMPTS.filter((a) => {
        if (filter === 'speaking') return a.skills.includes('S');
        if (filter === 'writing') return a.skills.includes('W');
        return true;
    });

    return (
        <div className="flex sm:flex-row flex-col justify-between sm:items-end gap-3">
            <div className="flex items-start gap-3">
                <span className="flex justify-center items-center bg-[#E8E5F5] rounded-xl size-10 text-[#3C3454] shrink-0">
                    <MdHistory className="size-5" />
                </span>
                <div>
                    <h3 className="font-semibold text-[#3C3454] text-lg leading-6 tracking-tight">
                        Hoạt động gần đây
                        <span className="ml-1.5 font-normal text-[#8B84B8]">(Recent Attempts)</span>
                    </h3>
                    <p className="text-[#8B84B8] text-sm">
                        4 lượt làm gần nhất với dữ liệu chi tiết bài nộp và âm thanh lưu trữ
                    </p>
                </div>
            </div>

            {/* Tabs lọc kỹ năng */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as SkillFilter)}>
                <TabsList className="bg-[#E8E5F5] p-1 h-10">
                    {(
                        [
                            ['all', 'Tất cả'],
                            ['speaking', 'Speaking'],
                            ['writing', 'Writing'],
                        ] as const
                    ).map(([key, label]) => (
                        <TabsTrigger
                            key={key}
                            value={key}
                            className="gap-1.5 data-[state=active]:bg-[#3C3454] data-[state=active]:shadow-sm px-3 text-[#3C3454]/70 data-[state=active]:text-white"
                        >
                            {label}
                            <span
                                className={cn(
                                    'px-1.5 rounded-full font-semibold text-[0.6875rem] leading-4',
                                    filter === key ? 'bg-[#F5B841] text-[#3C3454]' : 'bg-white text-[#8B84B8]',
                                )}
                            >
                                {counts[key]}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}
