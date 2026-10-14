import { useEffect, useState } from 'react';

/** Đếm ngược tới mốc `endsAt` (ms). Tính theo đồng hồ thật nên không lệch khi tab bị throttle. */
export function useCountdown(endsAt: number) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(timer);
    }, []);

    return Math.max(0, Math.ceil((endsAt - now) / 1000));
}
