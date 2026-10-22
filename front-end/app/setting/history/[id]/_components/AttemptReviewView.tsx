'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { LuFileQuestion } from 'react-icons/lu';
import { getMistakeIndex } from '@/app/mistakes/_lib/data';
import { useMistakeBook } from '@/app/mistakes/_lib/useMistakeBook';
import { LoadError } from '@/components/load-error';
import { combineAsync, useAsync } from '@/hooks/use-async';
import { getAttempt, scoreWritingAttempt } from '@/lib/data/user-data';
import { canRescore } from '@/lib/scoring/scale';
import type { MistakePattern } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { loadAttemptReview } from '../../_lib/review';
import { STATUS_GROUP } from '../../utils';
import AttemptNotFound from '../not-found';
import AttemptReviewSkeleton from './AttemptReviewSkeleton';
import ReviewHeader from './ReviewHeader';
import ReviewInterruptedState from './ReviewInterruptedState';
import ReviewQuestionCard from './ReviewQuestionCard';
import ReviewQuestionNav from './ReviewQuestionNav';
import ReviewScoreSummary from './ReviewScoreSummary';
import ReviewScoringState from './ReviewScoringState';

/** Chu kỳ tải lại khi bài đang chấm; tự dừng khi có điểm, chấm lỗi hoặc lượt chấm quá hạn (`canRescore`). */
const SCORING_POLL_MS = 4000;

interface AttemptReviewViewProps {
    params: Promise<{ id: string }>;
    exams: ExamSummary[];
    patterns: MistakePattern[];
}

/** Lượt làm của khách nằm trong localStorage → nạp sau khi mount. */
export default function AttemptReviewView({ params, exams, patterns }: AttemptReviewViewProps) {
    const { id } = use(params);
    // Bọc lại vì `null` = không có lượt làm này, trùng với `null` = đang tải của `useAsync`
    const reviewState = useAsync(
        useCallback(async () => ({ review: await loadAttemptReview(id, exams) }), [id, exams]),
    );
    // Trạng thái của mẫu lỗi (nhãn "Lỗi lặp lại") tính từ toàn bộ bài làm, không chỉ bài này
    const bookState = useMistakeBook(patterns, exams);
    const { failed, retry } = combineAsync(reviewState, bookState);
    const book = bookState.data;
    const attempt = reviewState.data?.review?.row.attempt;
    const reload = reviewState.retry;
    // Mỗi lần hỏi lại mà lượt làm chưa đổi: render lại để `canRescore` xét theo giờ hiện tại và hẹn lần hỏi kế
    const [pollCount, setPollCount] = useState(0);

    useEffect(() => {
        if (!attempt || STATUS_GROUP[attempt.status] !== 'pending' || canRescore(attempt)) return;
        let cancelled = false;
        // Chỉ đọc lại dòng lượt làm (nhẹ); đổi trạng thái/lỗi chấm thì mới tải lại cả bài, giữ dữ liệu cũ trên màn tới lúc đó
        const timer = setTimeout(() => {
            getAttempt(attempt.id).then(
                (latest) => {
                    if (cancelled) return;
                    const unchanged = latest?.status === attempt.status && latest.scoring_error === attempt.scoring_error;
                    if (unchanged) setPollCount((count) => count + 1);
                    else reload();
                },
                () => !cancelled && reload(),
            );
        }, SCORING_POLL_MS);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [attempt, reload, pollCount]);

    if (failed) return <LoadError message="Không tải được bài làm." onRetry={retry} />;
    if (!reviewState.data || !book) return <AttemptReviewSkeleton />;
    const { review } = reviewState.data;
    if (review === null) return <AttemptNotFound />;

    const mistakeIndex = getMistakeIndex(book);

    const { row, questions } = review;
    const isSpeaking = row.exam.skill === 'speaking';
    const group = STATUS_GROUP[row.attempt.status];

    if (group === 'in_progress' || group === 'interrupted') {
        return (
            <>
                <ReviewHeader row={row} />
                <ReviewInterruptedState row={row} />
            </>
        );
    }

    if (group === 'pending') {
        return (
            <>
                <ReviewHeader row={row} />
                <ReviewScoringState
                    row={row}
                    onRescore={
                        isSpeaking
                            ? undefined
                            : async () => {
                                  await scoreWritingAttempt(
                                      row.attempt,
                                      questions.map(({ question }) => question),
                                  ).catch(() => undefined);
                                  reviewState.retry();
                              }
                    }
                />
                {questions.map((question) => (
                    <ReviewQuestionCard
                        key={question.question.id}
                        item={question}
                        isSpeaking={isSpeaking}
                        mistakeIndex={mistakeIndex}
                        isPending
                    />
                ))}
            </>
        );
    }

    return (
        <>
            <ReviewHeader row={row} />
            <ReviewScoreSummary
                row={row}
                questions={questions}
                mistakeIndex={mistakeIndex}
                writingTotal={review.writingTotal}
            />

            {questions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 bg-card shadow-sm px-4 py-12 border border-sub2/30 rounded-xl text-center">
                    <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                        <LuFileQuestion className="size-6" aria-hidden="true" />
                    </span>
                    <p className="font-semibold text-main text-sm">Không tải được nội dung đề của bài này</p>
                    <p className="max-w-md text-subText text-xs">
                        Đề có thể đã được cập nhật hoặc gỡ khỏi ngân hàng đề. Điểm tổng của bài vẫn được giữ.
                    </p>
                </div>
            ) : (
                <div className="items-start gap-6 grid grid-cols-1 lg:grid-cols-4">
                    <ReviewQuestionNav questions={questions} />
                    <div className="flex flex-col gap-6 lg:col-span-3 min-w-0">
                        {questions.map((question) => (
                            <ReviewQuestionCard
                                key={question.question.id}
                                item={question}
                                isSpeaking={isSpeaking}
                                mistakeIndex={mistakeIndex}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
