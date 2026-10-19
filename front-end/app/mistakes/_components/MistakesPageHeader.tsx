import { LuChevronRight, LuHistory, LuNotebookPen } from 'react-icons/lu';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MistakesPageHeader() {
    return (
        <div className="flex xl:flex-row flex-col justify-between xl:items-end gap-4">
            <div className="flex items-start gap-3">
                <span className="hidden sm:flex justify-center items-center bg-main shadow-sm rounded-xl size-12 text-sub3 shrink-0">
                    <LuNotebookPen className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 font-semibold text-subText text-xs uppercase tracking-wider"
                    >
                       
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span className="text-main">Sổ lỗi</span>
                    </nav>
                    <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">Sổ lỗi cá nhân</h1>
                    <p className="max-w-3xl font-medium text-subText text-sm leading-relaxed">
                        Tổng hợp các lỗi lặp lại được AI trích xuất từ bài đã chấm, kèm giải thích theo rubric ETS và
                        cách khắc phục. Trạng thái từng lỗi tự cập nhật sau mỗi bài bạn nộp.
                    </p>
                </div>
            </div>

            <Link
                href="/setting/history"
                className={cn(
                    buttonVariants({ variant: 'third', size: 'md' }),
                    'gap-2 bg-card self-start xl:self-auto shrink-0',
                )}
            >
                <LuHistory className="size-4" aria-hidden="true" />
                <span>Lịch sử làm bài</span>
            </Link>
        </div>
    );
}
