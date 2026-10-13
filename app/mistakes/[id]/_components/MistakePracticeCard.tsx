import { LuInfo, LuTarget } from 'react-icons/lu';
import LinkButton from '@/components/ui/link-button';
import { MistakeDetail } from '../../types';
import { getPracticeHref, SKILL_META } from '../../utils';

interface MistakePracticeCardProps {
    mistake: MistakeDetail;
}

export default function MistakePracticeCard({ mistake }: MistakePracticeCardProps) {
    const skillLabel = SKILL_META[mistake.skill].label;

    return (
        <section
            aria-labelledby="mistake-practice-title"
            className="flex flex-col gap-4 bg-main shadow-main/20 shadow-md p-5 rounded-xl"
        >
            <div className="flex items-start gap-3">
                <span className="flex justify-center items-center bg-sub3 rounded-lg size-10 text-main shrink-0">
                    <LuTarget className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                    <h2 id="mistake-practice-title" className="font-bold text-sub1 text-lg tracking-tight">
                        Luyện tập có mục tiêu
                    </h2>
                    <p className="font-medium text-sub1/80 text-sm leading-relaxed">
                        Làm thêm đề {mistake.task} và áp dụng checklist trước khi nộp.
                    </p>
                </div>
            </div>

            <LinkButton href={getPracticeHref(mistake.skill)} variant="primary" size="md" className="w-full">
                Luyện {skillLabel} {mistake.partLabel}
            </LinkButton>

            <p className="flex items-start gap-2 font-medium text-sub1/80 text-xs leading-relaxed">
                <LuInfo className="mt-px size-4 text-sub3 shrink-0" aria-hidden="true" />
                Chọn chế độ không xem bài mẫu để bài làm được tính vào tiến độ khắc phục.
            </p>
        </section>
    );
}
