import { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

const BAR_COUNT = 28;

const BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
    // Tạo hình quả trám nhẹ: các cột ở hai đầu hơi thấp hơn ở giữa để nhìn tự nhiên hơn
    const edgeFactor = Math.sin(((i + 1) / (BAR_COUNT + 1)) * Math.PI); // 0.1 -> 1 -> 0.1
    const baseMax = 45 + ((i * 293) % 55); // 45% -> 100%

    const hMax = Math.max(30, Math.round(baseMax * (0.4 + 0.6 * edgeFactor)));
    const hMid = Math.max(24, Math.round(hMax * (0.55 + ((i * 137) % 30) / 100)));
    const hLow = Math.max(18, Math.round(hMax * (0.25 + ((i * 73) % 20) / 100)));

    return {
        '--h-max': `${hMax}%`,
        '--h-mid': `${hMid}%`,
        '--h-low': `${hLow}%`,
        // Tốc độ nhanh hơn (550ms - 1150ms) để bám sát nhịp nói thật
        animationDuration: `${550 + ((i * 537) % 600)}ms`,
        animationDelay: `-${(i * 541) % 1500}ms`,
    } as CSSProperties;
});

/** Sóng âm trang trí khi đang ghi âm (landing). */
export default function VoiceWave({ className }: { className?: string }) {
    return (
        <div aria-hidden="true" className={cn('flex justify-between items-center gap-1.5 h-10', className)}>
            {BARS.map((style, i) => (
                <span
                    key={i}
                    style={style}
                    className="flex-1 bg-main rounded-full max-w-[8px] min-h-[8px] motion-safe:animate-voice-wave"
                />
            ))}
        </div>
    );
}
