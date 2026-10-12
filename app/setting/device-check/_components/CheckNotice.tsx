import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { LuCircleAlert, LuCircleCheck, LuInfo, LuTriangleAlert } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { NoticeTone } from '../types';

const TONE_STYLE: Record<NoticeTone, { container: string; icon: string; title: string; Icon: IconType }> = {
    info: { container: 'bg-sub1/50 border-sub2/20', icon: 'text-sub2', title: 'text-main', Icon: LuInfo },
    success: {
        container: 'bg-success/10 border-success/40',
        icon: 'text-main',
        title: 'text-main',
        Icon: LuCircleCheck,
    },
    warning: { container: 'bg-sub3/15 border-sub3/50', icon: 'text-main', title: 'text-main', Icon: LuTriangleAlert },
    error: {
        container: 'bg-destructive/10 border-destructive/30',
        icon: 'text-destructive',
        title: 'text-destructive',
        Icon: LuCircleAlert,
    },
};

interface CheckNoticeProps {
    tone: NoticeTone;
    title?: string;
    children?: ReactNode;
    /** Nút hành động hiển thị bên phải (hoặc bên dưới khi hẹp). */
    action?: ReactNode;
    className?: string;
}

export default function CheckNotice({ tone, title, children, action, className }: CheckNoticeProps) {
    const { container, icon, title: titleClass, Icon } = TONE_STYLE[tone];

    return (
        <div
            className={cn(
                'flex @md:flex-row flex-col @md:justify-between @md:items-center gap-3 p-4 border rounded-lg',
                container,
                className,
            )}
        >
            <div className="flex items-start gap-3">
                <Icon className={cn('mt-0.5 size-5 shrink-0', icon)} aria-hidden="true" />
                <div className="flex flex-col gap-0.5">
                    {title && <span className={cn('font-semibold text-sm', titleClass)}>{title}</span>}
                    {children && <div className="text-subText text-xs leading-relaxed">{children}</div>}
                </div>
            </div>
            {action && <div className="self-start @md:self-auto shrink-0">{action}</div>}
        </div>
    );
}
