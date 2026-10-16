'use client';

import { notFound } from 'next/navigation';
import type { AttemptMode } from '@/lib/domain/types';
import { useExamRoom } from '@/lib/exam-library/use-exam-room';
import WritingExamRoomLoader from './WritingExamRoomLoader';
import WritingExamRoomSkeleton from './WritingExamRoomSkeleton';

/** Phòng thi tải bằng phiên trình duyệt: admin xem trước đề chưa phát hành. */
export default function WritingExamRoomPreview({ examId, mode }: { examId: string; mode: AttemptMode }) {
    const room = useExamRoom('writing', examId);
    if (room === undefined) return <WritingExamRoomSkeleton />;
    const part = room?.parts.find((item) => item.template.part_no === 1);
    if (!room || !part) notFound();

    return <WritingExamRoomLoader exam={room.exam} part={part} mode={mode} />;
}
