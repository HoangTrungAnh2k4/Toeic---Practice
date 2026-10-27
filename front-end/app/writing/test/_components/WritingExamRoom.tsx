'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { LuRotateCw, LuTriangleAlert } from 'react-icons/lu';
import Button, { buttonVariants } from '@/components/ui/button';
import type { AttemptMode, Exam } from '@/lib/domain/types';
import { getPartDurationSec } from '@/lib/domain/parts';
import type { RoomPart } from '@/lib/exam-library/room';
import { getAttemptHref } from '@/app/setting/history/utils';
import { useCountdown } from '../_lib/useCountdown';
import { useWritingAttempt } from '../_lib/useWritingAttempt';
import { formatQuestionRange, getQuestionDeadline } from '../utils';
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
    /** Các Part của lượt làm: cả đề (`partTemplateId = null`, một lượt làm, nộp Part cuối mới đóng) hoặc một Part. */
    parts: RoomPart[];
    partTemplateId: number | null;
    mode: AttemptMode;
}

export default function WritingExamRoom({ exam, parts, partTemplateId, mode }: WritingExamRoomProps) {
    const router = useRouter();
    const {
        attempt,
        answers: allAnswers,
        partIndex,
        partStartedAt,
        isRestored,
        loadError,
        retryLoad,
        saveStatus,
        savedAt,
        updateAnswer,
        finishPart,
    } = useWritingAttempt({
        examId: exam.id,
        partTemplateId,
        mode,
        durationSec: partTemplateId === null ? null : getPartDurationSec(parts[0].template),
        questions: parts.flatMap((item) => item.questions),
        partCount: parts.length,
    });
    const part = parts[partIndex];
    const { template, questions } = part;
    // `answers` của hook đánh index theo câu của mọi Part; Part đang làm là một lát cắt
    const offset = parts.slice(0, partIndex).reduce((sum, item) => sum + item.questions.length, 0);
    const answers = allAnswers.slice(offset, offset + questions.length);
    const hasNextPart = partIndex < parts.length - 1;
    const [cursor, setCursor] = useState({ partIndex: 0, index: 0 });
    // Câu đang xem gắn với Part: vừa sang Part mới (Part 2 chỉ 2 câu) thì về câu đầu, không trỏ quá số câu
    const currentIndex = cursor.partIndex === partIndex ? cursor.index : 0;
    const setCurrentIndex = (index: number) => setCursor({ partIndex, index });
    const secondsLeft = useCountdown(
        attempt ? getQuestionDeadline(attempt, template, currentIndex, partStartedAt) : null,
    );
    const [openDialog, setOpenDialog] = useState<ExamDialog>(null);
    const autoSubmittedRef = useRef(false);

    const isTimeUp = secondsLeft === 0;
    const isLastQuestion = currentIndex === questions.length - 1;
    // Part tính giờ từng câu: hết giờ câu đang xem chưa phải hết giờ cả Part, trừ khi là câu cuối
    const isPartTimeUp = isTimeUp && (!template.response_sec || isLastQuestion);

    const handleSubmit = async () => {
        if (!attempt) return;
        // Lỗi hiện ở trạng thái lưu trên header, ở lại phòng để thử nộp lại
        const result = await finishPart();
        if (result === 'next') {
            setOpenDialog(null);
            // Part kế có đồng hồ riêng: hết giờ lại được tự nộp
            autoSubmittedRef.current = false;
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
        // Part cuối: sang trang kết quả, trang đó chờ chấm xong rồi hiện điểm.
        // replace: bỏ phòng thi khỏi history để Back không quay lại bài đã nộp
        if (result === 'done') router.replace(getAttemptHref(attempt.id));
    };

    const autoSubmit = useEffectEvent(() => {
        if (autoSubmittedRef.current) return;
        autoSubmittedRef.current = true;
        setOpenDialog(null);
        void handleSubmit();
    });

    // CBT như phòng thi thật: hết giờ Part thì tự nộp; nộp lỗi thì người làm bấm nộp lại bằng tay
    useEffect(() => {
        if (mode === 'cbt' && isPartTimeUp) autoSubmit();
    }, [mode, isPartTimeUp]);

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

    const rangeLabel = formatQuestionRange(template);
    const question = questions[currentIndex];
    const answer = answers[currentIndex] ?? '';
    const answeredCount = answers.filter((item) => item.trim()).length;

    const handleDialogChange = (dialog: Exclude<ExamDialog, null>) => (open: boolean) =>
        setOpenDialog(open ? dialog : null);

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
                {/* Stimulus: picture/email/essay */}
                <div className="flex flex-col gap-4 lg:col-span-6">
                    {template.part_no === 1 ? (
                        <PictureStimulus question={question} total={questions.length} />
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
                        onChange={(value) => updateAnswer(offset + currentIndex, value)}
                        isLocked={isTimeUp}
                    />
                    <ExamNavigation
                        partNo={template.part_no}
                        rangeLabel={rangeLabel}
                        timeUpLabel={template.response_sec ? `Câu ${question.number}` : rangeLabel}
                        currentIndex={currentIndex}
                        totalQuestions={questions.length}
                        isTimeUp={isTimeUp}
                        onPrev={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                        onNext={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
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
                hasNextPart={hasNextPart}
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
