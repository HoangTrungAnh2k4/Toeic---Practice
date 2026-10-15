import Image from 'next/image';
import { LuLightbulb } from 'react-icons/lu';

interface PictureStimulusProps {
    imageUrl: string;
    imageAlt: string | null;
    questionRef: string;
    questionNumber: number;
}

const DESCRIBE_CUES = ['Đối tượng chính', 'Hoạt động', 'Vị trí', 'Không gian xung quanh'];

export default function PictureStimulus({ imageUrl, imageAlt, questionRef, questionNumber }: PictureStimulusProps) {
    return (
        <figure className="flex flex-col gap-4 bg-white p-4 border border-sub1 rounded-2xl h-full">
            <div className="relative bg-sub1 rounded-xl w-full aspect-4/3 overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={imageAlt ?? `Hình ảnh đề thi câu ${questionNumber}, cần miêu tả bằng tiếng Anh`}
                    fill
                    unoptimized
                    className="size-full object-cover pointer-events-none select-none"
                />
                <figcaption className="right-3 bottom-3 absolute bg-main/90 backdrop-blur-xs px-2.5 py-1 rounded-md font-medium tabular-nums text-sub1 text-xs">
                    {questionRef}
                </figcaption>
            </div>

            <div className="flex flex-col gap-3 px-1 pb-1">
                <p className="flex items-center gap-2 font-semibold text-main text-sm">
                    <LuLightbulb className="size-4 text-sub3" aria-hidden="true" />
                    Khi miêu tả, hãy nhắc tới
                </p>
                <ul className="flex flex-wrap gap-2">
                    {DESCRIBE_CUES.map((cue) => (
                        <li
                            key={cue}
                            className="flex items-center gap-2 bg-sub1/60 px-3 py-1.5 rounded-full text-main text-xs"
                        >
                            <span className="bg-sub2 rounded-full size-1.5" aria-hidden="true" />
                            {cue}
                        </li>
                    ))}
                </ul>
            </div>
        </figure>
    );
}
