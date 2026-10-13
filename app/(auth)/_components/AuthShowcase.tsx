import Image from 'next/image';
import type { IconType } from 'react-icons';
import { LuMic, LuNotebookPen, LuPenLine } from 'react-icons/lu';
import { cn } from '@/lib/utils';

type Highlight = {
    icon: IconType;
    title: string;
    detail: string;
};

const HIGHLIGHTS: Highlight[] = [
    { icon: LuMic, title: 'TOEIC Speaking', detail: '11 câu trong 20 phút, sát format ETS' },
    { icon: LuPenLine, title: 'TOEIC Writing', detail: '8 câu trong 60 phút, chấm theo tiêu chí' },
    { icon: LuNotebookPen, title: 'Sổ lỗi cá nhân', detail: 'Chỉ rõ lỗi lặp lại và cách khắc phục' },
];

const ENTER = 'motion-safe:animate-rise';

/** Panel thương hiệu: thanh logo gọn trên mobile, panel đầy đủ (minh hoạ + điểm nổi bật) từ `lg`. */
export default function AuthShowcase() {
    return (
        <aside
            aria-label="Giới thiệu Toeco"
            className="isolate relative flex flex-col bg-main px-5 lg:px-10 py-4 lg:py-10 rounded-2xl overflow-hidden text-white motion-safe:animate-fade"
        >
            <span
                aria-hidden="true"
                className="-top-24 -right-24 -z-10 absolute bg-sub2/30 blur-3xl rounded-full size-80"
            />
            <span
                aria-hidden="true"
                className="-bottom-32 -left-24 -z-10 absolute bg-sub3/10 blur-3xl rounded-full size-96"
            />

            <Image
                src="/img/logo.png"
                alt="Toeco"
                width={144}
                height={40}
                loading="eager"
                className="self-start w-auto h-8 lg:h-10"
            />

            <div className="hidden lg:flex flex-1 justify-center items-center my-8 min-h-0 motion-safe:animate-fade motion-safe:delay-300">
                <div className="relative max-w-full h-full max-h-96 aspect-square">
                    <Image
                        src="/img/banner.png"
                        alt=""
                        fill
                        loading="eager"
                        sizes="384px"
                        className="object-contain mask-radial-from-45% mask-radial-to-70% pointer-events-none select-none"
                    />
                </div>
            </div>

            <div className={cn('hidden lg:flex flex-col gap-6', ENTER, 'motion-safe:delay-150')}>
                <div className="flex flex-col gap-3">
                    <span className="self-start bg-white/10 px-2 py-1 rounded-md font-semibold text-[0.6875rem] text-sub1 uppercase tracking-wider">
                        TOEIC Speaking & Writing
                    </span>
                    <p className="max-w-lg font-bold text-3xl xl:text-4xl text-balance leading-tight tracking-tight">
                        Mỗi bài luyện là một bước gần hơn tới điểm mục tiêu.
                    </p>
                    <p className="max-w-md text-sub1/80 text-pretty leading-relaxed">
                        Đề sát format ETS, chấm đúng tiêu chí và chỉ rõ lỗi cần sửa sau mỗi bài.
                    </p>
                </div>

                <ul className="flex flex-col gap-4 pt-6 border-white/10 border-t">
                    {HIGHLIGHTS.map(({ icon: Icon, title, detail }) => (
                        <li key={title} className="flex items-center gap-3 text-sm">
                            <span className="flex justify-center items-center bg-white/10 rounded-lg size-9 shrink-0">
                                <Icon aria-hidden="true" className="size-4 text-sub3" />
                            </span>
                            <span className="flex flex-col">
                                <span className="font-semibold">{title}</span>
                                <span className="text-sub1/70">{detail}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
