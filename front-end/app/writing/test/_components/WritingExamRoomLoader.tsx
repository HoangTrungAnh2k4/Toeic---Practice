'use client';

import dynamic from 'next/dynamic';
import type { WritingExamRoomProps } from './WritingExamRoom';
import WritingExamRoomSkeleton from './WritingExamRoomSkeleton';

// Phòng thi đọc lượt làm & câu trả lời của khách từ localStorage → chỉ render phía client
const WritingExamRoom = dynamic(() => import('./WritingExamRoom'), {
    ssr: false,
    loading: () => <WritingExamRoomSkeleton />,
});

export default function WritingExamRoomLoader(props: WritingExamRoomProps) {
    return <WritingExamRoom {...props} />;
}
