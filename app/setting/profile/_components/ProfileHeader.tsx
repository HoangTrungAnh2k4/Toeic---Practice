import Link from 'next/link';
import { LuArrowLeft, LuChevronRight, LuUserRound } from 'react-icons/lu';
import LinkButton from '@/components/ui/link-button';
import { SETTING_BASE_PATH } from '@/app/setting/utils';

export default function ProfileHeader() {
    return (
        <div className="flex xl:flex-row flex-col justify-between xl:items-end gap-4">
            {/* Title & Breadcrumb */}
            <div className="flex items-start gap-3">
                <span className="hidden sm:flex justify-center items-center bg-main shadow-sm rounded-xl size-12 text-sub3 shrink-0">
                    <LuUserRound className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 font-semibold text-sub2 text-xs uppercase tracking-wider"
                    >
                        <span>TOEIC Speaking & Writing</span>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <Link
                            href={SETTING_BASE_PATH}
                            className="hover:text-main rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                        >
                            Cài đặt
                        </Link>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span className="text-main" aria-current="page">
                            Hồ sơ cá nhân
                        </span>
                    </nav>
                    <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">Hồ sơ cá nhân</h1>
                    <p className="max-w-3xl font-medium text-subText text-sm leading-relaxed">
                        Thông tin tài khoản, thói quen học cùng điểm mục tiêu và lịch thi TOEIC Speaking & Writing của
                        bạn.
                    </p>
                </div>
            </div>

            {/* Header Actions */}
            <LinkButton
                href={SETTING_BASE_PATH}
                variant="third"
                size="md"
                className="gap-2 self-start xl:self-auto bg-white shrink-0"
            >
                <LuArrowLeft className="size-4" aria-hidden="true" />
                <span>Quay lại Cài đặt</span>
            </LinkButton>
        </div>
    );
}
