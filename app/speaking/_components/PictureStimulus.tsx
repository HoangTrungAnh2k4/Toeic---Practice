import Image from 'next/image';
import { LuLightbulb } from 'react-icons/lu';

interface PictureStimulusProps {
    imageUrl?: string;
    questionRef?: string;
    questionNumber?: number;
}

const DESCRIBE_CUES = ['Đối tượng chính', 'Hoạt động', 'Vị trí', 'Không gian xung quanh'];

export default function PictureStimulus({
    imageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuArNJ_Lf2NJC97I01eruFzGpEZ7a5POMcRENC_cJXo5siXfbHuJvPBIhQzYMv8fxfy05OZmvzLs72EVAkXrakjsh9VnVIUyhhcvMbEdqUs0uBGtLSnHWRMjG4zzHJzJ2jGCK_0M998vuu51YWxo7bUNxaHzUnAiOO0h_-v9pswoQ6BBsYN7Uu8cgko7XZmnaYxhWQ0M9GafIkMXlTt1sc66DL51vBglK7l8auV9Vgnq',
    questionRef = 'Q03-PHOTO-M04',
    questionNumber = 3,
}: PictureStimulusProps) {
    return (
        <figure className="flex flex-col gap-4 bg-white p-4 border border-[#E8E5F5] rounded-2xl h-full">
            <div className="relative bg-[#E8E5F5] rounded-xl w-full aspect-4/3 overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={`Hình ảnh đề thi câu ${questionNumber}, cần miêu tả bằng tiếng Anh`}
                    fill
                    unoptimized
                    className="size-full object-cover pointer-events-none select-none"
                />
                <figcaption className="right-3 bottom-3 absolute bg-[#3C3454]/90 backdrop-blur-xs px-2.5 py-1 rounded-md font-medium tabular-nums text-[#E8E5F5] text-xs">
                    {questionRef}
                </figcaption>
            </div>

            <div className="flex flex-col gap-3 px-1 pb-1">
                <p className="flex items-center gap-2 font-semibold text-[#3C3454] text-sm">
                    <LuLightbulb className="size-4 text-[#F5B841]" aria-hidden="true" />
                    Khi miêu tả, hãy nhắc tới
                </p>
                <ul className="flex flex-wrap gap-2">
                    {DESCRIBE_CUES.map((cue) => (
                        <li
                            key={cue}
                            className="flex items-center gap-2 bg-[#E8E5F5]/60 px-3 py-1.5 rounded-full text-[#3C3454] text-xs"
                        >
                            <span className="bg-[#8B84B8] rounded-full size-1.5" aria-hidden="true" />
                            {cue}
                        </li>
                    ))}
                </ul>
            </div>
        </figure>
    );
}
