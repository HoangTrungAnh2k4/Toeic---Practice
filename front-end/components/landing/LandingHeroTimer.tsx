'use client';

import { useEffect, useState } from 'react';

// Khớp với animate-countdown (60s) và delay -18s của thanh thời gian trong LandingHero
const TOTAL = 60;
const START = 42;

/** Đồng hồ đếm ngược trang trí, lặp lại mỗi 60s. */
export default function LandingHeroTimer() {
    const [left, setLeft] = useState(START);

    useEffect(() => {
        const id = setInterval(() => setLeft((s) => (s <= 0 ? TOTAL - 1 : s - 1)), 1000);
        return () => clearInterval(id);
    }, []);

    return <b className="font-mono font-bold text-main text-2xl">0:{String(left).padStart(2, '0')}</b>;
}
