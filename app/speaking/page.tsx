'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ExamTopBar from './_components/ExamTopBar';
import ExamPhaseRibbon from './_components/ExamPhaseRibbon';
import DirectionsBanner from './_components/DirectionsBanner';
import PictureStimulus from './_components/PictureStimulus';
import AudioCaptureHud from './_components/AudioCaptureHud';
import QuestionProgression from './_components/QuestionProgression';
import ExitConfirmDialog from './_components/ExitConfirmDialog';

export default function SpeakingPage() {
    const router = useRouter();
    const [secondsRemaining, setSecondsRemaining] = useState(18);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);

    // Live countdown timer simulation
    useEffect(() => {
        if (secondsRemaining <= 0) return;

        const timer = setInterval(() => {
            setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsRemaining]);

    const handleConfirmExit = () => {
        setIsExitModalOpen(false);
        router.back();
    };

    return (
        <div className="flex flex-col bg-background shadow-sm border border-border rounded-2xl min-h-[calc(100vh-2rem)] overflow-hidden">
            {/* Exam Top Bar */}
            <ExamTopBar onOpenExitModal={() => setIsExitModalOpen(true)} />

            {/* Phase Progression & Live Countdown */}
            <ExamPhaseRibbon secondsRemaining={secondsRemaining} />

            {/* Central Test Stage */}
            <main className="flex flex-col flex-1 gap-6 mx-auto p-6 w-full max-w-6xl">
                {/* Directions Banner */}
                <DirectionsBanner />

                {/* Dual Pane Exam Content */}
                <div className="items-stretch gap-6 grid grid-cols-1 lg:grid-cols-12">
                    {/* Left: Picture Stimulus (Part 2) */}
                    <div className="lg:col-span-7">
                        <PictureStimulus />
                    </div>

                    {/* Right: Audio Capture & Waveform HUD */}
                    <div className="lg:col-span-5">
                        <AudioCaptureHud currentSeconds={30 - secondsRemaining} totalSeconds={30} />
                    </div>
                </div>
            </main>

            {/* Footer Question Progression Grid */}
            <QuestionProgression canProceed={secondsRemaining === 0} />

            {/* Exit Confirmation Dialog */}
            <ExitConfirmDialog
                isOpen={isExitModalOpen}
                onClose={() => setIsExitModalOpen(false)}
                onConfirm={handleConfirmExit}
            />
        </div>
    );
}
