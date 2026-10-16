'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import type { AttemptMode, Exam } from '@/lib/domain/types';
import type { RoomPart } from '@/lib/exam-library/room';
import { useCountdown } from '../_lib/useCountdown';
import { useWritingAttempt } from '../_lib/useWritingAttempt';
import { findKeywordUsage } from '../utils';
import DirectionsCard from './DirectionsCard';
import ExamNavigation from './ExamNavigation';
import ExitExamDialog from './ExitExamDialog';
import PictureStimulus from './PictureStimulus';
import QuestionNavigator from './QuestionNavigator';
import ResponseEditor from './ResponseEditor';
import SubmitSectionDialog from './SubmitSectionDialog';
import WritingExamHeader from './WritingExamHeader';
import WritingExamRoomSkeleton from './WritingExamRoomSkeleton';

type ExamDialog = 'exit' | 'submit' | null;

export interface WritingExamRoomProps {
    exam: Exam;
    /** Phòng thi hiện chỉ có nhóm Q1-5 (Writing Part 1). */
    part: RoomPart;
    mode: AttemptMode;
}

export default function WritingExamRoom({ exam, part, mode }: WritingExamRoomProps) {
    const router = useRouter();
    const { questions } = part;
    const { attempt, answers, isRestored, loadError, saveStatus, savedAt, updateAnswer, submit } = useWritingAttempt({
        examId: exam.id,
        partTemplateId: part.template.id,
        mode,
        durationSec: part.template.section_sec,
        questions,
    });
    const secondsLeft = useCountdown(attempt?.ends_at ? Date.parse(attempt.ends_at) : null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [openDialog, setOpenDialog] = useState<ExamDialog>(null);

    if (loadError) {
        return (
            <div
                role="alert"
                className="flex flex-col items-center gap-3 mx-auto bg-white shadow-sm px-4 py-12 border border-sub2/30 rounded-xl w-full max-w-360 text-center"
            >
                <LuTriangleAlert className="size-8 text-destructive" aria-hidden="true" />
                <p className="font-semibold text-main text-sm">Không mở được phòng thi trên trình duyệt này</p>
                <p className="text-subText text-xs">Trình duyệt đang chặn bộ nhớ cục bộ nên không thể lưu bài làm.</p>
                <Link href="/writing" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                    Về thư viện đề
                </Link>
            </div>
        );
    }

    if (!attempt) return <WritingExamRoomSkeleton />;

    const isTimeUp = secondsLeft === 0;
    const question = questions[currentIndex];
    const keywords = question.keywords ?? [];
    const answer = answers[currentIndex] ?? '';
    const keywordUsages = keywords.map((keyword) => findKeywordUsage(answer, keyword));
    const answeredCount = answers.filter((item) => item.trim()).length;

    const handleDialogChange = (dialog: Exclude<ExamDialog, null>) => (open: boolean) =>
        setOpenDialog(open ? dialog : null);

    const handleSubmit = async () => {
        // Lỗi hiện ở trạng thái lưu trên header, ở lại phòng để thử nộp lại
        if (await submit()) router.push('/writing');
    };

    return (
        <div className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <WritingExamHeader
                title={exam.title}
                mode={attempt.mode}
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
                    <DirectionsCard questionNumber={question.number} />
                    <PictureStimulus
                        question={question}
                        total={questions.length}
                        keywordUsages={keywordUsages}
                    />
                </div>

                {/* Response editor & navigation */}
                <div className="flex flex-col gap-4 lg:col-span-6">
                    <ResponseEditor
                        // Đổi câu → reset lịch sử Undo/Redo của câu trước
                        key={question.id}
                        questionNumber={question.number}
                        value={answer}
                        onChange={(value) => updateAnswer(currentIndex, value)}
                        keywords={keywords}
                        keywordUsages={keywordUsages}
                        isLocked={isTimeUp}
                    />
                    <ExamNavigation
                        currentIndex={currentIndex}
                        totalQuestions={questions.length}
                        isTimeUp={isTimeUp}
                        onPrev={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                        onNext={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}
                        onFinish={() => setOpenDialog('submit')}
                    />
                </div>
            </main>

            <SubmitSectionDialog
                open={openDialog === 'submit'}
                onOpenChange={handleDialogChange('submit')}
                answers={answers}
                isTimeUp={isTimeUp}
                onConfirm={handleSubmit}
            />
            <ExitExamDialog
                open={openDialog === 'exit'}
                onOpenChange={handleDialogChange('exit')}
                title={exam.title}
                answeredCount={answeredCount}
                totalQuestions={questions.length}
                onConfirm={() => router.push('/writing')}
            />
        </div>
    );
}
