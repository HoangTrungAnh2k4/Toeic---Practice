import Button from '@/components/ui/button';
import Image from 'next/image';
import type { IconType } from 'react-icons';
import { LuMic, LuPenLine, LuRoute } from 'react-icons/lu';

type ExamFormat = {
    icon: IconType;
    skill: string;
    detail: string;
};

const EXAM_FORMATS: ExamFormat[] = [
    { icon: LuMic, skill: 'Speaking', detail: '11 câu trong 20 phút' },
    { icon: LuPenLine, skill: 'Writing', detail: '8 câu trong 60 phút' },
];

export default function WelcomeBanner() {
    return (
        <section
            aria-labelledby="welcome-heading"
            className="isolate relative bg-main rounded-2xl w-full overflow-hidden text-white"
        >
            <Image
                src="/svg/banner-decor.svg"
                alt=""
                fill
                priority
                sizes="100vw"
                className="-z-10 object-center object-cover sm:object-left pointer-events-none select-none"
            />

            <div className="flex">
                <div className="flex flex-col flex-1 gap-5 px-6 sm:px-10 py-8">
                    <div className="flex flex-col gap-2">
                        <h1
                            id="welcome-heading"
                            className="max-w-2xl font-bold text-3xl sm:text-4xl text-balance leading-tight tracking-tight"
                        >
                            <span className="sm:block">Luyện như thi thật,</span> để ngày thi nhẹ như một buổi tập.
                        </h1>
                        <p className="mt-1 max-w-xl text-sub1/80 text-pretty leading-relaxed">
                            Đề sát format ETS, chấm đúng tiêu chí và chỉ rõ lỗi cần sửa sau mỗi bài.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Button variant="primary">Bắt đầu luyện tập</Button>
                        <Button variant="secondary">
                            <LuRoute aria-hidden="true" className="mr-2 size-4" />
                            Xem lộ trình
                        </Button>
                    </div>

                    <ul
                        aria-label="Cấu trúc đề thi TOEIC Speaking & Writing"
                        className="flex flex-wrap gap-x-8 gap-y-3 pt-4 border-white/10 border-t max-w-2xl"
                    >
                        {EXAM_FORMATS.map(({ icon: Icon, skill, detail }) => (
                            <li key={skill} className="flex items-center gap-3 text-sm">
                                <span className="flex justify-center items-center bg-white/10 rounded-lg size-9 shrink-0">
                                    <Icon aria-hidden="true" className="size-4 text-sub3" />
                                </span>
                                <span className="flex flex-col">
                                    <span className="font-semibold">TOEIC {skill}</span>
                                    <span className="text-sub1/70">{detail}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="hidden lg:flex items-end w-56 xl:w-80 shrink-0">
                    <Image
                        src="/img/banner.png"
                        alt=""
                        width={934}
                        height={934}
                        priority
                        sizes="(min-width: 1280px) 320px, 224px"
                        className="mask-l-from-75% mask-t-from-80% w-full h-auto translate-y-4"
                    />
                </div>
            </div>
        </section>
    );
}
