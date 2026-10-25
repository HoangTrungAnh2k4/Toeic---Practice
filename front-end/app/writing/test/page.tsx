import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ArchivedExamNotice } from '@/components/exam-library/archived-exam-notice';
import { getExamRoom, isRoomClosed, parseRoomParams } from '@/lib/exam-library/room';
import { RawSearchParams } from '@/lib/exam-library/search-params';
import { createServerSupabase } from '@/lib/supabase-server';
import WritingExamRoomLoader from './_components/WritingExamRoomLoader';
import WritingExamRoomSkeleton from './_components/WritingExamRoomSkeleton';

export const metadata: Metadata = {
    title: 'Phòng thi Writing | Toeco',
};

interface WritingTestPageProps {
    searchParams: Promise<RawSearchParams>;
}

async function WritingExamRoomContent({ searchParams }: WritingTestPageProps) {
    const { examId, mode, partTemplateId } = parseRoomParams(await searchParams);
    if (!examId) redirect('/writing');

    const db = await createServerSupabase();
    const room = await getExamRoom('writing', examId, db);
    const parts = room?.parts ?? [];
    const index = partTemplateId === null ? 0 : parts.findIndex((item) => item.template.id === partTemplateId);
    const part = parts[index];
    if (!room || !part) notFound();
    if (await isRoomClosed(room.exam, part.template.id, db)) return <ArchivedExamNotice skill="writing" />;

    return (
        <WritingExamRoomLoader
            // Mỗi Part một lượt làm: sang Part mới phải mount lại phòng thi để tạo/khôi phục attempt của Part đó
            key={part.template.id}
            exam={room.exam}
            part={part}
            nextPartTemplateId={parts[index + 1]?.template.id ?? null}
            mode={mode}
        />
    );
}

export default function WritingTestPage({ searchParams }: WritingTestPageProps) {
    return (
        <Suspense fallback={<WritingExamRoomSkeleton />}>
            <WritingExamRoomContent searchParams={searchParams} />
        </Suspense>
    );
}
