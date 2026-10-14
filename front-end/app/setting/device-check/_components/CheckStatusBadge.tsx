import type { IconType } from 'react-icons';
import { LuCircleAlert, LuCircleCheck, LuCircleDashed } from 'react-icons/lu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckStatus } from '../types';
import { CHECK_STATUS_LABEL } from '../utils';

const STATUS_STYLE: Record<CheckStatus, { className: string; Icon: IconType }> = {
    passed: { className: 'bg-success/20 border-success/60 text-main', Icon: LuCircleCheck },
    failed: { className: 'bg-destructive/10 border-destructive/30 text-destructive', Icon: LuCircleAlert },
    pending: { className: 'bg-sub1 border-sub2/30 text-subText', Icon: LuCircleDashed },
};

interface CheckStatusBadgeProps {
    status: CheckStatus;
    className?: string;
}

export default function CheckStatusBadge({ status, className }: CheckStatusBadgeProps) {
    const { className: statusClass, Icon } = STATUS_STYLE[status];

    return (
        <Badge variant="outline" className={cn('px-2.5 h-6 font-semibold', statusClass, className)}>
            <Icon aria-hidden="true" />
            {CHECK_STATUS_LABEL[status]}
        </Badge>
    );
}
