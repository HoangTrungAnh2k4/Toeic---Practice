import type { Metadata } from 'next';
import Link from 'next/link';
import { LuChevronRight } from 'react-icons/lu';
import ExamBuilderForm from './_components/ExamBuilderForm';

export const metadata: Metadata = {
    title: 'Tạo đề Speaking | Toeco',
};

export default function NewExamPage() {
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
                <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">Tạo đề Speaking</h1>
                <p className="font-medium text-subText text-sm">
                    Điền đủ 11 câu theo 5 Part chuẩn ETS. Đề được lưu ở trạng thái nháp để xem trước trước khi phát hành.
                </p>
            </div>
            <ExamBuilderForm />
        </main>
    );
}
