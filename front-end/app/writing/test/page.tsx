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
    // Không có `part` = thi cả đề trong một lượt làm; có `part` = luyện lẻ Part đó
    const parts = (room?.parts ?? []).filter((item) => partTemplateId === null || item.template.id === partTemplateId);
    if (!room || parts.length === 0) notFound();
    if (await isRoomClosed(room.exam, partTemplateId, db)) return <ArchivedExamNotice skill="writing" />;

    return (
        <WritingExamRoomLoader
            // Đổi phạm vi (cả đề ↔ một Part) phải mount lại phòng thi để tạo/khôi phục đúng lượt làm
            key={partTemplateId ?? 'full'}
            exam={room.exam}
            parts={parts}
            partTemplateId={partTemplateId}
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
