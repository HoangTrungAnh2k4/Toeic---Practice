import Link from 'next/link';
import { LuArrowDownRight, LuArrowLeft } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LandingHeroVisual from './LandingHeroVisual';

/** Một từ sai bị gạch, chữ sửa viết tay nổi phía trên. */
export function Fix({ wrong, right, className }: { wrong: string; right: string; className?: string }) {
    return (
        <span className="inline-block relative">
            <del className="decoration-2 decoration-sub3">{wrong}</del>
            <ins
                className={cn(
                    '-top-7 left-1/2 absolute text-sub3 text-2xl no-underline whitespace-nowrap -rotate-3 -translate-x-1/2',
                    className,
                )}
            >
                {right}
            </ins>
        </span>
    );
}

const TAGS = [
    { label: 'Thì quá khứ, lặp lại 7 lần', tone: 'bg-sub3 text-main' },
    { label: 'Mạo từ, lặp lại 9 lần', tone: 'bg-white text-[#333]' },
    { label: 'Đã thêm vào sổ lỗi', tone: 'bg-success text-black' },
];

export default function LandingMistakesHero() {
    return (
        <section
            aria-labelledby="hero-title"
            className="items-center gap-12 grid lg:grid-cols-2 mx-auto py-4 max-w-300"
        >
            <div data-reveal className="flex flex-col items-start gap-8 min-w-0">
                <div className="flex flex-col gap-3">
                    <h1
                        id="hero-title"
                        className="font-bold text-white text-5xl sm:text-7xl leading-[1.05] tracking-tight motion-safe:animate-rise"
                    >
                        Biết mình
                        <br />
                        <span className="inline-block bg-sub3 mt-2 mr-1 px-3 rounded-lg text-main -rotate-2">
                            sai
                        </span>{' '}
                        ở đâu<span className="text-success">.</span>
                    </h1>
                </div>

                <figure className="relative bg-black/80 px-5 pt-9 pb-5 border-2 border-black rounded-xl w-full motion-safe:animate-rise motion-safe:[animation-delay:200ms]">
                    <figcaption className="-top-3.5 left-5 absolute bg-white px-2.5 py-0.5 border-2 border-black rounded-md font-semibold text-[#333] text-xs">
                        Bài Writing của bạn, Part 2
                    </figcaption>
                    <p className="pt-2 text-white text-xl sm:text-2xl">
                        Yesterday I <Fix wrong="go" right="went" /> to <Fix wrong="office" right="the office" /> by bus
                        and <Fix wrong="meet" right="met" /> my manager.
                    </p>
                    <ul className="flex flex-wrap gap-2 mt-3">
                        {TAGS.map(({ label, tone }) => (
                            <li key={label} className={cn('px-2 py-0.5 pt-0.5 border-2 border-black rounded-md font-semibold text-xs', tone)}>
                                {label}
                            </li>
                        ))}
                    </ul>
                </figure>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    <Link href="/speaking" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'gap-2')}>
                        Vào phòng thi ngay
                    </Link>
                    <p className="flex items-center gap-2 text-white text-xl">
                        <LuArrowLeft aria-hidden="true" className="size-5" />
                        không cần đăng ký
                    </p>
                </div>
            </div>

            <LandingHeroVisual />
        </section>
    );
}
