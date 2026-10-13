import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProfileStat } from '../types';
import { PROFILE_CARD_CLASS } from '../utils';

interface ProfileStatGridProps {
    stats: ProfileStat[];
}

export default function ProfileStatGrid({ stats }: ProfileStatGridProps) {
    return (
        <section aria-label="Chỉ số học tập">
            <dl className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ id, label, value, unit, hint, Icon }) => (
                    <Card key={id} className={cn(PROFILE_CARD_CLASS, 'gap-2 p-5')}>
                        <div className="flex justify-between items-center gap-3">
                            <dt className="font-medium text-subText text-sm">{label}</dt>
                            <span className="flex justify-center items-center bg-sub1 rounded-lg size-9 text-main shrink-0">
                                <Icon className="size-4" aria-hidden="true" />
                            </span>
                        </div>
                        <dd className="flex flex-col gap-1">
                            <span className="flex items-baseline gap-1.5 text-main">
                                <span className="font-bold text-3xl tracking-tight">{value}</span>
                                {unit && <span className="font-medium text-sm">{unit}</span>}
                            </span>
                            <span className="font-medium text-subText text-xs">{hint}</span>
                        </dd>
                    </Card>
                ))}
            </dl>
        </section>
    );
}
