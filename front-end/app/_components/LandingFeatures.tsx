import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LuBookCheck, LuCalendarDays, LuChartLine, LuHeadphones, LuMic, LuPenLine } from 'react-icons/lu';

type Feature = { icon: IconType; title: string; detail: string; href: string };

const FEATURES: Feature[] = [
    {
        icon: LuMic,
        title: 'Phòng thi Speaking',
        detail: 'Ghi âm từng câu theo đúng thời gian chuẩn bị và trả lời, nghe lại bài nói của mình.',
        href: '/speaking',
    },
    {
        icon: LuPenLine,
        title: 'Phòng thi Writing',
        detail: 'Viết bài trong editor có đếm giờ và đếm từ, chấm theo tiêu chí của từng dạng câu.',
        href: '/writing',
    },
    {
        icon: LuBookCheck,
        title: 'Sổ lỗi cá nhân',
        detail: 'Gom các lỗi lặp lại qua nhiều bài, giải thích vì sao sai và gợi ý bài luyện để sửa.',
        href: '/mistakes',
    },
    {
        icon: LuCalendarDays,
        title: 'Lộ trình học',
        detail: 'Lịch luyện theo tuần dựa trên mục tiêu điểm và thời gian bạn có mỗi ngày.',
        href: '/schedule',
    },
    {
        icon: LuChartLine,
        title: 'Theo dõi tiến độ',
        detail: 'Biểu đồ điểm qua các lần thi, mục tiêu từng kỹ năng và lịch sử bài làm.',
        href: '/overview',
    },
    {
        icon: LuHeadphones,
        title: 'Kiểm tra thiết bị',
        detail: 'Thử micro, loa và bàn phím trước khi vào phòng thi để không bị gián đoạn.',
        href: '/setting/device-check',
    },
];

export default function LandingFeatures() {
    return (
        <section id="tinh-nang" aria-labelledby="features-title" className="flex flex-col gap-8 scroll-mt-6">
            <div className="flex flex-col gap-2">
                <h2 id="features-title" className="font-bold text-main text-3xl tracking-tight">
                    Mọi thứ cần cho một buổi luyện thi
                </h2>
                <p className="font-medium text-subText text-sm">Từ làm bài, chấm điểm đến sửa lỗi, trong cùng một nơi.</p>
            </div>

            <ul className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map(({ icon: Icon, title, detail, href }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            className="flex flex-col gap-3 bg-card shadow-sm hover:shadow-md p-5 border border-sub2/30 rounded-xl h-full transition-shadow"
                        >
                            <span className="place-items-center grid bg-sub1 rounded-lg size-10 text-main">
                                <Icon aria-hidden="true" className="size-5" />
                            </span>
                            <h3 className="font-semibold text-main">{title}</h3>
                            <p className="font-medium text-subText text-sm leading-relaxed">{detail}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
