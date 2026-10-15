'use client';

import { use, useEffect, useState } from 'react';
import { LuFileQuestion } from 'react-icons/lu';
import { MistakeItem } from '@/app/mistakes/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { AttemptReview, loadAttemptReview } from '../../_lib/review';
import { STATUS_GROUP } from '../../utils';
import AttemptNotFound from '../not-found';
import AttemptReviewSkeleton from './AttemptReviewSkeleton';
import ReviewHeader from './ReviewHeader';
import ReviewInterruptedState from './ReviewInterruptedState';
import ReviewQuestionCard from './ReviewQuestionCard';
import ReviewQuestionNav from './ReviewQuestionNav';
import ReviewScoreSummary from './ReviewScoreSummary';
import ReviewScoringState from './ReviewScoringState';

interface AttemptReviewViewProps {
    params: Promise<{ id: string }>;
    exams: ExamSummary[];
    mistakeIndex: Record<string, MistakeItem>;
}

/** Lượt làm của khách nằm trong localStorage → nạp sau khi mount; `undefined` = đang tải, `null` = không có. */
export default function AttemptReviewView({ params, exams, mistakeIndex }: AttemptReviewViewProps) {
    const { id } = use(params);
    const [review, setReview] = useState<AttemptReview | null | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        loadAttemptReview(id, exams).then((result) => !cancelled && setReview(result));
        return () => {
            cancelled = true;
        };
    }, [id, exams]);

    if (review === undefined) return <AttemptReviewSkeleton />;
    if (review === null) return <AttemptNotFound />;

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
                <ReviewScoringState row={row} />
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
            <ReviewScoreSummary row={row} questions={questions} mistakeIndex={mistakeIndex} />

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
