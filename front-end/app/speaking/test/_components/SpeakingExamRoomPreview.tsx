'use client';

import { notFound } from 'next/navigation';
import type { AttemptMode } from '@/lib/domain/types';
import { useExamRoom } from '@/lib/exam-library/use-exam-room';
import SpeakingExamRoom from './SpeakingExamRoom';

/** Phòng thi tải bằng phiên trình duyệt: admin xem trước đề chưa phát hành. */
export default function SpeakingExamRoomPreview({ examId, mode }: { examId: string; mode: AttemptMode }) {
    const room = useExamRoom('speaking', examId);
    if (room === undefined) return <p className="p-6 text-subText text-sm">Đang chuẩn bị phòng thi Speaking...</p>;
    if (!room || room.parts.every((part) => part.questions.length === 0)) notFound();

    return <SpeakingExamRoom exam={room.exam} parts={room.parts} mode={mode} />;
}
