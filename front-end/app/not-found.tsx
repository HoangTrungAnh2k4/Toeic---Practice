import { LuArrowLeft, LuSearch } from 'react-icons/lu';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center gap-3 bg-card shadow-sm mx-auto px-4 py-12 border border-sub2/30 rounded-xl w-full max-w-360 text-center">
            <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                <LuSearch className="size-6" aria-hidden="true" />
            </span>
            <h1 className="font-semibold text-main text-base">Không tìm thấy trang</h1>
            <p className="max-w-md text-subText text-xs">Đường dẫn không tồn tại hoặc đã được chuyển đi nơi khác.</p>
            <Link
                href="/overview"
                className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'gap-2 mt-2 text-xs')}
            >
                <LuArrowLeft className="size-4" aria-hidden="true" />
                Về trang tổng quan
            </Link>
        </div>
    );
}
