import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { ResponseSegment } from '../../_lib/annotate';

interface AnnotatedResponseProps {
    segments: ResponseSegment[];
}

/**
 * Câu trả lời với đoạn lỗi tô sáng tại chỗ. Lỗi lặp lại gạch chân liền, lỗi đơn lẻ gạch chấm
 * (không phân biệt chỉ bằng màu). Bấm vào đoạn lỗi → nhảy tới nhận xét tương ứng.
 */
export default function AnnotatedResponse({ segments }: AnnotatedResponseProps) {
    return (
        <p className="bg-card p-4 border border-sub2/30 rounded-xl font-medium text-main text-sm leading-7 whitespace-pre-line">
            {segments.map(({ text, placed }, i) => {
                if (!placed) return <Fragment key={i}>{text}</Fragment>;
                const { annotation, number } = placed;
                const isRecurring = annotation.mistake_pattern_id !== null;

                return (
                    <a
                        key={annotation.id}
                        href={`#fix-${annotation.id}`}
                        aria-label={`Lỗi ${number}: ${text}`}
                        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
                    >
                        <mark
                            id={`ann-${annotation.id}`}
                            className={cn(
                                'px-0.5 rounded text-main underline underline-offset-4 decoration-2 scroll-mt-24',
                                'target:ring-2 target:ring-main transition-shadow',
                                isRecurring ? 'bg-sub3/30 decoration-sub3' : 'bg-sub1 decoration-sub2 decoration-dotted',
                            )}
                        >
                            {text}
                            <sup className="ml-0.5 font-bold text-[0.6875rem] text-main">{number}</sup>
                        </mark>
                    </a>
                );
            })}
        </p>
    );
}
