import { cn } from '@/lib/utils';

type FrequencyMeterProps = {
    hit: number;
    total: number;
};

export default function FrequencyMeter({ hit, total }: FrequencyMeterProps) {
    return (
        <div className="flex items-center gap-2" role="img" aria-label={`Lỗi xuất hiện ${hit} trên ${total} bài`}>
            <div className="flex gap-0.5">
                {Array.from({ length: total }).map((_, i) => (
                    <span key={i} className={cn('h-1.5 w-4 rounded-full', i < hit ? 'bg-sub3' : 'bg-sub2/30')} />
                ))}
            </div>
            <span className="font-semibold text-[0.6875rem] text-main tracking-wider">
                {hit}/{total} bài
            </span>
        </div>
    );
}
