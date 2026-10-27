import { LuDownload } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { RUBRIC_PARTS, SPEAKING_FORMAT_NOTES } from '../utils';

export default function SpeakingRubricGuide() {
    return (
        <section
            id="rubric-guide"
            aria-labelledby="speaking-rubric-title"
            className="flex flex-col gap-5 bg-white shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl scroll-mt-4"
        >
            <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-3">
                <h2 id="speaking-rubric-title" className="font-bold text-main text-xl tracking-tight">
                    Cấu trúc đề & tiêu chí chấm
                </h2>
                <ul className="flex flex-wrap gap-2">
                    {['200 điểm', '11 câu', '20 phút'].map((fact) => (
                        <li
                            key={fact}
                            className="bg-sub1 px-2.5 py-1 rounded-md font-semibold text-[0.6875rem] text-main tracking-wider"
                        >
                            {fact}
                        </li>
                    ))}
                </ul>
            </div>

            <ol className="gap-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
                {RUBRIC_PARTS.map(({ part, questions, task, description, prepTime, responseTime, criteria }) => (
                    <li key={part} className="flex flex-col justify-between gap-3 bg-sub1/50 p-4 rounded-xl">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center gap-2">
                                <span className="bg-main px-2 py-0.5 rounded-md font-bold text-[11px] text-sub3 uppercase">
                                    {part}
                                </span>
                                <span className="font-mono font-semibold text-subText text-xs">{questions}</span>
                            </div>
                            <h3 className="font-bold text-main text-sm">{task}</h3>
                            <p className="text-subText text-xs leading-relaxed">{description}</p>
                        </div>
                        <dl className="flex flex-col gap-1 bg-white p-2.5 rounded-lg text-xs">
                            {[
                                ['Chuẩn bị', prepTime],
                                ['Trả lời', responseTime],
                            ].map(([term, detail]) => (
                                <div key={term} className="flex justify-between gap-2">
                                    <dt className="text-subText">{term}</dt>
                                    <dd className="font-semibold text-main text-right">{detail}</dd>
                                </div>
                            ))}
                            <div className="pt-1 border-sub2/20 border-t">
                                <dt className="sr-only">Tiêu chí chấm</dt>
                                <dd className="font-semibold text-sub2">{criteria}</dd>
                            </div>
                        </dl>
                    </li>
                ))}
            </ol>

            <div className="flex lg:flex-row flex-col justify-between items-start lg:items-center gap-3 pt-4 border-sub2/20 border-t">
                <ul className="flex flex-wrap gap-x-4 gap-y-2 font-medium text-subText text-xs">
                    {SPEAKING_FORMAT_NOTES.map(({ icon: Icon, label }) => (
                        <li key={label} className="flex items-center gap-1.5">
                            <Icon className="size-4 text-sub2 shrink-0" aria-hidden="true" />
                            {label}
                        </li>
                    ))}
                </ul>
                <Button type="button" size="sm" variant="third" className="gap-2 bg-white text-xs">
                    <LuDownload className="size-4" aria-hidden="true" />
                    <span>Tải PDF hướng dẫn & checklist</span>
                </Button>
            </div>
        </section>
    );
}
