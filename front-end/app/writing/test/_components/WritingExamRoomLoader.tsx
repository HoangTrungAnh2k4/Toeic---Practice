'use client';

import dynamic from 'next/dynamic';
import WritingExamRoomSkeleton from './WritingExamRoomSkeleton';

// Phòng thi đọc bản nháp & đồng hồ từ localStorage ngay khi khởi tạo → chỉ render phía client
const WritingExamRoom = dynamic(() => import('./WritingExamRoom'), {
    ssr: false,
    loading: () => <WritingExamRoomSkeleton />,
});

export default function WritingExamRoomLoader() {
    return <WritingExamRoom />;
}
