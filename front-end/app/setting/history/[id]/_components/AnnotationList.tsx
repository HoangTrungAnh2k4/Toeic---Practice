import { LuArrowRight, LuClock } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { PlacedAnnotation } from '../../_lib/annotate';
import { CRITERION_LABEL, formatTimestamp, SEVERITY_ICON } from '../../utils';

interface AnnotationListProps {
    placed: PlacedAnnotation[];
}

const CHIP_CLASS = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] tracking-wider';

export default function AnnotationList({ placed }: AnnotationListProps) {
    return (
        <div className="flex flex-col gap-2">
            <span className="font-semibold text-subText text-xs uppercase tracking-wider">Cách sửa</span>
            <ol className="flex flex-col gap-2">
                {placed.map(({ annotation, number, isHighlighted }) => {
                    const SeverityIcon = SEVERITY_ICON[annotation.severity];

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
                                        'flex justify-center items-center bg-sub1 rounded-full size-6 font-bold text-main text-xs shrink-0',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
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
                                    <del className="font-medium text-subText decoration-2 decoration-sub3">{annotation.quote}</del>
                                    <LuArrowRight className="size-4 text-subText shrink-0" aria-hidden="true" />
                                    <span className="sr-only">sửa thành</span>
                                    <ins className="font-semibold text-main no-underline">{annotation.correction}</ins>
                                </p>
                                <p className="text-subText text-xs leading-relaxed">{annotation.explanation}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
