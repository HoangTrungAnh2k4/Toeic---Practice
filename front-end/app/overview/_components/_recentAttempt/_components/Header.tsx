import { LuHistory } from 'react-icons/lu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SkillType } from '@/app/setting/history/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
    filter: SkillType;
    setFilter: (filter: SkillType) => void;
    counts: Record<SkillType, number>;
    limit: number;
}

const TABS: [SkillType, string][] = [
    ['all', 'All'],
    ['speaking', 'Speaking'],
    ['writing', 'Writing'],
];

export default function Header({ filter, setFilter, counts, limit }: HeaderProps) {
    return (
        <div className="flex sm:flex-row flex-col justify-between sm:items-end gap-3">
            <div className="flex items-start gap-3">
                <LuHistory className="size-8 text-sub3" aria-hidden="true" />
                <div>
                    <h3 className="font-semibold text-main text-lg leading-6 tracking-wide">Hoạt động gần đây</h3>
                    <p className="font-medium text-subText text-sm">{limit} lượt làm bài gần nhất của bạn</p>
                </div>
            </div>

            {/* Tabs lọc kỹ năng */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as SkillType)}>
                <TabsList className="gap-1 bg-main p-1 h-10">
                    {TABS.map(([key, label]) => (
                        <TabsTrigger
                            key={key}
                            value={key}
                            className="gap-2 hover:bg-white/20 data-active:bg-sub3 dark:data-active:bg-sub3 data-active:shadow-sm px-1.5 text-white hover:text-white data-active:text-main dark:data-active:text-main duration-200 cursor-pointer"
                        >
                            {label}
                            <span
                                className={cn(
                                    'px-1.5 rounded-full font-semibold text-[0.6875rem] leading-4',
                                    filter === key ? 'bg-main text-sub1' : 'bg-white text-main',
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
