import { useEffect, useState } from 'react';

/**
 * Đếm ngược tới mốc `endsAt` (ms). Tính theo đồng hồ thật nên không lệch khi tab bị throttle.
 * `endsAt` là `null` (không giới hạn giờ) → trả về `null`.
 */
export function useCountdown(endsAt: number | null) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (endsAt === null) return;
        const timer = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(timer);
    }, [endsAt]);

    return endsAt === null ? null : Math.max(0, Math.ceil((endsAt - now) / 1000));
}
