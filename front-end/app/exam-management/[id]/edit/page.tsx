import type { Metadata } from 'next';
import Link from 'next/link';
import { LuChevronRight } from 'react-icons/lu';
import ExamEditLoader from './_components/ExamEditLoader';

export const metadata: Metadata = {
    title: 'Sửa đề | Toeco',
};

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-6xl">
            <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-1.5 font-semibold text-sub2 text-xs uppercase tracking-wider"
            >
                <Link
                    href="/exam-management"
                    className="hover:text-main rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                >
                    Quản trị đề thi
                </Link>
                <LuChevronRight className="size-3.5" aria-hidden="true" />
                <span className="text-main" aria-current="page">
                    Sửa đề
                </span>
            </nav>
            {/* key: chuyển sang đề khác thì form tạo lại với dữ liệu mới */}
            <ExamEditLoader key={id} id={id} />
        </main>
    );
}
