import { LuRotateCw, LuTriangleAlert } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadErrorProps {
    message: string;
    onRetry: () => void;
    className?: string;
}

/** Khối báo không tải được dữ liệu, có nút thử lại. */
export function LoadError({ message, onRetry, className }: LoadErrorProps) {
    return (
        <div
            role="alert"
            className={cn(
                'flex flex-col items-center gap-3 bg-card shadow-sm px-4 py-12 border border-sub2/30 rounded-xl text-center',
                className,
            )}
        >
            <LuTriangleAlert className="size-6 text-sub2" aria-hidden="true" />
            <p className="font-semibold text-main text-sm">{message}</p>
            <p className="text-subText text-xs">Kiểm tra kết nối mạng rồi thử lại.</p>
            <Button type="button" variant="primary" size="sm" className="gap-2 text-xs" onClick={onRetry}>
                <LuRotateCw className="size-4" aria-hidden="true" />
                Thử lại
            </Button>
        </div>
    );
}
