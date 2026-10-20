import type { Metadata } from 'next';
import Link from 'next/link';
import { LuChevronRight } from 'react-icons/lu';
import type { Skill } from '@/lib/domain/types';
import ExamBuilderForm from './_components/ExamBuilderForm';

interface NewExamPageProps {
    searchParams: Promise<{ skill?: string | string[] }>;
}

const COPY: Record<Skill, { title: string; description: string }> = {
    speaking: {
        title: 'Tạo đề Speaking',
        description: 'Điền đủ 11 câu theo 5 Part chuẩn ETS. Đề được lưu ở trạng thái nháp để xem trước trước khi phát hành.',
    },
    writing: {
        title: 'Tạo đề Writing',
        description:
            'Điền đủ 8 câu theo 3 Part chuẩn ETS: tranh và từ khoá, email, bài luận. Đề được lưu ở trạng thái nháp, chỉ admin xem trước được.',
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
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-4xl">
            <div className="flex flex-col gap-1.5">
                <nav
                    aria-label="Breadcrumb"
                    className="flex flex-wrap items-center gap-1.5 font-semibold text-sub2 text-xs uppercase tracking-wider"
                >
                    <Link
                        href="/setting/exam-management"
                        className="hover:text-main rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    >
                        Quản trị đề thi
                    </Link>
                    <LuChevronRight className="size-3.5" aria-hidden="true" />
                    <span className="text-main" aria-current="page">
                        Tạo đề
                    </span>
                </nav>
                <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">{COPY[skill].title}</h1>
                <p className="font-medium text-subText text-sm">{COPY[skill].description}</p>
            </div>
            {/* key: đổi kỹ năng trên cùng trang thì form tạo lại với khung Part mới */}
            <ExamBuilderForm key={skill} skill={skill} />
        </main>
    );
}
