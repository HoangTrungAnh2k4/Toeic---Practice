import Link from 'next/link';
import { LuArrowRight, LuBookOpen, LuCornerDownRight, LuMic, LuSparkles, LuTimer } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LandingHeroTimer from './LandingHeroTimer';
import { Fix } from './LandingMistakesHero';
import VoiceWave from './VoiceWave';

const CARD = 'absolute font-hand text-2xl bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_0_#000]';
const PILL =
    'absolute flex font-hand text-2xl items-center gap-2 bg-white py-1.5 pr-3.5 pl-1.5 border-2 border-black rounded-full shadow-[3px_3px_0_0_#000] font-bold text-main text-sm whitespace-nowrap motion-safe:animate-float';
const PILL_NUM = 'place-items-center grid bg-main rounded-full size-6.5 font-mono font-bold text-[0.6875rem] text-white';



/** Minh hoạ giữa hero: thẻ Speaking đang ghi âm, bài Writing đã sửa, tem điểm và các bước. */
function HeroVisual() {
    return (
        <div
            aria-hidden="true"
            className="relative md:col-span-2 lg:col-span-5 md:row-start-2 lg:row-start-auto max-md:-mb-16 h-120 md:h-135 max-md:scale-85 origin-top"
        >
            <div className="top-1/2 left-1/2 absolute after:absolute after:-inset-5.5 bg-dots-inverse bg-main border-2 border-black after:border-2 after:border-sub2/60 after:border-dashed rounded-full after:rounded-full size-85 md:size-110 -translate-1/2" />

            <div className={cn(CARD, 'top-4 max-md:-left-6 left-2 bg-ruled px-4.5 pt-1 pb-5 w-68 -rotate-9 motion-safe:animate-float motion-safe:[animation-delay:-2s]')}>
                <span className="bg-canvas px-2 py-0.5 border-2 border-black rounded-md font-hand font-bold text-[0.6875rem] tracking-wider">
                    WRITING · Q8
                </span>
                <p className="mt-1.5 text-main text-sm leading-7">
                    I think working remotely <Fix wrong="are" right="is" className="-top-3.5 text-lg" /> good because{' '}
                    <Fix wrong="it save" right="it saves" className="-top-3.5 text-lg" /> time for{' '}
                    <Fix wrong="employee" right="employees" className="-top-4 text-lg" />.
                </p>
            </div>

            <div className={cn(CARD, 'top-23 left-1/2 w-80 overflow-hidden -translate-x-5/12 rotate-3')}>
                <div className="flex justify-between bg-sub3 px-4 py-2.5 border-black border-b-2 font-hand font-bold text-main text-xs tracking-wider">
                    <span>TOEIC SPEAKING</span>
                    <span>Q11 / 11</span>
                </div>
                <div className="p-4.5 pt-4">
                    <p className="mb-1.5 font-bold text-main text-base">Express an opinion</p>
                    <p className="mb-4 text-subText text-sm leading-snug">
                        Do you prefer working from home or at the office? Give reasons to support your answer.
                    </p>
                    <div className="flex items-center gap-3.5">
                        <span className="before:absolute relative before:-inset-1.75 place-items-center grid bg-main border-2 border-black before:border-2 before:border-sub3 rounded-full before:rounded-full size-14.5 motion-safe:before:animate-pulse-ring shrink-0">
                            <LuMic className="size-6 text-sub3" />
                        </span>
                        <VoiceWave className="flex-1 gap-0.75 h-11" />
                    </div>
                    <div className="flex justify-between items-baseline mt-3.5 text-subText text-xs">
                        <span>Thời gian nói</span>
                        <LandingHeroTimer />
                    </div>
                    <div className="bg-canvas mt-1.5 border-2 border-black rounded-full h-2.5 overflow-hidden">
                        <div className="bg-main w-full motion-reduce:w-3/10 h-full origin-left motion-safe:animate-countdown motion-safe:[animation-delay:-18s]" />
                    </div>
                </div>
            </div>

            <div className="top-5.5 right-4 max-md:-right-6 absolute before:absolute before:inset-2 place-items-center grid bg-white shadow-[4px_4px_0_0_#000] border-2 border-black before:border-2 before:border-main before:border-dashed rounded-full before:rounded-full size-30 text-center rotate-12 motion-safe:animate-float motion-safe:[animation-delay:-4s]">
                <div>
                    <b className="block font-bold text-main text-4xl leading-none tracking-tight">160</b>
                    <small className="font-hand text-subText text-base">/200 · level 7</small>
                </div>
            </div>

            <div className={cn(PILL, 'top-70 max-md:-left-8  -left-4')}>
                <span className={PILL_NUM}>01</span>Beep rồi tự ghi âm
            </div>
            <div className={cn(PILL, 'top-48 max-md:-right-10 -right-2 motion-safe:[animation-delay:-2s]')}>
                <span className={PILL_NUM}>02</span>Chấm theo rubric ETS
            </div>
            <div className={cn(PILL, 'bottom-20 left-1/3 bg-success motion-safe:[animation-delay:-4s]')}>
                <span className={cn(PILL_NUM, 'bg-black')}>03</span>Đã thêm vào sổ lỗi
            </div>
        </div>
    );
}

export default function LandingHero() {
    return (
        <section aria-labelledby="landing-hero-title" className="relative bg-dots w-full h-screen overflow-hidden [--dots-alpha:30%] [--dots-size:1.6px]">
            <div className="mx-auto pt-8 md:pt-14 pb-10 md:pb-14 max-w-300">
                <div className="items-start gap-6 grid md:grid-cols-2 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <h1
                            id="landing-hero-title"
                            className="font-bold text-main text-5xl md:text-6xl xl:text-7xl leading-none tracking-wider"
                        >
                            Luyện nói,
                            <br />
                            luyện viết
                            <br />
                            như{' '}
                            <span className="whitespace-nowrap">
                                <span className="inline-block bg-sub3 my-1 px-2.5 pb-1 border-2 border-black rounded-xl font-hand -rotate-2">
                                    thi thật
                                </span>
                                <span className="text-success">.</span>
                            </span>
                        </h1>
                        <p className="flex items-center gap-2 mt-5.5 font-hand text-subText text-2xl">
                            <LuCornerDownRight aria-hidden="true" className="size-6 shrink-0" />
                            đề chuẩn ETS, chấm xong trong vài giây
                        </p>
                    </div>

                    <HeroVisual />

                    <div className="lg:col-span-3 md:pt-4.5">
                        <p className="mb-5.5 font-hand text-subText text-lg leading-relaxed">
                            <b className="text-main">Bấm giờ như thi, chấm điểm tức thì.</b>
                            <br />
                            Sai đâu sửa đó, điểm cao không khó.
                        </p>
                        <div className="flex flex-col items-start gap-3.5">
                            <Link href="/speaking" className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'gap-2')}>
                                Vào phòng thi ngay
                            </Link>
                            <Link href="#chuan-ets" className={cn(buttonVariants({ variant: 'third', size: 'sm' }), 'bg-white text-black')}>
                                Xem đề mẫu
                            </Link>
                        </div>
                        <div className="flex items-center gap-3 mt-6.5">
                            <div aria-hidden="true" className="flex -space-x-2.5">
                                {['bg-sub3', 'bg-success', 'bg-white'].map((tone, i) => (
                                    <span
                                        key={tone}
                                        className={cn('place-items-center grid border-2 border-black rounded-full size-8.5 font-mono font-bold text-black text-xs', tone)}
                                    >
                                        {['S', 'W', '+'][i]}
                                    </span>
                                ))}
                            </div>
                            <p className="flex flex-col font-hand">
                                <b className="text-main text-lg">24 đề · 236 câu</b>
                                <small className="text-subText text-base">từ ETS, Toeco và cộng đồng</small>
                            </p>
                        </div>
                    </div>
                </div>


            </div>
        </section>
    );
}
