import { LuBookCheck, LuClock, LuPenLine } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import VoiceWave from './VoiceWave';
import { FaPencilAlt } from 'react-icons/fa';

const ESSAY_LINES = ['w-full', 'w-11/12', 'w-full', 'w-4/5', 'w-full', 'w-2/3'];

const CARD = 'absolute bg-card border-2 border-black rounded-xl shadow-[5px_5px_0_0_#000]';

/** Minh hoạ hero: một "phòng thi" thu nhỏ, các phiếu lần lượt xuất hiện khi tải trang. */
export default function LandingHeroVisual() {
    return (
        <div
            data-reveal
            role="img"
            aria-label="Minh hoạ: bài Writing đang làm, bài Speaking đang ghi âm, phiếu điểm và một lỗi trong sổ lỗi"
            className="hidden lg:block relative w-full h-128"
        >
            {/* Bài Writing đang viết dở */}
            <div className={cn(CARD, 'top-6 left-5 p-4 w-3/4 -rotate-3 motion-safe:animate-rise')}>
                <div className="flex justify-between items-center gap-3">
                    <span className="flex items-center gap-1.5 font-semibold text-main text-xs">
                        <FaPencilAlt aria-hidden="true" className="size-3.5" />
                        Writing, câu 8
                    </span>
                    <span className="flex items-center gap-1 font-bold text-subText text-xs">
                        <LuClock aria-hidden="true" className="size-3" />
                        42:10
                    </span>
                </div>
                <p className="mt-2 font-bold text-main text-sm">Opinion essay</p>
                <div className="flex flex-col gap-1.5 mt-3">
                    {ESSAY_LINES.map((width, i) => (
                        <span key={i} className={cn('bg-sub1 rounded-full h-1.5', width)} />
                    ))}
                    <span className="flex items-center gap-1">
                        <span className="bg-sub1 rounded-full w-1/3 h-1.5" />
                        <span className="bg-main w-0.5 h-3 motion-safe:animate-pulse" />
                    </span>
                </div>
            </div>

            {/* Bài Speaking đang ghi âm */}
            <div className={cn(CARD, 'top-44 right-5 p-4 w-4/5 rotate-1 motion-safe:animate-rise motion-safe:[animation-delay:250ms]')}>
                <div className="flex justify-between items-center gap-3">
                    <span className="flex items-center gap-2 font-semibold text-main text-xs">
                        <span className="relative flex size-2.5">
                            <span className="absolute inset-0 bg-destructive opacity-75 rounded-full motion-safe:animate-ping" />
                            <span className="relative bg-destructive rounded-full size-2.5" />
                        </span>
                        Đang ghi âm
                    </span>
                    <span className="font-mono font-semibold text-main text-xs">00:27</span>
                </div>
                <p className="mt-2 font-bold text-main text-sm">Speaking, câu 3: Describe a picture</p>
                <VoiceWave className="mt-4" />
                <div className="bg-sub1 mt-4 rounded-full h-2 overflow-hidden">
                    <div className="bg-sub3 rounded-full h-full origin-left motion-safe:animate-drain" />
                </div>
            </div>

            {/* Phiếu điểm */}
            <div
                className={cn(
                    CARD,
                    'bottom-6 left-5 flex flex-col bg-sub3 px-4 py-3 -rotate-6 motion-safe:animate-stamp motion-safe:[animation-delay:900ms]',
                )}
            >
                <span className="font-semibold text-main text-xs">Điểm Speaking</span>
                <span className="font-bold text-main text-4xl tracking-tight">
                    170<span className="font-semibold text-main text-base">/200</span>
                </span>
            </div>

            {/* Lỗi được ghi vào sổ lỗi */}
            <div
                className={cn(
                    CARD,
                    'right-5 bottom-8 flex items-start w-fit gap-2.5 p-3  rotate-2 motion-safe:animate-slide-left motion-safe:[animation-delay:1300ms]',
                )}
            >
                <span className="place-items-center grid bg-success border-2 border-black rounded-lg size-8 shrink-0">
                    <LuBookCheck aria-hidden="true" className="size-4" />
                </span>
                <span className="flex flex-col gap-0.5">
                    <span className="font-semibold text-[#333] text-xs">Thiếu -s số nhiều</span>
                    <span className="font-medium text-subText text-xs">Lặp lại 3 lần, đã vào sổ lỗi</span>
                </span>
            </div>
        </div>
    );
}
