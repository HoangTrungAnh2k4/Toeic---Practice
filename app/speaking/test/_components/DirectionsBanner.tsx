import { LuMic, LuTimer } from 'react-icons/lu';

import { cn } from '@/lib/utils';

type Props = {
    compact?: boolean;
    currentQuestion?: number;
    totalQuestions?: number;
    prepareSeconds?: number;
    speakSeconds?: number;
};

export default function DirectionsBanner({
    compact = false,
    currentQuestion = 3,
    totalQuestions = 11,
    prepareSeconds = 45,
    speakSeconds = 30,
}: Props) {
    return (
        <section
            aria-labelledby="directions-title"
            className="flex flex-col gap-4 bg-white p-5 border border-[#E8E5F5] rounded-2xl"
        >
            <div className="flex flex-wrap justify-between items-end gap-x-6 gap-y-4">
                <div className="flex flex-col gap-2">
                    <p className="font-medium text-[#8B84B8] text-xs">
                        Câu {currentQuestion} trên {totalQuestions}
                    </p>
                    <h2 id="directions-title" className="font-semibold text-[#3C3454] text-xl sm:text-2xl">
                        Describe a Picture
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
                                    idx + 1 < currentQuestion && 'bg-[#3C3454]',
                                    idx + 1 === currentQuestion && 'bg-[#F5B841]',
                                    idx + 1 > currentQuestion && 'bg-[#E8E5F5]',
                                )}
                            />
                        ))}
                    </div>
                </div>

                <ol className="flex items-stretch gap-2 text-sm" aria-label="Các giai đoạn của câu hỏi">
                    <li className="flex items-center gap-2 bg-[#E8E5F5]/60 px-3 py-2 rounded-lg text-[#3C3454]">
                        <LuTimer className="size-4 text-[#8B84B8]" aria-hidden="true" />
                        <span>
                            Chuẩn bị <strong className="font-semibold tabular-nums">{prepareSeconds}s</strong>
                        </span>
                    </li>
                    <li className="flex items-center gap-2 bg-[#F5B841]/15 px-3 py-2 border border-[#F5B841]/50 rounded-lg text-[#3C3454]">
                        <LuMic className="size-4" aria-hidden="true" />
                        <span>
                            Nói <strong className="font-semibold tabular-nums">{speakSeconds}s</strong>
                        </span>
                    </li>
                </ol>
            </div>

            {!compact && (
                <p className="pt-4 border-[#E8E5F5] border-t max-w-3xl text-[#3C3454]/75 text-sm leading-relaxed">
                    <strong className="font-semibold text-[#3C3454]">Directions:</strong> In this part of the test, you
                    will describe the picture on your screen in as much detail as you can. You will have{' '}
                    {prepareSeconds} seconds to prepare your response. Then you will have {speakSeconds} seconds to
                    speak about the picture.
                </p>
            )}
        </section>
    );
}
