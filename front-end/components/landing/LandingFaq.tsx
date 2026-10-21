import Link from 'next/link';
import { LuArrowDownRight, LuPlus } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FAQS } from './schedule.data';

/**
 * Section Q&A: tiêu đề dính bên trái, thẻ câu hỏi đánh số bên phải. `<details name>` native: mở một câu đóng câu khác, không cần JS.
 * Hiệu ứng đóng/mở dùng `::details-content` + `interpolate-size`; trình duyệt chưa hỗ trợ thì mở/đóng tức thì.
 */
export default function LandingFaq() {
    return (
        <section id="faq" aria-labelledby="faq-title" className="bg-grid-paper px-4 sm:px-8 pt-12 pb-18 w-full font-hand">
            <div className="items-start gap-10 lg:gap-16 grid lg:grid-cols-12 mx-auto max-w-300">
                <div data-reveal className="lg:top-8 relative flex flex-col items-start gap-5 lg:col-span-5">
                    <span
                        aria-hidden="true"
                        className="-top-10 right-0 lg:right-6 absolute text-[12rem] text-main leading-none -rotate-12 pointer-events-none select-none"
                    >
                        ?
                    </span>
                    <p className="relative font-semibold text-subText text-xs uppercase tracking-wider">Hỏi đáp, Q&amp;A</p>
                    <h2 id="faq-title" className="relative font-bold text-main text-5xl sm:text-6xl leading-[1.05] tracking-tight">
                        Còn
                        <br />
                        băn khoăn<span className="text-sub3"> ?</span>
                    </h2>
                    <p className="relative max-w-sm font-medium text-[#333] leading-relaxed">
                        Những câu người học hỏi nhiều nhất trước khi vào phòng thi.
                    </p>
                    <p className="flex items-center gap-2 text-[#555] text-xl">
                        chưa thấy câu của bạn? cứ thử một đề
                        <LuArrowDownRight aria-hidden="true" className="size-5 shrink-0" />
                    </p>
                    <Link href="/speaking" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}>
                        Thi thử miễn phí
                    </Link>
                </div>

                <div className="flex flex-col gap-4 lg:col-span-7">
                    {FAQS.map(({ q, a }, i) => (
                        <details
                            key={q}
                            data-reveal
                            name="faq"
                            open={i === 0}
                            className="group bg-card open:shadow-[6px_6px_0_0_#000] border-2 border-black rounded-xl [&::details-content]:h-0 open:[&::details-content]:h-auto [&::details-content]:overflow-hidden transition-[translate,box-shadow] [&::details-content]:transition-[height,content-visibility] motion-reduce:[&::details-content]:transition-none open:-translate-y-0.5 duration-200 [&::details-content]:duration-300 [&::details-content]:ease-out [interpolate-size:allow-keywords] [&::details-content]:[transition-behavior:allow-discrete]"
                        >
                            <summary className="[&::-webkit-details-marker]:hidden flex items-center gap-4 p-4 sm:p-5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main cursor-pointer list-none">
                                <span className="place-items-center grid bg-canvas group-open:bg-sub3 border-2 border-black rounded-lg size-11 font-mono font-bold text-main shrink-0">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="flex-1 font-semibold text-main">{q}</span>
                                <LuPlus
                                    aria-hidden="true"
                                    className="size-5 text-main group-open:rotate-45 transition-transform shrink-0"
                                />
                            </summary>
                            {/* Thụt lề bằng ô số + gap để câu trả lời thẳng hàng với câu hỏi */}
                            <p className="opacity-0 group-open:opacity-100 pr-4 sm:pr-5 pb-5 pl-19 sm:pl-20 font-medium text-subText text-sm leading-relaxed transition-opacity motion-reduce:transition-none duration-300">
                                {a}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
