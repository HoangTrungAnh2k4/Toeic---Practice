import Link from 'next/link';
import { LuArchive, LuHistory } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import type { Skill } from '@/lib/domain/types';
import { cn } from '@/lib/utils';

/** Thay phòng thi khi đề đã lưu trữ mà người học không còn lượt dở để làm nốt. */
export function ArchivedExamNotice({ skill }: { skill: Skill }) {
    return (
        <div className="px-4 sm:px-8 py-12 w-full">
            <div className="flex flex-col items-center gap-3 bg-card shadow-sm mx-auto px-4 py-12 border border-sub2/30 rounded-xl w-full max-w-360 text-center">
                <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                    <LuArchive className="size-6" aria-hidden="true" />
                </span>
                <h1 className="font-semibold text-main text-base">Đề này đã ngừng sử dụng</h1>
                <p className="max-w-md text-subText text-xs">
                    Không bắt đầu lượt mới được nữa. Kết quả các lượt bạn đã làm vẫn còn trong lịch sử làm bài.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                    <Link href={`/${skill}`} className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'text-xs')}>
                        Chọn đề khác
                    </Link>
                    <Link
                        href="/setting/history"
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2 text-xs')}
                    >
                        <LuHistory className="size-4" aria-hidden="true" />
                        Xem lịch sử làm bài
                    </Link>
                </div>
            </div>
        </div>
    );
}
