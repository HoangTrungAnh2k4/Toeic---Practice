import type { Metadata } from 'next';
import Link from 'next/link';
import { LuChevronRight, LuFileText, LuLayers, LuListOrdered } from 'react-icons/lu';
import { getPartTemplates } from '@/lib/domain/parts';
import type { Skill } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { SKILL_STYLE } from '../_lib/examStyle';
import ExamBuilderForm from './_components/ExamBuilderForm';

interface NewExamPageProps {
    searchParams: Promise<{ skill?: string | string[] }>;
}

const COPY: Record<Skill, { title: string; description: string }> = {
    speaking: {
        title: 'Tạo đề Speaking',
        description: 'Điền đủ các câu theo Part chuẩn ETS. Đề được lưu ở trạng thái nháp để xem trước trước khi phát hành.',
    },
    writing: {
        title: 'Tạo đề Writing',
        description:
            'Điền đủ các câu theo Part chuẩn ETS: tranh và từ khoá, email, bài luận. Đề được lưu ở trạng thái nháp, chỉ admin xem trước được.',
    },
};

/** `?skill=writing` tạo đề Writing, còn lại là Speaking. */
const parseSkill = async (searchParams: NewExamPageProps['searchParams']): Promise<Skill> =>
    (await searchParams).skill === 'writing' ? 'writing' : 'speaking';

export async function generateMetadata({ searchParams }: NewExamPageProps): Promise<Metadata> {
    return { title: `${COPY[await parseSkill(searchParams)].title} | Toeco` };
}

export default async function NewExamPage({ searchParams }: NewExamPageProps) {
    const skill = await parseSkill(searchParams);
    const parts = getPartTemplates(skill);
    const questionCount = parts.reduce((sum, part) => sum + part.q_to - part.q_from + 1, 0);
    const { Icon, label, className } = SKILL_STYLE[skill];
    const stats = [
        { Icon: LuLayers, text: `${parts.length} Part` },
        { Icon: LuListOrdered, text: `${questionCount} câu hỏi` },
        { Icon: LuFileText, text: 'Lưu dạng nháp' },
    ];

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-6xl">
            <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-1.5 font-semibold text-sub2 text-xs uppercase tracking-wider"
            >
                <Link
                    href="/exam-management"
                    className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:text-main transition-colors"
                >
                    Quản trị đề thi
                </Link>
                <LuChevronRight className="size-3.5" aria-hidden="true" />
                <span className="text-main" aria-current="page">
                    Tạo đề
                </span>
            </nav>

            <header className="relative flex flex-col gap-4 bg-main shadow-main/20 shadow-md p-5 sm:p-7 pt-4 sm:pt-4 rounded-2xl overflow-hidden motion-safe:animate-rise">
                {/* Vòng trang trí, chỉ để nền bớt phẳng */}
                <span
                    aria-hidden="true"
                    className="-top-16 -right-16 absolute border-[2.5rem] border-white/5 rounded-full size-56"
                />
                <span
                    aria-hidden="true"
                    className="-right-6 -bottom-20 absolute bg-sub3/10 rounded-full size-40"
                />

                <div className="relative flex flex-col gap-1.5 max-w-2xl">
                    <h1 className="font-bold text-white text-2xl sm:text-3xl tracking-tight">{COPY[skill].title}</h1>
                    <p className="font-medium text-sub1 text-sm">{COPY[skill].description}</p>
                </div>
                <ul className="relative flex flex-wrap gap-2">
                    {stats.map(({ Icon: StatIcon, text }) => (
                        <li
                            key={text}
                            className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md font-semibold text-sub1 text-xs"
                        >
                            <StatIcon className="size-3.5 text-sub3" aria-hidden="true" />
                            {text}
                        </li>
                    ))}
                </ul>
            </header>

            {/* key: đổi kỹ năng trên cùng trang thì form tạo lại với khung Part mới */}
            <ExamBuilderForm key={skill} skill={skill} />
        </main>
    );
}
