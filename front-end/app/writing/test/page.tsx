import type { Metadata } from 'next';
import WritingExamRoomLoader from './_components/WritingExamRoomLoader';

export const metadata: Metadata = {
    title: 'Phòng thi Writing | Toeco',
};

export default function WritingTestPage() {
    return <WritingExamRoomLoader />;
}
