import type { IconType } from 'react-icons';
import { LuBookCheck, LuGraduationCap, LuMic, LuPenLine } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type Highlight = {
    icon: IconType;
    title: string;
    detail: string;
    /** Màu ô icon + độ nghiêng của thẻ. */
    tone: string;
    tilt: string;
};

const HIGHLIGHTS: Highlight[] = [
    {
        icon: LuMic,
        title: 'TOEIC Speaking',
        detail: '11 câu trong 20 phút, sát format ETS',
        tone: 'bg-sub3 text-black',
        tilt: 'sm:-rotate-2',
    },
    {
        icon: LuPenLine,
        title: 'TOEIC Writing',
        detail: '8 câu trong 60 phút, chấm theo tiêu chí',
        tone: 'bg-sub2 text-white',
        tilt: 'sm:rotate-1 sm:translate-y-2.5',
    },
    {
        icon: LuBookCheck,
        title: 'Sổ lỗi cá nhân',
        detail: 'Chỉ rõ lỗi lặp lại và cách khắc phục',
        tone: 'bg-success text-black',
        tilt: 'sm:-rotate-1',
    },
];

/** Phần giới thiệu bên trái: tiêu đề nổi bật + 3 thẻ tính năng. */
export default function AuthShowcase() {
    return (
        <section
            aria-label="Giới thiệu Toeco"
            className="flex flex-col flex-1 gap-5 lg:gap-7 pt-6 min-w-0 motion-safe:animate-fade"
        >
            <header className="flex items-center gap-2.5 mx-auto w-full max-w-6xl">
                <span className="place-items-center grid bg-main shadow-[3px_3px_0_0_#000] border-2 border-black rounded-lg size-12 text-white">
                    {/* <LuGraduationCap aria-hidden="true" className="size-5" /> */}
                    <Image
                        src="/img/sub_logo.png"
                        alt=""
                        width={20}
                        height={20}
                        className="size-10"
                        aria-hidden="true"
                    />
                </span>
                <span className="font-bold text-main text-2xl tracking-tight">TOECO</span>
            </header>
            <p className="font-bold text-main text-3xl sm:text-5xl xl:text-6xl text-balance leading-tight tracking-tight">
                Mỗi bài luyện là một bước gần hơn tới{' '}
                <span className="inline-block bg-sub3 shadow-[4px_4px_0_0_#000] px-2 border-2 border-black rounded-lg">
                    mục tiêu.
                </span>
            </p>
            <p className="hidden sm:block max-w-lg text-subText text-lg leading-relaxed">
                Đề sát format ETS, chấm đúng tiêu chí và chỉ rõ lỗi cần sửa sau mỗi bài.
            </p>

            <ul className="hidden sm:flex flex-wrap gap-4.5 pt-2">
                {HIGHLIGHTS.map(({ icon: Icon, title, detail, tone, tilt }) => (
                    <li
                        key={title}
                        className={cn(
                            'flex flex-col flex-1 gap-2.5 bg-card shadow-[4px_4px_0_0_#000] p-4.5 border-2 border-black rounded-xl basis-44',
                            tilt,
                        )}
                    >
                        <span className={cn('place-items-center grid border-2 border-black rounded-lg size-10', tone)}>
                            <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <strong className="font-bold text-main">{title}</strong>
                        <span className="text-subText text-sm leading-normal">{detail}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
