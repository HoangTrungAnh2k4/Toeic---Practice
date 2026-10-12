import { SkillFilter, ATTEMPTS } from '../types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MdHistory } from 'react-icons/md';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export default function Header({
    filter: filter,
    setFilter: setFilter,
}: {
    filter: SkillFilter;
    setFilter: (filter: SkillFilter) => void;
}) {
    const counts = useMemo(
        () => ({
            all: ATTEMPTS.length,
            speaking: ATTEMPTS.filter((a) => a.skills.includes('S')).length,
            writing: ATTEMPTS.filter((a) => a.skills.includes('W')).length,
        }),
        [],
    );
    return (
        <div className="flex sm:flex-row flex-col justify-between sm:items-end gap-3">
            <div className="flex items-start gap-3">
                <MdHistory size={32} className="text-sub3" />
                <div>
                    <h3 className="font-semibold text-main text-lg leading-6 tracking-wide">Hoạt động gần đây</h3>
                    <p className="font-medium text-subText text-sm">
                        4 lượt làm gần nhất với dữ liệu chi tiết bài nộp và âm thanh lưu trữ
                    </p>
                </div>
            </div>

            {/* Tabs lọc kỹ năng */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as SkillFilter)}>
                <TabsList className="gap-1 bg-main p-1 h-10">
                    {(
                        [
                            ['all', 'All'],
                            ['speaking', 'Speaking'],
                            ['writing', 'Writing'],
                        ] as const
                    ).map(([key, label]) => (
                        <TabsTrigger
                            key={key}
                            value={key}
                            className="gap-2 data-[state=active]:bg-main hover:bg-white/20 data-[state=active]:shadow-sm px-1.5 text-white data-[state=active]:text-white hover:text-white duration-200 cursor-pointer"
                        >
                            {label}
                            <span
                                className={cn(
                                    'px-1.5 rounded-full font-semibold text-[0.6875rem] leading-4',
                                    filter === key ? 'bg-sub3 text-main' : 'bg-white text-[#333]',
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
