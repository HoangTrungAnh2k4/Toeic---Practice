import { cn } from '@/lib/utils';

type FrequencyMeterProps = {
    hit: number;
    total: number;
    className?: string;
};

/** Số bài lặp lại lỗi trên số bài gần nhất có làm dạng câu đó. */
export function FrequencyMeter({ hit, total, className }: FrequencyMeterProps) {
    if (total === 0) {
        return <span className={cn('font-semibold text-[0.6875rem] text-subText', className)}>Chưa đủ dữ liệu</span>;
    }

    return (
        <div
            className={cn('flex items-center gap-2', className)}
            role="img"
            aria-label={`Lỗi lặp lại ở ${hit} trên ${total} bài gần nhất`}
        >
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
