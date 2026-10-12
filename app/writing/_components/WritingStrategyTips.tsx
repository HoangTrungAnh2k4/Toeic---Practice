import { LuLightbulb } from 'react-icons/lu';
import { PART_STRATEGIES } from '../utils';

export default function WritingStrategyTips() {
    return (
        <section
            aria-labelledby="writing-strategy-title"
            className="flex flex-col gap-5 bg-white shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl"
        >
            <div className="flex items-start gap-3">
                <span className="flex justify-center items-center bg-sub3 rounded-lg size-10 text-main shrink-0">
                    <LuLightbulb className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sub2 text-xs uppercase tracking-wider">
                        Bí quyết phòng thi CBT · ETS Scoring Secrets
                    </span>
                    <h2 id="writing-strategy-title" className="font-bold text-main text-xl tracking-tight">
                        Chiến thuật tối ưu điểm từng phần thi TOEIC Writing
                    </h2>
                    <p className="font-medium text-subText text-sm">
                        Đúc kết từ kinh nghiệm luyện thi 200/200 và thuật toán chấm rubric tự động của AI.
                    </p>
                </div>
            </div>

            <div className="gap-4 grid grid-cols-1 lg:grid-cols-3">
                {PART_STRATEGIES.map(({ part, timing, tips, formula }) => (
                    <div key={part} className="flex flex-col justify-between gap-4 bg-sub1/50 p-4 rounded-xl">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                                <h3 className="font-bold text-main text-xs uppercase tracking-wider">{part}</h3>
                                <span className="bg-white px-2 py-0.5 rounded-md font-semibold text-[11px] text-subText">
                                    {timing}
                                </span>
                            </div>
                            <ul className="flex flex-col gap-2">
                                {tips.map(({ icon: Icon, title, description }) => (
                                    <li key={title} className="flex flex-col gap-1 bg-white p-3 rounded-lg">
                                        <span className="flex items-center gap-1.5 font-semibold text-main text-sm">
                                            <Icon className="size-4 text-sub2 shrink-0" aria-hidden="true" />
                                            {title}
                                        </span>
                                        <p className="text-subText text-xs leading-relaxed">{description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="bg-main px-3 py-2 rounded-lg font-semibold text-sub3 text-xs">{formula}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
