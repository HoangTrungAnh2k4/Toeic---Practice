import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LuChevronRight, LuFileText, LuLayers, LuListOrdered } from 'react-icons/lu';
import { Skeleton } from '@/components/ui/skeleton';
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
        description:
            'Điền đủ các câu theo Part chuẩn ETS. Đề được lưu ở trạng thái nháp để xem trước trước khi phát hành.',
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

export default function NewExamPage({ searchParams }: NewExamPageProps) {
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

            {/* searchParams là runtime data → stream trong Suspense để chuyển trang không bị chặn */}
            <Suspense
                fallback={
                    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải khung đề">
                        <Skeleton className="w-72 h-12" />
                        <Skeleton className="rounded-xl w-full h-96" />
                    </div>
                }
            >
                <NewExamContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function NewExamContent({ searchParams }: NewExamPageProps) {
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
        <>
            {/* Header gọn: trang công cụ nên nhường chỗ cho vùng soạn đề */}
            <header className="flex flex-wrap justify-between items-end gap-4 motion-safe:animate-rise">
                <div className="flex items-start gap-3 max-w-2xl">
                    <span
                        className={cn('flex justify-center items-center rounded-xl size-11 shrink-0', className)}
                        aria-hidden="true"
                    >
                        <Icon className="size-5" />
                    </span>
                    <div className="flex flex-col gap-1">
                        <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">{COPY[skill].title}</h1>
                        <p className="font-medium text-subText text-sm">{COPY[skill].description}</p>
                    </div>
                </div>
                <ul className="flex flex-wrap gap-2" aria-label={`Khung đề ${label}`}>
                    {stats.map(({ Icon: StatIcon, text }) => (
                        <li
                            key={text}
                            className="inline-flex items-center gap-1.5 bg-card px-2.5 py-1 border border-sub2/30 rounded-md font-semibold text-[0.6875rem] text-main tracking-wider"
                        >
                            <StatIcon className="size-3.5 text-sub2" aria-hidden="true" />
                            {text}
                        </li>
                    ))}
                </ul>
            </header>

            {/* key: đổi kỹ năng trên cùng trang thì form tạo lại với khung Part mới */}
            <ExamBuilderForm key={skill} skill={skill} />
        </>
    );
}
