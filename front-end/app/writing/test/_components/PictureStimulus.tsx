import Image from 'next/image';
import { LuCheck, LuImage, LuKeyRound, LuListChecks } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import type { Question } from '@/lib/domain/types';

interface PictureStimulusProps {
    question: Question;
    /** Số câu trong nhóm, để hiển thị vị trí ảnh. */
    total: number;
    /** Dạng từ khóa thí sinh đã dùng (theo thứ tự `question.keywords`), `null` nếu chưa dùng. */
    keywordUsages: (string | null)[];
}

export default function PictureStimulus({ question, total, keywordUsages }: PictureStimulusProps) {
    const position = String(question.number).padStart(2, '0');
    const totalLabel = String(total).padStart(2, '0');

    return (
        <figure className="flex flex-col gap-4 bg-white shadow-sm p-4 border border-sub2/30 rounded-xl">
            <div className="relative bg-sub1 rounded-lg w-full aspect-4/3 overflow-hidden">
                <Image
                    src={question.image_path ?? ''}
                    alt={question.image_alt ?? `Hình ảnh câu ${question.number}`}
                    fill
                    unoptimized
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover pointer-events-none select-none"
                />
                <figcaption className="right-3 bottom-3 absolute flex items-center gap-1.5 bg-main/90 backdrop-blur-xs px-2.5 py-1 rounded-md font-medium tabular-nums text-sub1 text-xs">
                    <LuImage className="size-3.5" aria-hidden="true" />
                    Hình ảnh {position} / {totalLabel}
                </figcaption>
            </div>

            {/* Required keywords */}
            <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-3 bg-sub1/50 p-4 rounded-lg">
                <span className="flex items-center gap-2 font-bold text-main text-xs uppercase tracking-wider">
                    <LuKeyRound className="size-4 text-sub2" aria-hidden="true" />
                    Từ khóa bắt buộc
                </span>
                <ul className="flex flex-wrap items-center gap-2" aria-label="Từ khóa bắt buộc">
                    {(question.keywords ?? []).map((keyword, index) => {
                        const isUsed = Boolean(keywordUsages[index]);
                        return (
                            <li
                                key={keyword.word}
                                className={cn(
                                    'inline-flex items-center gap-1.5 shadow-sm px-4 py-1.5 border rounded-lg font-bold text-lg transition-colors',
                                    isUsed ? 'bg-main border-main text-sub3' : 'bg-white border-sub2/40 text-main',
                                )}
                            >
                                {isUsed && <LuCheck className="size-4" aria-hidden="true" />}
                                {keyword.word}
                                <span className="sr-only">{isUsed ? '(đã dùng)' : '(chưa dùng)'}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 px-1 text-subText text-xs">
                <span className="flex items-center gap-1.5">
                    <LuListChecks className="size-4 text-sub2" aria-hidden="true" />
                    Yêu cầu: đúng ngữ pháp, hợp nghĩa với tranh, dùng đủ 2 từ.
                </span>
                <span className="font-semibold text-main">Thang điểm: 0 – 3</span>
            </div>
        </figure>
    );
}
