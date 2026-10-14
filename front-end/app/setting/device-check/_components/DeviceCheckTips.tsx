import { LuArrowRight, LuLifeBuoy, LuLightbulb } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StepId } from '../types';
import { SPEAKING_CHECK_IDS, STEP_TIPS } from '../utils';

interface DeviceCheckTipsProps {
    stepId: StepId;
    onSkipToWriting: () => void;
    className?: string;
}

/** Gợi ý xử lý sự cố theo bước đang mở, kèm lối tắt cho người chỉ luyện Writing. */
export default function DeviceCheckTips({ stepId, onSkipToWriting, className }: DeviceCheckTipsProps) {
    const isSummary = stepId === 'summary';
    const isSpeakingStep = SPEAKING_CHECK_IDS.some((id) => id === stepId);

    return (
        <aside aria-labelledby="device-check-tips-title" className={cn('flex flex-col gap-4', className)}>
            <div className="flex flex-col gap-4 bg-white shadow-sm p-5 border border-sub2/30 rounded-xl">
                <h2 id="device-check-tips-title" className="flex items-center gap-2 font-bold text-main text-base">
                    {isSummary ? (
                        <LuLightbulb className="size-5 text-sub2" aria-hidden="true" />
                    ) : (
                        <LuLifeBuoy className="size-5 text-sub2" aria-hidden="true" />
                    )}
                    {isSummary ? 'Mẹo trước giờ luyện thi' : 'Gặp sự cố?'}
                </h2>
                <ul className="flex flex-col gap-3">
                    {STEP_TIPS[stepId].map(({ title, description, Icon }) => (
                        <li key={title} className="flex items-start gap-3 bg-sub1/40 p-3 rounded-lg">
                            <Icon className="mt-0.5 size-4 text-sub2 shrink-0" aria-hidden="true" />
                            <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-main text-sm">{title}</span>
                                <span className="text-subText text-xs leading-relaxed">{description}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {isSpeakingStep && (
                <div className="flex flex-col gap-3 bg-main p-5 rounded-xl">
                    <span className="font-semibold text-sub2 text-xs uppercase tracking-wider">Chỉ luyện Writing?</span>
                    <p className="text-sub1 text-sm leading-relaxed">
                        Phần Writing không cần loa và micro. Bạn có thể bỏ qua và chuyển thẳng tới bước kiểm tra bàn
                        phím.
                    </p>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={onSkipToWriting}
                        className="gap-2 self-start"
                    >
                        Đến bước bàn phím
                        <LuArrowRight className="size-4" aria-hidden="true" />
                    </Button>
                </div>
            )}
        </aside>
    );
}
