import Image from 'next/image';
import { LuEye } from 'react-icons/lu';

interface PictureStimulusProps {
    imageUrl?: string;
    questionRef?: string;
}

export default function PictureStimulus({
    imageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuArNJ_Lf2NJC97I01eruFzGpEZ7a5POMcRENC_cJXo5siXfbHuJvPBIhQzYMv8fxfy05OZmvzLs72EVAkXrakjsh9VnVIUyhhcvMbEdqUs0uBGtLSnHWRMjG4zzHJzJ2jGCK_0M998vuu51YWxo7bUNxaHzUnAiOO0h_-v9pswoQ6BBsYN7Uu8cgko7XZmnaYxhWQ0M9GafIkMXlTt1sc66DL51vBglK7l8auV9Vgnq',
    questionRef = 'Q03-PHOTO-M04',
}: PictureStimulusProps) {
    return (
        <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tài liệu hình ảnh câu 3
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <LuEye className="size-4" aria-hidden="true" />
                    Khung nhìn đề thi tiêu chuẩn
                </span>
            </div>

            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-muted shadow-inner">
                <Image
                    src={imageUrl}
                    alt="TOEIC Speaking Part 2 Stimulus Image"
                    fill
                    unoptimized
                    className="pointer-events-none size-full select-none object-cover"
                />
                <div className="pointer-events-none absolute right-2.5 bottom-2.5 rounded bg-slate-900/80 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
                    ETS Question Reference: {questionRef}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
                <span className="italic">Mẹo: Miêu tả đối tượng chính, hoạt động, vị trí và không gian xung quanh.</span>
                <span className="font-semibold text-primary">Ảnh 1/1</span>
            </div>
        </div>
    );
}
