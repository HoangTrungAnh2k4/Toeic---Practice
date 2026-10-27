'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useState } from 'react';
import { LuInfo, LuRotateCw, LuTriangleAlert } from 'react-icons/lu';
import Button, { buttonVariants } from '@/components/ui/button';
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
            // Part 4: câu đầu có thêm thời gian đọc thông tin trước phần chuẩn bị
            readSec: index === 0 ? (template.context_sec ?? 0) : 0,
            prepSec: template.prep_sec ?? 0,
            speakSec: template.response_sec?.[index] ?? 30,
        })),
    );
}

type Step = ReturnType<typeof toSteps>[number];

/**
 * Giai đoạn đầu của câu và số giây của giai đoạn đó: đọc thông tin (tính là chuẩn bị, chưa ghi âm) → chuẩn bị;
 * Part không có thời gian chuẩn bị thì vào nói luôn.
 */
function startOf(step: Step): { phase: SpeakingPhase; seconds: number; isReading: boolean } {
    if (step.readSec > 0) return { phase: 'prep', seconds: step.readSec, isReading: true };
    return step.prepSec > 0
        ? { phase: 'prep', seconds: step.prepSec, isReading: false }
        : { phase: 'speak', seconds: step.speakSec, isReading: false };
}

/** Mở lượt làm (tiếp tục lượt dở hoặc tạo mới) rồi vào phòng thi từ câu đầu tiên chưa được chấm. */
export default function SpeakingExamRoom({ exam, parts, mode }: SpeakingExamRoomProps) {
    const steps = toSteps(parts);
    const session = useSpeakingAttempt(
        exam.id,
        mode,
        steps.map(({ question }) => question),
    );

    if (session.loadError) {
        return (
            <div
                role="alert"
                className="flex flex-col items-center gap-3 bg-white shadow-sm mx-auto mt-6 px-4 py-12 border border-sub2/30 rounded-xl w-full max-w-6xl text-center"
            >
                <LuTriangleAlert className="size-8 text-destructive" aria-hidden="true" />
                <p className="font-semibold text-main text-sm">Không mở được phòng thi</p>
                <p className="text-subText text-xs">Kiểm tra kết nối mạng rồi thử lại.</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Button type="button" variant="primary" size="sm" className="gap-2" onClick={session.retryLoad}>
                        <LuRotateCw className="size-4" aria-hidden="true" />
                        Thử lại
                    </Button>
                    <Link href="/speaking" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        Về thư viện đề
                    </Link>
                </div>
            </div>
        );
    }

    if (!session.attempt) {
        return (
            <p role="status" className="p-6 text-subText text-sm">
                Đang chuẩn bị phòng thi Speaking...
            </p>
        );
    }

    const firstOpen = steps.findIndex(({ question }) => !session.answeredIds.has(question.id));
    return (
        <SpeakingExamSession
            exam={exam}
            steps={steps}
            // Làm tiếp theo chế độ của lượt làm, không theo link vừa bấm
            mode={session.attempt.mode}
            attemptId={session.attempt.id}
            startIndex={firstOpen === -1 ? steps.length - 1 : firstOpen}
            isFinished={firstOpen === -1}
            session={session}
        />
    );
}

interface SpeakingExamSessionProps {
    exam: Exam;
    steps: Step[];
    mode: AttemptMode;
    attemptId: string;
    startIndex: number;
    /** Mọi câu đã được chấm ở lần trước: chỉ còn bấm Kết thúc để nộp. */
    isFinished: boolean;
    session: Pick<ReturnType<typeof useSpeakingAttempt>, 'scoreAudio' | 'submit' | 'leave'>;
}

/** Phòng thi Speaking: mỗi câu chuẩn bị (không ghi âm) → trả lời (ghi âm) → chốt bài, gửi đi chấm khi chốt câu; đồng hồ chỉ chạy khi micro đang hoạt động. */
function SpeakingExamSession({ exam, steps, mode, attemptId, startIndex, isFinished, session }: SpeakingExamSessionProps) {
    const router = useRouter();
    const { scoreAudio, submit, leave } = session;
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const step = steps[currentIndex];
    const [phase, setPhase] = useState<SpeakingPhase>(() => (isFinished ? 'done' : startOf(step).phase));
    const [secondsRemaining, setSecondsRemaining] = useState(() => (isFinished ? 0 : startOf(step).seconds));
    const [isReading, setIsReading] = useState(() => !isFinished && startOf(step).isReading);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const mic = useMicrophone();
    const { start: startRecording, stop: stopRecording } = useAnswerRecorder(mic.stream);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitFailed, setSubmitFailed] = useState(false);
    const isMicReady = mic.status === 'active';

    /** Chốt bài nói của câu hiện tại và gửi đi chấm; gọi lại khi đã chốt thì không gửi lại. */
    const saveAnswer = async () => {
        const blob = await stopRecording();
        if (blob) scoreAudio(step.question.id, blob, step.template.part_no);
    };

    const startSpeaking = () => {
        setIsReading(false);
        setPhase('speak');
        setSecondsRemaining(step.speakSec);
    };

    const tick = useEffectEvent(() => {
        if (secondsRemaining > 1) setSecondsRemaining(secondsRemaining - 1);
        else if (isReading && step.prepSec > 0) {
            setIsReading(false);
            setSecondsRemaining(step.prepSec);
        } else if (phase === 'prep') startSpeaking();
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
    }, [isMicReady, phase, secondsRemaining, isReading]);

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
                // replace: bỏ phòng thi khỏi history để Back không quay lại bài đã nộp
                router.replace(getAttemptHref(attemptId));
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
        setIsReading(next.isReading);
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
                    Groq để chuyển thành chữ và chấm điểm.
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
                                totalSeconds={
                                    isReading ? step.readSec : phase === 'prep' ? step.prepSec : step.speakSec
                                }
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
                onConfirm={async () => {
                    await leave();
                    router.push('/speaking');
                }}
            />
        </div>
    );
}
