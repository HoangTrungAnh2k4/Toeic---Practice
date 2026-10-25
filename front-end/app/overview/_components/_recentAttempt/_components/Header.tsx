import { LuHistory } from 'react-icons/lu';
import type { SkillType } from '@/app/setting/history/types';
import { SegmentedTabs } from '@/components/segmented-tabs';

interface HeaderProps {
    filter: SkillType;
    setFilter: (filter: SkillType) => void;
    counts: Record<SkillType, number>;
    limit: number;
}

const TABS: { value: SkillType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'speaking', label: 'Speaking' },
    { value: 'writing', label: 'Writing' },
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

            <SegmentedTabs options={TABS} value={filter} onChange={setFilter} counts={counts} ariaLabel="Lọc theo kỹ năng" />
        </div>
    );
}
