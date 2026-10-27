import { LuDownload, LuShieldCheck } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { RUBRIC_PARTS } from '../utils';

export default function WritingRubricGuide() {
    return (
        <section
            id="rubric-guide"
            aria-labelledby="writing-rubric-title"
            className="flex flex-col gap-5 bg-white shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl scroll-mt-4"
        >
            <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-3">
                <h2 id="writing-rubric-title" className="font-bold text-main text-xl tracking-tight">
                    Cấu trúc đề & tiêu chí chấm
                </h2>
                <ul className="flex flex-wrap gap-2">
                    {['200 điểm', '8 câu', '60 phút'].map((fact) => (
                        <li
                            key={fact}
                            className="bg-sub1 px-2.5 py-1 rounded-md font-semibold text-[0.6875rem] text-main tracking-wider"
                        >
                            {fact}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                {RUBRIC_PARTS.map(({ part, timing, task, prompt, requirement, criteria }) => (
                    <div key={part} className="flex flex-col gap-3 bg-sub1/50 p-4 rounded-xl">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <span className="bg-main px-2 py-0.5 rounded-md font-bold text-[11px] text-sub3 uppercase">
                                {part}
                            </span>
                            <span className="font-semibold text-subText text-xs">{timing}</span>
                        </div>
                        <h3 className="font-bold text-main text-sm">{task}</h3>
                        <dl className="flex flex-col gap-1.5 text-subText text-xs leading-relaxed">
                            {[
                                ['Đề bài', prompt],
                                ['Yêu cầu', requirement],
                                ['Tiêu chí', criteria],
                            ].map(([term, detail]) => (
                                <div key={term}>
                                    <dt className="inline font-semibold text-main">{term}: </dt>
                                    <dd className="inline">{detail}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ))}
            </div>

            <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-3 pt-4 border-sub2/20 border-t">
                <p className="flex items-center gap-2 font-medium text-subText text-xs">
                    <LuShieldCheck className="size-4 text-sub2 shrink-0" aria-hidden="true" />
                    Hệ thống tuân thủ quy chế kiểm soát thời gian độc lập của ETS.
                </p>
                <Button type="button" size="sm" variant="third" className="gap-2 bg-white text-xs">
                    <LuDownload className="size-4" aria-hidden="true" />
                    <span>Tải PDF hướng dẫn & checklist</span>
                </Button>
            </div>
        </section>
    );
}
