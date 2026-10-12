import { LuCheck, LuX } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { CheckStatus, StepId } from '../types';
import { CHECK_STATUS_LABEL, DEVICE_CHECK_STEPS, STEP_IDS } from '../utils';

const CIRCLE_CLASS: Record<CheckStatus, string> = {
    passed: 'bg-success text-main',
    failed: 'bg-destructive text-white',
    pending: 'bg-sub1 text-main',
};

interface DeviceCheckStepperProps {
    activeStep: StepId;
    statuses: Record<StepId, CheckStatus>;
    onSelectStep: (step: StepId) => void;
}

function getStatusLabel(stepId: StepId, status: CheckStatus, isActive: boolean): string {
    if (stepId === 'summary') return status === 'passed' ? 'Hoàn tất' : 'Tổng kết';
    if (isActive && status === 'pending') return 'Đang kiểm tra';
    return CHECK_STATUS_LABEL[status];
}

export default function DeviceCheckStepper({ activeStep, statuses, onSelectStep }: DeviceCheckStepperProps) {
    const activeIndex = STEP_IDS.indexOf(activeStep);

    return (
        <nav
            aria-label="Các bước kiểm tra thiết bị"
            className="@container bg-white shadow-sm p-3 @xl:p-4 border border-sub2/30 rounded-xl"
        >
            <ol className="gap-2 grid grid-cols-5">
                {STEP_IDS.map((stepId, index) => {
                    const { title } = DEVICE_CHECK_STEPS[stepId];
                    const status = statuses[stepId];
                    const isActive = stepId === activeStep;
                    const statusLabel = getStatusLabel(stepId, status, isActive);

                    return (
                        <li key={stepId}>
                            <button
                                type="button"
                                onClick={() => onSelectStep(stepId)}
                                aria-current={isActive ? 'step' : undefined}
                                className={cn(
                                    'flex flex-col items-center @xl:items-start gap-2 p-2 @xl:p-3 rounded-lg w-full h-full text-left transition-colors cursor-pointer',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
                                    isActive ? 'bg-main shadow-sm' : 'hover:bg-sub1/60',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex justify-center items-center rounded-full size-8 font-bold text-sm transition-colors shrink-0',
                                        isActive && status === 'pending' ? 'bg-sub3 text-main' : CIRCLE_CLASS[status],
                                    )}
                                >
                                    {status === 'passed' && <LuCheck className="size-4" aria-hidden="true" />}
                                    {status === 'failed' && <LuX className="size-4" aria-hidden="true" />}
                                    {status === 'pending' && index + 1}
                                </span>
                                <span className="hidden @xl:flex flex-col min-w-0 max-w-full">
                                    <span
                                        className={cn(
                                            'font-semibold text-xs uppercase tracking-wider',
                                            isActive ? 'text-sub3' : 'text-sub2',
                                        )}
                                    >
                                        {statusLabel}
                                    </span>
                                    <span
                                        className={cn(
                                            'font-semibold text-sm leading-snug',
                                            isActive ? 'text-white' : 'text-main',
                                        )}
                                    >
                                        {title}
                                    </span>
                                </span>
                                <span className="@xl:hidden sr-only">
                                    {`Bước ${index + 1}: ${title}, ${statusLabel}`}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>

            {/* Màn hẹp chỉ hiện vòng tròn, nên ghi tên bước đang mở bên dưới */}
            <p aria-hidden="true" className="@xl:hidden mt-3 font-semibold text-main text-sm text-center">
                Bước {activeIndex + 1}/{STEP_IDS.length} · {DEVICE_CHECK_STEPS[activeStep].title}
            </p>
        </nav>
    );
}
