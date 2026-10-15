import { LuMic, LuTimer } from 'react-icons/lu';

import { cn } from '@/lib/utils';

type Props = {
    compact?: boolean;
    title: string;
    directions: string;
    currentQuestion: number;
    totalQuestions: number;
    prepareSeconds: number;
    speakSeconds: number;
};

export default function DirectionsBanner({
    compact = false,
    title,
    directions,
    currentQuestion,
    totalQuestions,
    prepareSeconds,
    speakSeconds,
}: Props) {
    return (
        <section
            aria-labelledby="directions-title"
            className="flex flex-col gap-4 bg-white p-5 border border-sub1 rounded-2xl"
        >
            <div className="flex flex-wrap justify-between items-end gap-x-6 gap-y-4">
                <div className="flex flex-col gap-2">
                    <p className="font-medium text-sub2 text-xs">
                        Câu {currentQuestion} trên {totalQuestions}
                    </p>
                    <h2 id="directions-title" className="font-semibold text-main text-xl sm:text-2xl">
                        {title}
                    </h2>
                    <div
                        role="progressbar"
                        aria-label="Tiến độ bài thi"
                        aria-valuenow={currentQuestion}
                        aria-valuemin={1}
                        aria-valuemax={totalQuestions}
                        className="flex gap-1 w-48"
                    >
                        {Array.from({ length: totalQuestions }, (_, idx) => (
                            <span
                                key={idx}
                                className={cn(
                                    'flex-1 rounded-full h-1.5',
                                    idx + 1 < currentQuestion && 'bg-main',
                                    idx + 1 === currentQuestion && 'bg-sub3',
                                    idx + 1 > currentQuestion && 'bg-sub1',
                                )}
                            />
                        ))}
                    </div>
                </div>

                <ol className="flex items-stretch gap-2 text-sm" aria-label="Các giai đoạn của câu hỏi">
                    <li className="flex items-center gap-2 bg-sub1/60 px-3 py-2 rounded-lg text-main">
                        <LuTimer className="size-4 text-sub2" aria-hidden="true" />
                        <span>
                            Chuẩn bị <strong className="font-semibold tabular-nums">{prepareSeconds}s</strong>
                        </span>
                    </li>
                    <li className="flex items-center gap-2 bg-sub3/15 px-3 py-2 border border-sub3/50 rounded-lg text-main">
                        <LuMic className="size-4" aria-hidden="true" />
                        <span>
                            Nói <strong className="font-semibold tabular-nums">{speakSeconds}s</strong>
                        </span>
                    </li>
                </ol>
            </div>

            {!compact && (
                <p className="pt-4 border-sub1 border-t max-w-3xl text-main/75 text-sm leading-relaxed">
                    <strong className="font-semibold text-main">Directions:</strong> {directions}
                </p>
            )}
        </section>
    );
}
