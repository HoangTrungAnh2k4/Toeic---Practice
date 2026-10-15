import Link from 'next/link';
import { LuArrowRight, LuClock, LuRepeat } from 'react-icons/lu';
import { MistakeItem } from '@/app/mistakes/types';
import { CRITERION_LABEL, formatTimestamp, getMistakeHref, ONE_OFF_ICON, SEVERITY_META } from '@/app/mistakes/utils';
import { cn } from '@/lib/utils';
import { PlacedAnnotation } from '../../_lib/annotate';

interface AnnotationListProps {
    placed: PlacedAnnotation[];
    mistakeIndex: Record<string, MistakeItem>;
}

const CHIP_CLASS = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] tracking-wider';

export default function AnnotationList({ placed, mistakeIndex }: AnnotationListProps) {
    return (
        <div className="flex flex-col gap-2">
            <span className="font-semibold text-subText text-xs uppercase tracking-wider">Nhận xét & cách sửa</span>
            <ol className="flex flex-col gap-2">
                {placed.map(({ annotation, number, isHighlighted }) => {
                    const mistake = annotation.mistake_pattern_id ? mistakeIndex[annotation.mistake_pattern_id] : undefined;
                    const SeverityIcon = SEVERITY_META[annotation.severity].Icon;

                    return (
                        <li
                            key={annotation.id}
                            id={`fix-${annotation.id}`}
                            className="flex gap-3 p-3 border border-sub2/20 target:border-sub3 rounded-xl target:ring-2 target:ring-sub3 transition-shadow scroll-mt-24"
                        >
                            {isHighlighted ? (
                                <a
                                    href={`#ann-${annotation.id}`}
                                    aria-label={`Về vị trí lỗi ${number} trong câu trả lời`}
                                    className={cn(
                                        'flex justify-center items-center rounded-full size-6 font-bold text-xs shrink-0',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
                                        mistake ? 'bg-sub3 text-main' : 'bg-sub1 text-main',
                                    )}
                                >
                                    {number}
                                </a>
                            ) : (
                                <span className="flex justify-center items-center bg-sub1 rounded-full size-6 font-bold text-main text-xs shrink-0">
                                    {number}
                                </span>
                            )}

                            <div className="flex flex-col gap-2 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {mistake ? (
                                        <Link
                                            href={getMistakeHref(mistake.id)}
                                            className={cn(CHIP_CLASS, 'bg-sub3 text-main hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main')}
                                        >
                                            <LuRepeat className="size-3" aria-hidden="true" />
                                            Lỗi lặp lại: {mistake.title}
                                        </Link>
                                    ) : (
                                        <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>
                                            <ONE_OFF_ICON className="size-3" aria-hidden="true" />
                                            Lỗi đơn lẻ
                                        </span>
                                    )}
                                    <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>
                                        <SeverityIcon className="size-3" aria-hidden="true" />
                                        {CRITERION_LABEL[annotation.criterion]}
                                    </span>
                                    {annotation.at_sec !== null && (
                                        <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>
                                            <LuClock className="size-3" aria-hidden="true" />
                                            {formatTimestamp(annotation.at_sec)}
                                        </span>
                                    )}
                                </div>

                                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                    <del className="decoration-sub3 decoration-2 font-medium text-subText">{annotation.quote}</del>
                                    <LuArrowRight className="size-4 text-subText shrink-0" aria-hidden="true" />
                                    <span className="sr-only">sửa thành</span>
                                    <ins className="font-semibold text-main no-underline">{annotation.correction}</ins>
                                </p>
                                <p className="text-subText text-xs leading-relaxed">{annotation.explanation}</p>

                                {mistake && (
                                    <Link
                                        href={`${getMistakeHref(mistake.id)}#remedy`}
                                        className="inline-flex items-center gap-1 rounded-md w-fit font-semibold text-main text-xs hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
                                    >
                                        Xem cách khắc phục
                                        <LuArrowRight className="size-3.5" aria-hidden="true" />
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
