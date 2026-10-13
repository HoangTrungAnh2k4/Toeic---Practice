import { MISTAKES_PATH } from '@/app/mistakes/utils';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

type HeaderProps = {
    shownCount: number;
    openCount: number;
    analyzedAttempts: number;
};

export default function Header({ shownCount, openCount, analyzedAttempts }: HeaderProps) {
    return (
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3">
            <div className="pl-3 border-sub3 border-l-5">
                <h3 className="font-semibold text-main text-lg leading-6 tracking-wide">
                    {shownCount} lỗi ưu tiên cần khắc phục ngay
                </h3>
                <p className="mt-0.5 font-medium text-subText text-xs leading-4.5">
                    Trong {openCount} lỗi chưa khắc phục, trích xuất từ {analyzedAttempts} bài đã chấm theo rubric ETS
                </p>
            </div>
            <Link href={MISTAKES_PATH} className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                Xem sổ lỗi
            </Link>
        </div>
    );
}
