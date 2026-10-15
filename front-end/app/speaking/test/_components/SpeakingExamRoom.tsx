'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LuInfo } from 'react-icons/lu';
import type { AttemptMode, Exam } from '@/lib/domain/types';
import type { RoomPart } from '@/lib/exam-library/room';
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

/**
 * Phòng thi Speaking đọc đề & câu hỏi thật.
 * shortcut: chưa ghi âm và chưa tạo attempt — đồng hồ chỉ mô phỏng thời gian trả lời; làm thật ở bước phòng thi thật.
 */
export default function SpeakingExamRoom({ exam, parts, mode }: SpeakingExamRoomProps) {
    const router = useRouter();
    const steps = toSteps(parts);
    const [currentIndex, setCurrentIndex] = useState(0);
    const step = steps[currentIndex];
    const [secondsRemaining, setSecondsRemaining] = useState(step.speakSec);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);

    useEffect(() => {
        if (secondsRemaining <= 0) return;
        const timer = setTimeout(() => setSecondsRemaining((prev) => Math.max(0, prev - 1)), 1000);
        return () => clearTimeout(timer);
    }, [secondsRemaining]);

    const isLast = currentIndex === steps.length - 1;
    // Chế độ có hướng dẫn không khóa thời gian: được chuyển câu bất cứ lúc nào
    const canProceed = mode === 'guided' || secondsRemaining === 0;

    const handleNext = () => {
        if (isLast) {
            router.push('/speaking');
            return;
        }
        setCurrentIndex(currentIndex + 1);
        setSecondsRemaining(steps[currentIndex + 1].speakSec);
    };

    return (
        <div className="flex flex-col bg-transparent min-h-[calc(100vh-2rem)] overflow-hidden">
            <ExamHeader
                title={exam.title}
                mode={mode}
                prepSec={step.prepSec}
                speakSec={step.speakSec}
                secondsRemaining={secondsRemaining}
                onOpenExitModal={() => setIsExitModalOpen(true)}
            />

            <main className="flex flex-col flex-1 gap-6 mt-6 w-full max-w-6xl">
                <p
                    role="note"
                    className="flex items-start gap-2 bg-sub3/10 px-4 py-3 border border-sub3/50 rounded-xl text-main text-xs leading-relaxed"
                >
                    <LuInfo className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    Phòng thi Speaking chưa ghi âm và chưa lưu bài: đồng hồ chỉ mô phỏng thời gian trả lời của từng câu.
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
                        <AudioCaptureHud
                            currentSeconds={step.speakSec - secondsRemaining}
                            totalSeconds={step.speakSec}
                        />
                    </div>
                </div>
            </main>

            <QuestionProgression
                questions={steps.map(({ question, template }) => ({ number: question.number, task: template.task }))}
                currentIndex={currentIndex}
                speakSec={step.speakSec}
                canProceed={canProceed}
                isLast={isLast}
                onNextQuestion={handleNext}
            />

            <ExitConfirmDialog
                isOpen={isExitModalOpen}
                onClose={() => setIsExitModalOpen(false)}
                onConfirm={() => router.push('/speaking')}
            />
        </div>
    );
}
