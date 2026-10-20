import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { listMistakePatterns } from '@/lib/data/mistake-patterns';
import type { MistakePattern } from '@/lib/domain/types';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import type { ExamSummary } from '@/lib/exam-library/types';
import MistakeDetailSkeleton from './_components/MistakeDetailSkeleton';
import MistakeDetailView from './_components/MistakeDetailView';

export const metadata: Metadata = {
    title: 'Chi tiết lỗi | Toeco',
    description: 'Vì sao mắc lỗi, ví dụ từ bài làm và cách sửa.',
};

interface MistakeDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function MistakeDetailPage({ params }: MistakeDetailPageProps) {
    const [patterns, exams] = await Promise.all([listMistakePatterns(), getExamSummaries()]);

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            {/* params là runtime data → stream trong Suspense */}
            <Suspense fallback={<MistakeDetailSkeleton />}>
                <MistakeDetail params={params} patterns={patterns} exams={exams} />
            </Suspense>
        </main>
    );
}

async function MistakeDetail({
    params,
    patterns,
    exams,
}: MistakeDetailPageProps & { patterns: MistakePattern[]; exams: ExamSummary[] }) {
    const { id } = await params;
    if (!patterns.some((pattern) => pattern.id === id)) notFound();
    return <MistakeDetailView id={id} patterns={patterns} exams={exams} />;
}
