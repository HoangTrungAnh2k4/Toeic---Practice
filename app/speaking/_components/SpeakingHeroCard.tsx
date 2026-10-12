import Link from 'next/link';
import type { IconType } from 'react-icons';
import {
    LuArrowRight,
    LuBadgeCheck,
    LuCircleCheck,
    LuCirclePlay,
    LuClock,
    LuGraduationCap,
    LuHeadphones,
    LuListOrdered,
    LuLockKeyhole,
    LuNotebookPen,
    LuSlidersHorizontal,
    LuTimer,
} from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buildSpeakingTestHref, RECOMMENDED_TEST } from '../utils';

interface RoomCheck {
    icon: IconType;
    title: string;
    description: string;
}

const ROOM_CHECKS: RoomCheck[] = [
    {
        icon: LuHeadphones,
        title: 'Microphone & tai nghe',
        description: 'Tín hiệu -18dB sạch, không echo. Nên dùng tai nghe có mic rời.',
    },
    {
        icon: LuLockKeyhole,
        title: 'Quy chế thi máy (Strict CBT)',
        description: 'Tự động ghi âm sau tiếng Beep, không tạm dừng hay nghe lại câu hỏi.',
    },
    {
        icon: LuNotebookPen,
        title: 'Bút & giấy nháp',
        description: 'Chuẩn bị sẵn để ghi keyword cho Part 4 (Q8-10) và Part 5 (Q11).',
    },
];

const TEST_FACTS = [
    { icon: LuListOrdered, label: '11 câu hỏi thi nói' },
    { icon: LuClock, label: '~20 phút làm bài' },
    { icon: LuBadgeCheck, label: 'Đủ 5 phần chuẩn ETS' },
];

const LINK_FOCUS_CLASS =
    'inline-flex items-center gap-1 px-1 rounded-md font-semibold text-xs hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3';

export default function SpeakingHeroCard() {
    if (!RECOMMENDED_TEST) return null;

    return (
        <section aria-labelledby="speaking-hero-title" className="gap-4 grid grid-cols-1 lg:grid-cols-12">
            {/* Featured recommended test */}
            <div className="flex flex-col justify-between gap-6 lg:col-span-7 bg-main shadow-main/20 shadow-md p-5 sm:p-6 rounded-xl">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-sub3 px-2 py-0.5 rounded-md font-bold text-[11px] text-main uppercase tracking-wide">
                            Khuyến dùng hôm nay
                        </span>
                        <span className="bg-white/10 px-2 py-0.5 rounded-md font-semibold text-[11px] text-sub1">
                            Phần thi nói 2024.Q4
                        </span>
                        <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md font-semibold text-[11px] text-sub1">
                            <LuTimer className="size-3.5" aria-hidden="true" />
                            Chuẩn thời gian CBT
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <h2 id="speaking-hero-title" className="font-bold text-white text-xl sm:text-2xl tracking-tight">
                            {RECOMMENDED_TEST.title}
                        </h2>
                        <p className="max-w-2xl text-sub1 text-sm leading-relaxed">
                            Tình huống thực tế tại văn phòng: thông báo hoãn dự án (Part 3), lịch trình hội nghị toàn
                            cầu (Part 4) và thảo luận mô hình làm việc hybrid (Part 5).
                        </p>
                    </div>

                    <ul className="flex flex-wrap gap-x-4 gap-y-2 font-medium text-sub1 text-xs">
                        {TEST_FACTS.map(({ icon: Icon, label }) => (
                            <li key={label} className="flex items-center gap-1.5">
                                <Icon className="size-4 text-sub3" aria-hidden="true" />
                                {label}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href={buildSpeakingTestHref(RECOMMENDED_TEST.id)}
                        className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'gap-2')}
                    >
                        <LuCirclePlay className="size-4" aria-hidden="true" />
                        <span>Bắt đầu làm bài thi</span>
                    </Link>
                    <Link
                        href={`${buildSpeakingTestHref(RECOMMENDED_TEST.id)}&mode=guided`}
                        className={cn(buttonVariants({ variant: 'third', size: 'md' }), 'gap-2 bg-white text-main')}
                    >
                        <LuGraduationCap className="size-4" aria-hidden="true" />
                        <span>Luyện có hướng dẫn</span>
                    </Link>
                    <a href="#rubric-guide" className={cn(LINK_FOCUS_CLASS, 'text-sub3')}>
                        Xem cấu trúc & tiêu chí chấm
                        <LuArrowRight className="size-3.5" aria-hidden="true" />
                    </a>
                </div>
            </div>

            {/* Pre-test room check */}
            <div className="flex flex-col justify-between gap-4 lg:col-span-5 bg-white shadow-sm p-5 border border-sub2/30 rounded-xl">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center gap-2">
                        <h3 className="font-semibold text-subText text-xs uppercase tracking-wider">
                            Kiểm tra điều kiện phòng thi
                        </h3>
                        <span className="inline-flex items-center gap-1 bg-sub1 px-2 py-0.5 rounded-full font-semibold text-[11px] text-main">
                            <LuCircleCheck className="size-3.5" aria-hidden="true" />
                            {ROOM_CHECKS.length}/{ROOM_CHECKS.length} hợp lệ
                        </span>
                    </div>

                    <ul className="flex flex-col gap-2">
                        {ROOM_CHECKS.map(({ icon: Icon, title, description }) => (
                            <li key={title} className="flex items-start gap-3 bg-sub1/50 p-3 rounded-lg">
                                <span className="flex justify-center items-center bg-main rounded-md size-8 text-sub3 shrink-0">
                                    <Icon className="size-4" aria-hidden="true" />
                                </span>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="font-semibold text-main text-sm leading-tight">{title}</span>
                                    <span className="text-subText text-xs leading-relaxed">{description}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-sub2/20 border-t">
                    <button type="button" className={cn(LINK_FOCUS_CLASS, 'gap-1.5 text-main')}>
                        <LuSlidersHorizontal className="size-4" aria-hidden="true" />
                        Cân chỉnh mic & âm lượng
                    </button>
                    <span className="font-mono text-sub2 text-xs">Độ trễ: ~12ms</span>
                </div>
            </div>
        </section>
    );
}
