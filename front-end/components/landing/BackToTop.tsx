'use client';

import { useEffect, useState } from 'react';
import { LuArrowUp } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Nút nổi góc phải, hiện khi đã cuộn quá một màn hình, bấm để lên đầu trang. */
export default function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > window.innerHeight);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTop = () => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    };

    return (
        <button
            type="button"
            onClick={scrollTop}
            aria-label="Lên đầu trang"
            tabIndex={visible ? 0 : -1}
            className={cn(
                buttonVariants({ variant: 'primary', size: 'md' }),
                'right-4 sm:right-8 bottom-12 z-40 fixed px-0 size-11',
                visible ? 'motion-safe:animate-rise' : 'invisible opacity-0',
            )}
        >
            <LuArrowUp aria-hidden="true" className="size-5" />
        </button>
    );
}
