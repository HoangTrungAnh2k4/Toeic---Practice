import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ArchivedExamNotice } from '@/components/exam-library/archived-exam-notice';
import { getExamRoom, isRoomClosed, parseRoomParams } from '@/lib/exam-library/room';
import { RawSearchParams } from '@/lib/exam-library/search-params';
import { createServerSupabase } from '@/lib/supabase-server';
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

    const db = await createServerSupabase();
    const room = await getExamRoom('speaking', examId, db);
    if (!room || room.parts.every((part) => part.questions.length === 0)) notFound();
    if (await isRoomClosed(room.exam, null, db)) return <ArchivedExamNotice skill="speaking" />;

    return <SpeakingExamRoom exam={room.exam} parts={room.parts} mode={mode} />;
}

export default function SpeakingTestPage({ searchParams }: SpeakingTestPageProps) {
    return (
        <Suspense fallback={<p className="p-6 text-subText text-sm">Đang chuẩn bị phòng thi Speaking...</p>}>
            <SpeakingExamRoomContent searchParams={searchParams} />
        </Suspense>
    );
}
