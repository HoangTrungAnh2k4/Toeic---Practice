import { LuLoaderCircle, LuMic, LuRefreshCw } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { MicStatus } from '../types';
import { isMicIssue, MIC_ISSUE_COPY, PERMANENT_MIC_ISSUES } from '../utils';
import CheckNotice from './CheckNotice';

interface MicrophoneAccessNoticeProps {
    status: MicStatus;
    /** Đã từng cấp quyền: lúc chờ chỉ là bật lại micro, không còn hộp thoại xin quyền. */
    hasAccess: boolean;
    onRequestAccess: () => void;
    /** Câu nói rõ âm thanh đi đâu, hiện trong lời mời cấp quyền. */
    privacyNote?: string;
}

/** Hiển thị khi micro chưa hoạt động: lời mời cấp quyền, trạng thái chờ hoặc lỗi kèm cách khắc phục. */
export default function MicrophoneAccessNotice({
    status,
    hasAccess,
    onRequestAccess,
    privacyNote = 'Âm thanh chỉ được xử lý ngay trên máy của bạn, không được tải lên hay lưu lại.',
}: MicrophoneAccessNoticeProps) {
    if (isMicIssue(status)) {
        const { title, description } = MIC_ISSUE_COPY[status];
        const canRetry = !PERMANENT_MIC_ISSUES.includes(status);

        return (
            <div role="alert">
                <CheckNotice
                    tone="error"
                    title={title}
                    action={
                        canRetry && (
                            <Button
                                type="button"
                                variant="third"
                                size="sm"
                                onClick={onRequestAccess}
                                className="gap-2 bg-white"
                            >
                                <LuRefreshCw className="size-4" aria-hidden="true" />
                                Thử lại
                            </Button>
                        )
                    }
                >
                    {description}
                </CheckNotice>
            </div>
        );
    }

    const isRequesting = status === 'requesting';
    let title = 'Cho phép truy cập micro';
    let description = `Trình duyệt sẽ hỏi quyền dùng micro. ${privacyNote}`;
    if (isRequesting && hasAccess) {
        title = 'Đang bật lại micro…';
        description = 'Micro bạn đã chọn sẽ sẵn sàng trong giây lát.';
    } else if (isRequesting) {
        title = 'Đang chờ bạn cấp quyền…';
        description =
            'Chọn “Cho phép” trên hộp thoại của trình duyệt. Nếu không thấy hộp thoại, hãy bấm biểu tượng micro trên thanh địa chỉ.';
    }

    return (
        <div
            aria-live="polite"
            className="flex flex-col items-center gap-4 bg-sub1/40 px-6 py-8 rounded-xl text-center"
        >
            <span className="flex justify-center items-center bg-main rounded-full size-14 text-sub3">
                {isRequesting ? (
                    <LuLoaderCircle className="size-7 motion-safe:animate-spin" aria-hidden="true" />
                ) : (
                    <LuMic className="size-7" aria-hidden="true" />
                )}
            </span>
            <div className="flex flex-col gap-1 max-w-md">
                <p className="font-bold text-main text-base">{title}</p>
                <p className="text-subText text-sm leading-relaxed">{description}</p>
            </div>
            {!isRequesting && (
                <Button type="button" variant="primary" size="md" onClick={onRequestAccess} className="gap-2">
                    <LuMic className="size-4" aria-hidden="true" />
                    Bật micro
                </Button>
            )}
        </div>
    );
}
