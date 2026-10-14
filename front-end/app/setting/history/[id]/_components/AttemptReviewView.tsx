import { notFound } from 'next/navigation';
import { LuFileQuestion } from 'react-icons/lu';
import { getMistakeIndex } from '@/app/mistakes/_lib/data';
import { getAttemptReview } from '../../_lib/review';
import ReviewHeader from './ReviewHeader';
import ReviewInterruptedState from './ReviewInterruptedState';
import ReviewQuestionCard from './ReviewQuestionCard';
import ReviewQuestionNav from './ReviewQuestionNav';
import ReviewScoreSummary from './ReviewScoreSummary';
import ReviewScoringState from './ReviewScoringState';

interface AttemptReviewViewProps {
    params: Promise<{ id: string }>;
}

export default async function AttemptReviewView({ params }: AttemptReviewViewProps) {
    const { id } = await params;
    const [review, mistakeIndex] = await Promise.all([getAttemptReview(id), getMistakeIndex()]);
    if (!review) notFound();

    const { attempt, questions } = review;
    const isSpeaking = attempt.skill === 'speaking';

    if (attempt.scoreInfo.isInterrupted) {
        return (
            <>
                <ReviewHeader attempt={attempt} />
                <ReviewInterruptedState attempt={attempt} />
            </>
        );
    }

    if (attempt.scoreInfo.isScoring) {
        return (
            <>
                <ReviewHeader attempt={attempt} />
                <ReviewScoringState attempt={attempt} />
                {questions.map((question) => (
                    <ReviewQuestionCard key={question.number} question={question} isSpeaking={isSpeaking} mistakeIndex={mistakeIndex} isPending />
                ))}
            </>
        );
    }

    return (
        <>
            <ReviewHeader attempt={attempt} />
            <ReviewScoreSummary attempt={attempt} questions={questions} mistakeIndex={mistakeIndex} />

            {questions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 bg-card shadow-sm px-4 py-12 border border-sub2/30 rounded-xl text-center">
                    <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                        <LuFileQuestion className="size-6" aria-hidden="true" />
                    </span>
                    <p className="font-semibold text-main text-sm">Chưa có nhận xét chi tiết cho bài này</p>
                    <p className="max-w-md text-subText text-xs">
                        Bài đã có điểm tổng nhưng nhận xét từng câu chưa được đồng bộ. Thử tải lại sau ít phút.
                    </p>
                </div>
            ) : (
                <div className="items-start gap-6 grid grid-cols-1 lg:grid-cols-4">
                    <ReviewQuestionNav questions={questions} />
                    <div className="flex flex-col gap-6 lg:col-span-3 min-w-0">
                        {questions.map((question) => (
                            <ReviewQuestionCard
                                key={question.number}
                                question={question}
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
