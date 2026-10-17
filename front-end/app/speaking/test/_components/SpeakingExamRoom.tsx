'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useState } from 'react';
import { LuInfo, LuTriangleAlert } from 'react-icons/lu';
import type { AttemptMode, Exam } from '@/lib/domain/types';
import type { RoomPart } from '@/lib/exam-library/room';
import { getAttemptHref } from '@/app/setting/history/utils';
import MicrophoneAccessNotice from '@/app/setting/device-check/_components/MicrophoneAccessNotice';
import { useMicrophone } from '@/app/setting/device-check/_lib/useMicrophone';
import { useAnswerRecorder } from '../_lib/useAnswerRecorder';
import { useSpeakingAttempt } from '../_lib/useSpeakingAttempt';
import type { SpeakingPhase } from '../types';
import { PART_DIRECTIONS } from '../utils';
import AudioCaptureHud from './AudioCaptureHud';
import DirectionsBanner from './DirectionsBanner';
import ExamHeader from './ExamHeader';
import ExitConfirmDialog from './ExitConfirmDialog';
import PictureStimulus from './PictureStimulus';
import QuestionProgression from './QuestionProgression';
import QuestionStimulus from './QuestionStimulus';

export interface SpeakingExamRoomProps {
    exam: Exam;
    parts: RoomPart[];
    mode: AttemptMode;
}

/** Trải các Part thành danh sách câu theo thứ tự thi, kèm thời gian & ngữ liệu của Part. */
function toSteps(parts: RoomPart[]) {
    return parts.flatMap(({ template, part, questions }) =>
        questions.map((question, index) => ({
            question,
            template,
            context: part.context,
            prepSec: template.prep_sec ?? 0,
            speakSec: template.response_sec?.[index] ?? 30,
        })),
    );
}

type Step = ReturnType<typeof toSteps>[number];

/** Giai đoạn đầu của câu và số giây của giai đoạn đó; Part không có thời gian chuẩn bị thì vào nói luôn. */
function startOf(step: Step): { phase: SpeakingPhase; seconds: number } {
    return step.prepSec > 0 ? { phase: 'prep', seconds: step.prepSec } : { phase: 'speak', seconds: step.speakSec };
}

/**
 * Phòng thi Speaking: mỗi câu chuẩn bị (không ghi âm) → trả lời (ghi âm) → chốt bài, gửi đi chấm khi chốt câu; đồng hồ chỉ chạy khi micro đang hoạt động.
 * shortcut: rời phòng giữa chừng thì attempt vẫn `in_progress`, câu chưa chấm mất audio và không làm tiếp được — E2-4.
 */
export default function SpeakingExamRoom({ exam, parts, mode }: SpeakingExamRoomProps) {
    const router = useRouter();
    const steps = toSteps(parts);
    const [currentIndex, setCurrentIndex] = useState(0);
    const step = steps[currentIndex];
    const [phase, setPhase] = useState(() => startOf(step).phase);
    const [secondsRemaining, setSecondsRemaining] = useState(() => startOf(step).seconds);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const mic = useMicrophone();
    const { start: startRecording, stop: stopRecording } = useAnswerRecorder(mic.stream);
    const { scoreAudio, submit, getAttempt } = useSpeakingAttempt(
        exam.id,
        mode,
        steps.map(({ question }) => question),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitFailed, setSubmitFailed] = useState(false);
    const isMicReady = mic.status === 'active';

    /** Chốt bài nói của câu hiện tại và gửi đi chấm; gọi lại khi đã chốt thì không gửi lại. */
    const saveAnswer = async () => {
        const blob = await stopRecording();
        if (blob) scoreAudio(step.question.id, blob, step.template.part_no);
    };

    const startSpeaking = () => {
        setPhase('speak');
        setSecondsRemaining(step.speakSec);
    };

    const tick = useEffectEvent(() => {
        if (secondsRemaining > 1) setSecondsRemaining(secondsRemaining - 1);
        else if (phase === 'prep') startSpeaking();
        else {
            setSecondsRemaining(0);
            setPhase('done');
            void saveAnswer();
        }
    });
    const startAnswer = useEffectEvent(() => {
        if (phase === 'speak') startRecording();
    });

    // Ghi khi vào giai đoạn trả lời (kể cả câu mới không có chuẩn bị) hoặc micro vừa bật lại
    useEffect(() => {
        if (mic.stream) startAnswer();
    }, [mic.stream, currentIndex, phase]);

    useEffect(() => {
        if (!isMicReady || phase === 'done') return;
        const timer = setTimeout(tick, 1000);
        return () => clearTimeout(timer);
    }, [isMicReady, phase, secondsRemaining]);

    const isGuided = mode === 'guided';
    const isLast = currentIndex === steps.length - 1;
    // Chế độ có hướng dẫn không khóa thời gian: được chuyển câu bất cứ lúc nào
    const canProceed = !isSubmitting && (isGuided || phase === 'done');

    const handleNext = async () => {
        await saveAnswer();
        if (isLast) {
            setIsSubmitting(true);
            setSubmitFailed(false);
            if ((await submit()) !== 'error') {
                // Hết lượt chấm (`limit`) vẫn nộp được; trang kết quả ghi rõ câu chưa có điểm
                router.push(getAttemptHref((await getAttempt()).id));
                return;
            }
            setIsSubmitting(false);
            setSubmitFailed(true);
            return;
        }
        const next = startOf(steps[currentIndex + 1]);
        setCurrentIndex(currentIndex + 1);
        setPhase(next.phase);
        setSecondsRemaining(next.seconds);
    };

    return (
        <div className="flex flex-col bg-transparent min-h-[calc(100vh-2rem)] overflow-hidden">
            <ExamHeader
                title={exam.title}
                mode={mode}
                prepSec={step.prepSec}
                speakSec={step.speakSec}
                phase={phase}
                secondsRemaining={secondsRemaining}
                onOpenExitModal={() => setIsExitModalOpen(true)}
            />

            <main className="flex flex-col flex-1 gap-6 mt-6 w-full max-w-6xl">
                <p
                    role="note"
                    className="flex items-start gap-2 bg-sub3/10 px-4 py-3 border border-sub3/50 rounded-xl text-main text-xs leading-relaxed"
                >
                    <LuInfo className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    Bài nói được chấm ngay sau mỗi câu và không được lưu lại: Part 1 gửi Microsoft Azure, Part 2–5 gửi
                    Groq để chuyển thành chữ rồi Google Gemma chấm điểm.
                </p>

                <DirectionsBanner
                    title={step.template.task}
                    directions={PART_DIRECTIONS[step.template.part_no]}
                    currentQuestion={step.question.number}
                    totalQuestions={steps.length}
                    prepareSeconds={step.prepSec}
                    speakSeconds={step.speakSec}
                />

                <div className="items-stretch gap-6 grid grid-cols-1 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        {step.question.image_path ? (
                            <PictureStimulus
                                imageUrl={step.question.image_path}
                                imageAlt={step.question.image_alt}
                                questionRef={`${exam.code} · Q${step.question.number}`}
                                questionNumber={step.question.number}
                            />
                        ) : (
                            <QuestionStimulus
                                question={step.question}
                                context={step.context}
                                isReadAloud={step.template.part_no === 1}
                            />
                        )}
                    </div>

                    <div className="lg:col-span-5">
                        {isMicReady ? (
                            <AudioCaptureHud
                                phase={phase}
                                secondsRemaining={secondsRemaining}
                                totalSeconds={phase === 'prep' ? step.prepSec : step.speakSec}
                                analyser={mic.analyser}
                                isGuided={isGuided}
                                onSkipPrep={startSpeaking}
                            />
                        ) : (
                            <MicrophoneAccessNotice
                                status={mic.status}
                                hasAccess={mic.hasAccess}
                                onRequestAccess={() => void mic.start(mic.deviceId || undefined)}
                                privacyNote="Bài nói được gửi đi chấm điểm rồi bỏ, không được lưu lại."
                            />
                        )}
                    </div>
                </div>
            </main>

            {submitFailed && (
                <p
                    role="alert"
                    className="flex items-start gap-2 bg-destructive/10 mt-6 px-4 py-3 border border-destructive/40 rounded-xl text-destructive text-xs leading-relaxed"
                >
                    <LuTriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    Chưa chấm xong bài nói. Kiểm tra kết nối mạng rồi bấm Kết thúc lần nữa; bản ghi vẫn còn trên máy
                    cho tới khi bạn rời phòng thi.
                </p>
            )}

            <QuestionProgression
                questions={steps.map(({ question, template }) => ({ number: question.number, task: template.task }))}
                currentIndex={currentIndex}
                speakSec={step.speakSec}
                isGuided={isGuided}
                canProceed={canProceed}
                isLast={isLast}
                isSubmitting={isSubmitting}
                onNextQuestion={() => void handleNext()}
            />

            <ExitConfirmDialog
                isOpen={isExitModalOpen}
                examTitle={exam.title}
                currentQuestion={step.question.number}
                totalQuestions={steps.length}
                onClose={() => setIsExitModalOpen(false)}
                onConfirm={() => router.push('/speaking')}
            />
        </div>
    );
}
