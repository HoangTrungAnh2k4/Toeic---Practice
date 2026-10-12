export default function FrequencyMeter({ hit, total }: { hit: number; total: number }) {
    return (
        <div className="flex items-center gap-2" role="img" aria-label={`Lỗi xuất hiện ${hit} trên ${total} bài`}>
            <div className="flex gap-0.5">
                {Array.from({ length: total }).map((_, i) => (
                    <span
                        key={i}
                        className={`h-1.5 w-4 rounded-full ${i < hit ? 'bg-[#F5B841]' : 'bg-[#8B84B8]/30'}`}
                    />
                ))}
            </div>
            <span className="font-semibold text-[#3C3454] text-[0.6875rem] tracking-wider">
                {hit}/{total} bài
            </span>
        </div>
    );
}
