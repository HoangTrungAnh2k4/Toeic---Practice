import type { IconType } from 'react-icons';
import { LuInbox, LuMic, LuPartyPopper, LuPenLine, LuSearch } from 'react-icons/lu';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buildMistakesHref, DEFAULT_MISTAKE_QUERY } from '../_lib/searchParams';
import { MistakeQuery } from '../types';
import { getPracticeHref } from '../utils';

export type EmptyVariant = 'no-data' | 'all-clear' | 'no-match';

interface MistakesEmptyStateProps {
    variant: EmptyVariant;
    query: MistakeQuery;
}

const CONTENT: Record<EmptyVariant, { Icon: IconType; title: string; description: string }> = {
    'no-data': {
        Icon: LuInbox,
        title: 'Sổ lỗi đang trống',
        description: 'Hoàn thành và nộp ít nhất một bài Speaking hoặc Writing để AI phân tích và ghi nhận lỗi lặp lại.',
    },
    'all-clear': {
        Icon: LuPartyPopper,
        title: 'Không còn lỗi nào cần khắc phục',
        description: 'Tất cả lỗi trong phạm vi này đã được khắc phục. Tiếp tục luyện đề mới để giữ phong độ.',
    },
    'no-match': {
        Icon: LuSearch,
        title: 'Không có lỗi phù hợp bộ lọc',
        description: 'Thử đổi từ khoá, tiêu chí hoặc trạng thái để xem thêm.',
    },
};

const LINK_CLASS = 'gap-2 text-xs';

export default function MistakesEmptyState({ variant, query }: MistakesEmptyStateProps) {
    const { Icon, title, description } = CONTENT[variant];

    return (
        <div className="flex flex-col items-center gap-3 bg-card shadow-sm px-4 py-12 border border-sub2/30 rounded-xl text-center">
            <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                <Icon className="size-6" aria-hidden="true" />
            </span>
            <p className="font-semibold text-main text-sm">{title}</p>
            <p className="max-w-md text-subText text-xs">{description}</p>

            <div className="flex flex-wrap justify-center gap-3 mt-2">
                {variant === 'no-data' && (
                    <>
                        <Link
                            href={getPracticeHref('speaking')}
                            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), LINK_CLASS)}
                        >
                            <LuMic className="size-4" aria-hidden="true" />
                            Luyện Speaking
                        </Link>
                        <Link
                            href={getPracticeHref('writing')}
                            className={cn(buttonVariants({ variant: 'third', size: 'sm' }), LINK_CLASS)}
                        >
                            <LuPenLine className="size-4" aria-hidden="true" />
                            Luyện Writing
                        </Link>
                    </>
                )}
                {variant === 'all-clear' && (
                    <Link
                        href={buildMistakesHref(query, { status: 'resolved' })}
                        scroll={false}
                        className={cn(buttonVariants({ variant: 'third', size: 'sm' }), LINK_CLASS)}
                    >
                        Xem lỗi đã khắc phục
                    </Link>
                )}
                {variant === 'no-match' && (
                    <Link
                        href={buildMistakesHref(DEFAULT_MISTAKE_QUERY)}
                        scroll={false}
                        className={cn(buttonVariants({ variant: 'third', size: 'sm' }), LINK_CLASS)}
                    >
                        Đặt lại bộ lọc
                    </Link>
                )}
            </div>
        </div>
    );
}
