import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getExamRoom, parseRoomParams } from '@/lib/exam-library/room';
import { RawSearchParams } from '@/lib/exam-library/search-params';
import SpeakingExamRoom from './_components/SpeakingExamRoom';

export const metadata: Metadata = {
    title: 'Phòng thi Speaking | Toeco',
};

interface SpeakingTestPageProps {
    searchParams: Promise<RawSearchParams>;
}

async function SpeakingExamRoomContent({ searchParams }: SpeakingTestPageProps) {
    const { examId, mode } = parseRoomParams(await searchParams);
    if (!examId) redirect('/speaking');

    const room = await getExamRoom('speaking', examId);
    if (!room || room.parts.every((part) => part.questions.length === 0)) notFound();

    return <SpeakingExamRoom exam={room.exam} parts={room.parts} mode={mode} />;
}

export default function SpeakingTestPage({ searchParams }: SpeakingTestPageProps) {
    return (
        <Suspense fallback={<p className="p-6 text-subText text-sm">Đang chuẩn bị phòng thi Speaking...</p>}>
            <SpeakingExamRoomContent searchParams={searchParams} />
        </Suspense>
    );
}
