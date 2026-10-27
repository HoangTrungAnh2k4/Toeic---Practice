import { Fragment } from 'react';
import { ResponseSegment } from '../../_lib/annotate';

interface AnnotatedResponseProps {
    segments: ResponseSegment[];
}

/** Câu trả lời với đoạn lỗi tô sáng tại chỗ. Bấm vào đoạn lỗi → nhảy tới nhận xét tương ứng. */
export default function AnnotatedResponse({ segments }: AnnotatedResponseProps) {
    return (
        <p className="bg-card p-4 border border-sub2/30 rounded-xl font-medium text-main text-sm leading-7 whitespace-pre-line">
            {segments.map(({ text, placed }, i) => {
                if (!placed) return <Fragment key={i}>{text}</Fragment>;
                const { annotation, number } = placed;

                return (
                    <a
                        key={annotation.id}
                        href={`#fix-${annotation.id}`}
                        aria-label={`Lỗi ${number}: ${text}`}
                        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
                    >
                        <mark
                            id={`ann-${annotation.id}`}
                            className="bg-sub3/30 px-0.5 rounded target:ring-2 target:ring-main text-main underline underline-offset-4 decoration-2 decoration-sub3 transition-shadow scroll-mt-24"
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
