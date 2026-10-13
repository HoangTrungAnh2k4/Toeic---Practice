import { LuCheck, LuListChecks, LuMessageSquareText, LuX } from 'react-icons/lu';
import { MistakeRemedy as Remedy } from '../../types';
import SectionHeading from './SectionHeading';

interface MistakeRemedyProps {
    remedy: Remedy;
}

const SUBTITLE_CLASS = 'font-bold text-main text-sm';

export default function MistakeRemedy({ remedy }: MistakeRemedyProps) {
    return (
        <section
            id="remedy"
            aria-labelledby="mistake-remedy-title"
            className="flex flex-col gap-5 bg-card shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl scroll-mt-4"
        >
            <SectionHeading id="mistake-remedy-title" eyebrow="Lời giải" title="Cách khắc phục" />

            {/* Core rule */}
            <div className="flex flex-col gap-1 bg-main px-4 py-3 rounded-xl">
                <span className="font-semibold text-sub3 text-xs uppercase tracking-wider">Nguyên tắc</span>
                <p className="font-semibold text-sub1 text-sm leading-relaxed">{remedy.rule}</p>
            </div>

            {/* Before / after */}
            <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
                <div className="flex flex-col gap-2 bg-sub1/50 p-4 rounded-xl">
                    <span className="flex items-center gap-1.5 font-semibold text-subText text-xs uppercase tracking-wider">
                        <LuX className="size-4" aria-hidden="true" />
                        Câu chưa đạt
                    </span>
                    <p className="font-medium text-main text-sm italic leading-relaxed">“{remedy.model.before}”</p>
                </div>
                <div className="flex flex-col gap-2 bg-success/15 p-4 border border-success/60 rounded-xl">
                    <span className="flex items-center gap-1.5 font-semibold text-main text-xs uppercase tracking-wider">
                        <LuCheck className="size-4" aria-hidden="true" />
                        Nên sửa thành
                    </span>
                    <p className="font-medium text-main text-sm italic leading-relaxed">“{remedy.model.after}”</p>
                </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-3">
                <h3 className={SUBTITLE_CLASS}>Các bước luyện</h3>
                <ol className="flex flex-col gap-2">
                    {remedy.steps.map((step, index) => (
                        <li key={step} className="flex items-start gap-3">
                            <span className="flex justify-center items-center bg-sub3 rounded-full size-6 font-bold text-main text-xs shrink-0">
                                {index + 1}
                            </span>
                            <span className="pt-0.5 font-medium text-main text-sm leading-relaxed">{step}</span>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Phrases */}
            <div className="flex flex-col gap-3">
                <h3 className={SUBTITLE_CLASS}>Cụm từ dùng ngay</h3>
                <ul className="gap-2 grid grid-cols-1 sm:grid-cols-2">
                    {remedy.phrases.map(({ phrase, usage }) => (
                        <li key={phrase} className="flex items-start gap-2 bg-sub1/50 p-3 rounded-lg">
                            <LuMessageSquareText className="mt-0.5 size-4 text-sub2 shrink-0" aria-hidden="true" />
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-semibold text-main text-sm break-words">{phrase}</span>
                                <span className="text-subText text-xs">{usage}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Self-check */}
            <div className="flex flex-col gap-3 pt-4 border-sub2/20 border-t">
                <h3 className={SUBTITLE_CLASS}>Tự kiểm tra trước khi nộp</h3>
                <ul className="flex flex-col gap-2">
                    {remedy.checklist.map((item) => (
                        <li key={item} className="flex items-start gap-2 font-medium text-main text-sm">
                            <LuListChecks className="mt-0.5 size-4 text-sub2 shrink-0" aria-hidden="true" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
