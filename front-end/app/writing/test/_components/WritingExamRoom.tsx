'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LuRotateCw, LuTriangleAlert } from 'react-icons/lu';
import Button, { buttonVariants } from '@/components/ui/button';
import type { AttemptMode, Exam } from '@/lib/domain/types';
import { getPartDurationSec } from '@/lib/domain/parts';
import type { RoomPart } from '@/lib/exam-library/room';
import { buildTestHref } from '@/lib/exam-library/search-params';
import { getAttemptHref } from '@/app/setting/history/utils';
import { useCountdown } from '../_lib/useCountdown';
import { useWritingAttempt } from '../_lib/useWritingAttempt';
import { findKeywordUsage, formatQuestionRange, getQuestionDeadline } from '../utils';
import DirectionsCard from './DirectionsCard';
import EmailStimulus from './EmailStimulus';
import EssayStimulus from './EssayStimulus';
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
    /** Mỗi Part là một lượt làm riêng; nộp xong chuyển sang `nextPartTemplateId` (nếu có). */
    part: RoomPart;
    nextPartTemplateId: number | null;
    mode: AttemptMode;
}

export default function WritingExamRoom({ exam, part, nextPartTemplateId, mode }: WritingExamRoomProps) {
    const router = useRouter();
    const { template, questions } = part;
    const { attempt, answers, isRestored, loadError, retryLoad, saveStatus, savedAt, updateAnswer, submit } = useWritingAttempt({
        examId: exam.id,
        partTemplateId: template.id,
        mode,
        durationSec: getPartDurationSec(template),
        questions,
    });
    const [currentIndex, setCurrentIndex] = useState(0);
    const secondsLeft = useCountdown(attempt ? getQuestionDeadline(attempt, template, currentIndex) : null);
    const [openDialog, setOpenDialog] = useState<ExamDialog>(null);

    if (loadError) {
        return (
            <div
                role="alert"
                className="flex flex-col items-center gap-3 mx-auto bg-white shadow-sm px-4 py-12 border border-sub2/30 rounded-xl w-full max-w-360 text-center"
            >
                <LuTriangleAlert className="size-8 text-destructive" aria-hidden="true" />
                <p className="font-semibold text-main text-sm">Không mở được phòng thi</p>
                <p className="text-subText text-xs">
                    Kiểm tra kết nối mạng rồi thử lại. Nếu vẫn lỗi, trình duyệt có thể đang chặn bộ nhớ cục bộ.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Button type="button" variant="primary" size="sm" className="gap-2" onClick={retryLoad}>
                        <LuRotateCw className="size-4" aria-hidden="true" />
                        Thử lại
                    </Button>
                    <Link href="/writing" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        Về thư viện đề
                    </Link>
                </div>
            </div>
        );
    }

    if (!attempt) return <WritingExamRoomSkeleton />;

    const isTimeUp = secondsLeft === 0;
    const isLastQuestion = currentIndex === questions.length - 1;
    // Part tính giờ từng câu: hết giờ câu đang xem chưa phải hết giờ cả Part, trừ khi là câu cuối
    const isPartTimeUp = isTimeUp && (!template.response_sec || isLastQuestion);
    const rangeLabel = formatQuestionRange(template);
    const question = questions[currentIndex];
    const keywords = question.keywords ?? [];
    const answer = answers[currentIndex] ?? '';
    const keywordUsages = keywords.map((keyword) => findKeywordUsage(answer, keyword));
    const answeredCount = answers.filter((item) => item.trim()).length;

    const handleDialogChange = (dialog: Exclude<ExamDialog, null>) => (open: boolean) =>
        setOpenDialog(open ? dialog : null);

    const handleSubmit = async () => {
        // Lỗi hiện ở trạng thái lưu trên header, ở lại phòng để thử nộp lại
        if (!(await submit())) return;
        // Part cuối: sang trang kết quả, trang đó chờ chấm xong rồi hiện điểm
        router.push(
            nextPartTemplateId ? buildTestHref('writing', exam.id, attempt.mode, nextPartTemplateId) : getAttemptHref(attempt.id),
        );
    };

    return (
        <div className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <WritingExamHeader
                title={exam.title}
                mode={attempt.mode}
                template={template}
                questionNumber={question.number}
                secondsLeft={secondsLeft}
                saveStatus={saveStatus}
                savedAt={savedAt}
                isRestored={isRestored}
                onExit={() => setOpenDialog('exit')}
            />

            <QuestionNavigator
                answers={answers}
                partNo={template.part_no}
                firstNumber={template.q_from}
                currentIndex={currentIndex}
                onSelect={setCurrentIndex}
            />

            <main className="items-start gap-6 grid grid-cols-1 lg:grid-cols-12">
                {/* Stimulus: directions + picture/email/essay */}
                <div className="flex flex-col gap-4 lg:col-span-6">
                    <DirectionsCard partNo={template.part_no} questionNumber={question.number} />
                    {template.part_no === 1 ? (
                        <PictureStimulus
                            question={question}
                            total={questions.length}
                            keywordUsages={keywordUsages}
                        />
                    ) : template.part_no === 2 ? (
                        <EmailStimulus question={question} email={question.stimulus ?? part.part.context} />
                    ) : (
                        <EssayStimulus question={question} context={question.stimulus ?? part.part.context} />
                    )}
                </div>

                {/* Response editor & navigation */}
                <div className="flex flex-col gap-4 lg:col-span-6">
                    <ResponseEditor
                        // Đổi câu → reset lịch sử Undo/Redo của câu trước
                        key={question.id}
                        partNo={template.part_no}
                        questionNumber={question.number}
                        value={answer}
                        onChange={(value) => updateAnswer(currentIndex, value)}
                        keywords={keywords}
                        keywordUsages={keywordUsages}
                        isLocked={isTimeUp}
                    />
                    <ExamNavigation
                        partNo={template.part_no}
                        rangeLabel={rangeLabel}
                        timeUpLabel={template.response_sec ? `Câu ${question.number}` : rangeLabel}
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
                firstNumber={template.q_from}
                rangeLabel={rangeLabel}
                hasNextPart={nextPartTemplateId !== null}
                isTimeUp={isPartTimeUp}
                onConfirm={handleSubmit}
            />
            <ExitExamDialog
                open={openDialog === 'exit'}
                onOpenChange={handleDialogChange('exit')}
                title={exam.title}
                partNo={template.part_no}
                answeredCount={answeredCount}
                totalQuestions={questions.length}
                onConfirm={() => router.push('/writing')}
            />
        </div>
    );
}
