import { notFound } from 'next/navigation';
import { getMistakeDetail } from '../../_lib/data';
import MistakeDetailHeader from './MistakeDetailHeader';
import MistakeEvidenceList from './MistakeEvidenceList';
import MistakePracticeCard from './MistakePracticeCard';
import MistakeProgress from './MistakeProgress';
import MistakeRelated from './MistakeRelated';
import MistakeRemedy from './MistakeRemedy';
import MistakeWhy from './MistakeWhy';

interface MistakeDetailViewProps {
    params: Promise<{ id: string }>;
}

export default async function MistakeDetailView({ params }: MistakeDetailViewProps) {
    const { id } = await params;
    const mistake = await getMistakeDetail(id);
    if (!mistake) notFound();

    return (
        <>
            <MistakeDetailHeader mistake={mistake} />

            <div className="items-start gap-6 grid grid-cols-1 lg:grid-cols-3">
                <div className="flex flex-col gap-6 lg:col-span-2 min-w-0">
                    <MistakeWhy mistake={mistake} />
                    <MistakeRemedy remedy={mistake.remedy} />
                    <MistakeEvidenceList mistake={mistake} />
                </div>

                <aside aria-label="Tiến độ và luyện tập" className="flex flex-col gap-6 lg:top-4 lg:sticky">
                    <MistakeProgress mistake={mistake} />
                    <MistakePracticeCard mistake={mistake} />
                    <MistakeRelated items={mistake.related} />
                </aside>
            </div>
        </>
    );
}
