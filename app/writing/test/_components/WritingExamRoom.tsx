'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCountdown } from '../_lib/useCountdown';
import { useExamDraft } from '../_lib/useExamDraft';
import { findKeywordUsage, PICTURE_QUESTIONS } from '../utils';
import DirectionsCard from './DirectionsCard';
import ExamNavigation from './ExamNavigation';
import ExitExamDialog from './ExitExamDialog';
import PictureStimulus from './PictureStimulus';
import QuestionNavigator from './QuestionNavigator';
import ResponseEditor from './ResponseEditor';
import SubmitSectionDialog from './SubmitSectionDialog';
import WritingExamHeader from './WritingExamHeader';

type ExamDialog = 'exit' | 'submit' | null;

export default function WritingExamRoom() {
    const router = useRouter();
    const { answers, endsAt, updateAnswer, saveStatus, savedAt, isRestored, discardDraft } = useExamDraft();
    const secondsLeft = useCountdown(endsAt);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [openDialog, setOpenDialog] = useState<ExamDialog>(null);

    const isTimeUp = secondsLeft === 0;
    const question = PICTURE_QUESTIONS[currentIndex];
    const answer = answers[currentIndex];
    const keywordUsages = question.keywords.map((keyword) => findKeywordUsage(answer, keyword));
    const answeredCount = answers.filter((item) => item.trim()).length;

    const handleDialogChange = (dialog: Exclude<ExamDialog, null>) => (open: boolean) =>
        setOpenDialog(open ? dialog : null);

    const handleSubmitSection = () => {
        // TODO: gửi bài nhóm 1 lên server & chuyển sang Q6-7 khi có màn Email
        discardDraft();
        router.push('/writing');
    };

    return (
        <div className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <WritingExamHeader
                secondsLeft={secondsLeft}
                saveStatus={saveStatus}
                savedAt={savedAt}
                isRestored={isRestored}
                onExit={() => setOpenDialog('exit')}
            />

            <QuestionNavigator answers={answers} currentIndex={currentIndex} onSelect={setCurrentIndex} />

            <main className="items-start gap-6 grid grid-cols-1 lg:grid-cols-12">
                {/* Stimulus: directions + picture + keywords */}
                <div className="flex flex-col gap-4 lg:col-span-6">
                    <DirectionsCard questionNumber={question.id} />
                    <PictureStimulus question={question} keywordUsages={keywordUsages} />
                </div>

                {/* Response editor & navigation */}
                <div className="flex flex-col gap-4 lg:col-span-6">
                    <ResponseEditor
                        // Đổi câu → reset lịch sử Undo/Redo của câu trước
                        key={question.id}
                        questionNumber={question.id}
                        value={answer}
                        onChange={(value) => updateAnswer(currentIndex, value)}
                        keywords={question.keywords}
                        keywordUsages={keywordUsages}
                        isLocked={isTimeUp}
                    />
                    <ExamNavigation
                        currentIndex={currentIndex}
                        totalQuestions={PICTURE_QUESTIONS.length}
                        isTimeUp={isTimeUp}
                        onPrev={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                        onNext={() => setCurrentIndex((index) => Math.min(PICTURE_QUESTIONS.length - 1, index + 1))}
                        onFinish={() => setOpenDialog('submit')}
                    />
                </div>
            </main>

            <SubmitSectionDialog
                open={openDialog === 'submit'}
                onOpenChange={handleDialogChange('submit')}
                answers={answers}
                isTimeUp={isTimeUp}
                onConfirm={handleSubmitSection}
            />
            <ExitExamDialog
                open={openDialog === 'exit'}
                onOpenChange={handleDialogChange('exit')}
                answeredCount={answeredCount}
                totalQuestions={PICTURE_QUESTIONS.length}
                onConfirm={() => router.push('/writing')}
            />
        </div>
    );
}
