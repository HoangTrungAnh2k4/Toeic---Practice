import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getExamRoom, parseRoomParams } from '@/lib/exam-library/room';
import { RawSearchParams } from '@/lib/exam-library/search-params';
import WritingExamRoomLoader from './_components/WritingExamRoomLoader';
import WritingExamRoomPreview from './_components/WritingExamRoomPreview';
import WritingExamRoomSkeleton from './_components/WritingExamRoomSkeleton';

export const metadata: Metadata = {
    title: 'Phòng thi Writing | Toeco',
};

interface WritingTestPageProps {
    searchParams: Promise<RawSearchParams>;
}

async function WritingExamRoomContent({ searchParams }: WritingTestPageProps) {
    const { examId, mode } = parseRoomParams(await searchParams);
    if (!examId) redirect('/writing');

    const room = await getExamRoom('writing', examId);
    // Server không có phiên nên không thấy đề chưa phát hành → thử lại phía client với phiên admin
    if (!room) return <WritingExamRoomPreview examId={examId} mode={mode} />;
    // Phòng thi hiện mới có nhóm Q1-5 (Part 1); Q6-8 làm sau
    const part = room.parts.find((item) => item.template.part_no === 1);
    if (!part) notFound();

    return <WritingExamRoomLoader exam={room.exam} part={part} mode={mode} />;
}

export default function WritingTestPage({ searchParams }: WritingTestPageProps) {
    return (
        <Suspense fallback={<WritingExamRoomSkeleton />}>
            <WritingExamRoomContent searchParams={searchParams} />
        </Suspense>
    );
}
