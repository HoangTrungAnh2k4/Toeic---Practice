import type { IconType } from 'react-icons';
import {
    LuArrowRight,
    LuBadgeCheck,
    LuCircleCheck,
    LuCirclePlay,
    LuClock,
    LuFilePen,
    LuGauge,
    LuGraduationCap,
    LuHardDriveDownload,
    LuKeyboard,
    LuLockKeyhole,
    LuTimer,
} from 'react-icons/lu';
import Button from '@/components/ui/button';
import LinkButton from '@/components/ui/link-button';
import { RECOMMENDED_TEST, WRITING_TEST_PATH } from '../utils';

interface RoomCheck {
    icon: IconType;
    title: string;
    description: string;
}

const ROOM_CHECKS: RoomCheck[] = [
    {
        icon: LuKeyboard,
        title: 'Bàn phím & bộ gõ tiếng Anh',
        description: 'Đã tắt bộ gõ Telex/VNI để tránh gõ sai ký tự.',
    },
    {
        icon: LuLockKeyhole,
        title: 'Quy chế thi máy (Strict CBT)',
        description: '8 phút cho Q1-5, 10 phút/email Q6-7, 30 phút Essay Q8. Khóa bài khi hết giờ.',
    },
    {
        icon: LuHardDriveDownload,
        title: 'Tự động lưu bản nháp',
        description: 'Lưu vào IndexedDB sau mỗi phím gõ, chống mất bài khi mất kết nối.',
    },
];

const TEST_FACTS = [
    { icon: LuFilePen, label: '8 câu hỏi thi viết' },
    { icon: LuClock, label: '~60 phút làm bài' },
    { icon: LuBadgeCheck, label: 'Đủ 3 phần chuẩn ETS' },
];

export default function WritingHeroCard() {
    if (!RECOMMENDED_TEST) return null;

    return (
        <section aria-labelledby="writing-hero-title" className="gap-4 grid grid-cols-1 lg:grid-cols-12">
            {/* Featured recommended test */}
            <div className="flex flex-col justify-between gap-6 lg:col-span-7 bg-main shadow-main/20 shadow-md p-5 sm:p-6 rounded-xl">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-sub3 px-2 py-0.5 rounded-md font-bold text-[11px] text-main uppercase tracking-wide">
                            Khuyến dùng hôm nay
                        </span>
                        <span className="bg-white/10 px-2 py-0.5 rounded-md font-semibold text-[11px] text-sub1">
                            Phần thi viết 2024.Q4
                        </span>
                        <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md font-semibold text-[11px] text-sub1">
                            <LuTimer className="size-3.5" aria-hidden="true" />
                            Chuẩn thời gian CBT
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <h2 id="writing-hero-title" className="font-bold text-white text-xl sm:text-2xl tracking-tight">
                            {RECOMMENDED_TEST.title}
                        </h2>
                        <p className="max-w-2xl text-sub1 text-sm leading-relaxed">
                            Viết câu theo tranh về hoạt động văn phòng (Q1-5), phản hồi 2 email yêu cầu thông tin dịch
                            vụ (Q6-7) và bài luận nêu quan điểm về hình thức làm việc linh hoạt (Q8).
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
                    <LinkButton href={WRITING_TEST_PATH} variant="primary" size="md" className="gap-2">
                        <LuCirclePlay className="size-4" aria-hidden="true" />
                        <span>Bắt đầu làm bài thi</span>
                    </LinkButton>
                    <Button type="button" size="md" variant="third" className="gap-2 bg-white text-main">
                        <LuGraduationCap className="size-4" aria-hidden="true" />
                        <span>Luyện có hướng dẫn</span>
                    </Button>
                    <a
                        href="#rubric-guide"
                        className="inline-flex items-center gap-1 px-1 rounded-md font-semibold text-sub3 text-xs hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
                    >
                        Xem tiêu chí chấm Rubric (0 - 200)
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
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-1 rounded-md font-semibold text-main text-xs hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
                    >
                        <LuGauge className="size-4" aria-hidden="true" />
                        Kiểm tra tốc độ gõ & editor
                    </button>
                    <span className="font-mono text-sub2 text-xs">Trễ lưu: ~8ms</span>
                </div>
            </div>
        </section>
    );
}
