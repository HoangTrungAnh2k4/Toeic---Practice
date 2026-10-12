'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useMicrophone } from '../_lib/useMicrophone';
import { CheckId, CheckStatus, CheckStatuses, StepId } from '../types';
import {
    CHECK_IDS,
    DEVICE_CHECK_STEPS,
    evaluateTyping,
    INITIAL_CHECK_STATUSES,
    isCheckId,
    isMicIssue,
    MIC_STEP_IDS,
    STEP_IDS,
    TYPING_STATUS,
} from '../utils';
import CheckStatusBadge from './CheckStatusBadge';
import DeviceCheckStepper from './DeviceCheckStepper';
import DeviceCheckTips from './DeviceCheckTips';
import KeyboardCheckPanel from './KeyboardCheckPanel';
import MicrophoneCheckPanel from './MicrophoneCheckPanel';
import ReadySummaryPanel from './ReadySummaryPanel';
import RecordingCheckPanel from './RecordingCheckPanel';
import SpeakerCheckPanel from './SpeakerCheckPanel';

export default function DeviceCheckWizard() {
    const [activeStep, setActiveStep] = useState<StepId>('speaker');
    const [results, setResults] = useState<CheckStatuses>(INITIAL_CHECK_STATUSES);
    const [typedText, setTypedText] = useState('');
    const mic = useMicrophone();
    const headingId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    /** Chỉ chuyển focus khi người dùng đổi bước, không cướp focus lúc trang vừa tải. */
    const shouldFocusHeadingRef = useRef(false);

    // Micro đang báo lỗi thì mục Micro tính là chưa đạt cho tới khi được khắc phục.
    const statuses: CheckStatuses = {
        ...results,
        microphone: isMicIssue(mic.status) ? 'failed' : results.microphone,
    };
    const isAllPassed = CHECK_IDS.every((id) => statuses[id] === 'passed');

    const stepIndex = STEP_IDS.indexOf(activeStep);
    const step = DEVICE_CHECK_STEPS[activeStep];
    const prevStepId: StepId | undefined = STEP_IDS[stepIndex - 1];
    const nextStepId: StepId | undefined = STEP_IDS[stepIndex + 1];
    const currentStatus = isCheckId(activeStep) ? statuses[activeStep] : 'pending';
    const isLastCheck = nextStepId === 'summary';
    const isNextPrimary = currentStatus === 'passed' || isLastCheck;
    const nextLabel = isLastCheck ? 'Xem kết quả' : currentStatus === 'passed' ? 'Tiếp tục' : 'Bỏ qua bước này';
    const deviceLabel =
        mic.devices.find((device) => device.id === mic.deviceId)?.label ?? 'Micro mặc định của hệ thống';

    useEffect(() => {
        if (!shouldFocusHeadingRef.current) return;
        shouldFocusHeadingRef.current = false;
        const panel = panelRef.current;
        if (panel && panel.getBoundingClientRect().top < 0) panel.scrollIntoView({ block: 'start' });
        headingRef.current?.focus({ preventScroll: true });
    }, [activeStep]);

    const setResult = (check: CheckId, status: CheckStatus) =>
        setResults((current) => (current[check] === status ? current : { ...current, [check]: status }));

    const goToStep = (target: StepId) => {
        if (target === activeStep) return;
        // Chỉ giữ micro ở các bước cần dùng; quay lại thì tự bật nếu người dùng đã từng cho phép.
        if (!MIC_STEP_IDS.includes(target)) {
            mic.stop();
        } else if (mic.hasAccess && mic.status !== 'active' && mic.status !== 'requesting') {
            void mic.start(mic.deviceId || undefined);
        }
        shouldFocusHeadingRef.current = true;
        setActiveStep(target);
    };

    const handleRequestAccess = () => {
        void mic.start(mic.deviceId || undefined);
    };

    const handleSelectDevice = (deviceId: string) => {
        setResult('microphone', 'pending');
        void mic.start(deviceId);
    };

    const handleTypingChange = (value: string) => {
        setTypedText(value);
        setResult('keyboard', TYPING_STATUS[evaluateTyping(value).state]);
    };

    const handleRestart = () => {
        setResults(INITIAL_CHECK_STATUSES);
        setTypedText('');
        goToStep('speaker');
    };

    const renderPanel = () => {
        switch (activeStep) {
            case 'speaker':
                return (
                    <SpeakerCheckPanel
                        result={statuses.speaker}
                        onResultChange={(status) => setResult('speaker', status)}
                    />
                );
            case 'microphone':
                return (
                    <MicrophoneCheckPanel
                        status={mic.status}
                        hasAccess={mic.hasAccess}
                        devices={mic.devices}
                        deviceId={mic.deviceId}
                        analyser={mic.analyser}
                        result={statuses.microphone}
                        onRequestAccess={handleRequestAccess}
                        onSelectDevice={handleSelectDevice}
                        onSpeechDetected={() => setResult('microphone', 'passed')}
                    />
                );
            case 'recording':
                return (
                    <RecordingCheckPanel
                        micStatus={mic.status}
                        hasMicAccess={mic.hasAccess}
                        stream={mic.stream}
                        analyser={mic.analyser}
                        deviceLabel={deviceLabel}
                        result={statuses.recording}
                        onResultChange={(status) => setResult('recording', status)}
                        onRequestAccess={handleRequestAccess}
                        onChangeMicrophone={() => goToStep('microphone')}
                    />
                );
            case 'keyboard':
                return <KeyboardCheckPanel value={typedText} onChange={handleTypingChange} />;
            case 'summary':
                return <ReadySummaryPanel statuses={statuses} onSelectStep={goToStep} onRestart={handleRestart} />;
        }
    };

    return (
        <div className="@container flex flex-col gap-6">
            <DeviceCheckStepper
                activeStep={activeStep}
                statuses={{ ...statuses, summary: isAllPassed ? 'passed' : 'pending' }}
                onSelectStep={goToStep}
            />

            <div className="items-start gap-6 grid grid-cols-1 @4xl:grid-cols-12">
                <Card
                    ref={panelRef}
                    role="region"
                    aria-labelledby={headingId}
                    className="@4xl:col-span-8 gap-0 bg-white shadow-sm py-0 border border-sub2/30 ring-0 text-main scroll-mt-4"
                >
                    <CardHeader className="gap-3 px-5 @md:px-6 pt-5 @md:pt-6">
                        <div className="flex items-start gap-3">
                            <span className="flex justify-center items-center bg-sub1 rounded-lg size-11 text-main shrink-0">
                                <step.Icon className="size-5" aria-hidden="true" />
                            </span>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-sub2 text-xs uppercase tracking-wider">
                                    Bước {stepIndex + 1}/{STEP_IDS.length}
                                </span>
                                <h2
                                    ref={headingRef}
                                    id={headingId}
                                    tabIndex={-1}
                                    className="font-bold text-main text-lg outline-none"
                                >
                                    {step.title}
                                </h2>
                                <p className="text-subText text-sm leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                        {isCheckId(activeStep) && (
                            <CardAction>
                                <CheckStatusBadge status={statuses[activeStep]} />
                            </CardAction>
                        )}
                    </CardHeader>

                    <CardContent className="@container px-5 @md:px-6 py-5">{renderPanel()}</CardContent>

                    <CardFooter className="@md:flex-row flex-col-reverse @md:justify-between items-stretch @md:items-center gap-3 bg-sub1/30 px-5 @md:px-6 py-4 border-sub2/20">
                        {prevStepId && (
                            <Button
                                type="button"
                                variant="third"
                                size="md"
                                onClick={() => goToStep(prevStepId)}
                                className="gap-2 bg-white"
                            >
                                <LuArrowLeft className="size-4" aria-hidden="true" />
                                Bước trước
                            </Button>
                        )}
                        {nextStepId && (
                            <Button
                                type="button"
                                variant={isNextPrimary ? 'primary' : 'third'}
                                size="md"
                                onClick={() => goToStep(nextStepId)}
                                className={cn('gap-2 @md:ml-auto', !isNextPrimary && 'bg-white')}
                            >
                                {nextLabel}
                                <LuArrowRight className="size-4" aria-hidden="true" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                <DeviceCheckTips
                    stepId={activeStep}
                    onSkipToWriting={() => goToStep('keyboard')}
                    className="@4xl:col-span-4"
                />
            </div>
        </div>
    );
}
