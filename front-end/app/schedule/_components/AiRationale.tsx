import Link from 'next/link';
import { LuArrowRight, LuBrain } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { SKILL_STYLE } from '../_lib/skillStyle';
import { AiInsight, InsightTone } from '../types';

interface AiRationaleProps {
    insights: AiInsight[];
    confidence: number;
}

const TONE_STYLE: Record<InsightTone, string> = {
    critical: 'bg-destructive/10 text-destructive',
    warning: 'bg-sub3/25 text-main',
};

export default function AiRationale({ insights, confidence }: AiRationaleProps) {
    return (
        <section
            aria-labelledby="ai-rationale-title"
            className="flex flex-col gap-4 bg-white shadow-sm p-5 border border-sub2/30 rounded-xl"
        >
            <div className="flex sm:flex-row flex-col justify-between sm:items-start gap-3">
                <div className="flex items-start gap-3">
                    <span className="flex justify-center items-center bg-main rounded-lg size-10 text-sub3 shrink-0">
                        <LuBrain className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                        <h2 id="ai-rationale-title" className="font-bold text-main text-lg">
                            Vì sao lộ trình tuần này như vậy?
                        </h2>
                        <p className="font-medium text-subText text-xs">
                            Phân tích tự động từ 28 bài làm và 452 phân đoạn âm thanh gần nhất.
                        </p>
                    </div>
                </div>
                <span className="self-start bg-sub1 px-2 py-1 rounded-md font-semibold text-[11px] text-main whitespace-nowrap">
                    Độ tin cậy {confidence}%
                </span>
            </div>

            {insights.length === 0 ? (
                <p className="bg-sub1/40 p-4 rounded-lg font-medium text-subText text-xs text-center">
                    Chưa đủ dữ liệu để phân tích. Hoàn thành thêm vài bài để nhận đề xuất cá nhân hóa.
                </p>
            ) : (
                <ul className="gap-3 grid grid-cols-1 lg:grid-cols-2">
                    {insights.map((insight) => {
                        const style = SKILL_STYLE[insight.skill];

                        return (
                            <li
                                key={insight.id}
                                className="flex flex-col gap-3 bg-sub1/30 p-4 border border-sub2/20 rounded-lg"
                            >
                                <div className="flex items-start gap-3">
                                    <span
                                        className={cn(
                                            'flex justify-center items-center rounded-lg size-9 shrink-0',
                                            style.className,
                                        )}
                                    >
                                        <style.Icon className="size-4" aria-hidden="true" />
                                    </span>
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <h3 className="font-semibold text-main text-sm">{insight.title}</h3>
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 rounded-md w-fit font-semibold text-[11px]',
                                                TONE_STYLE[insight.tone],
                                            )}
                                        >
                                            {insight.metric}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-subText text-xs leading-relaxed">
                                    {insight.summary}
                                    <strong className="font-semibold text-main">{insight.highlight}</strong>
                                    {insight.conclusion}
                                </p>
                                <div className="flex flex-wrap justify-between items-center gap-2 mt-auto pt-1">
                                    <span className="flex items-center gap-1.5 font-medium text-[11px] text-subText">
                                        <span className="bg-main rounded-full size-1.5" aria-hidden="true" />
                                        {insight.tag}
                                    </span>
                                    <Link
                                        href={insight.href}
                                        className="inline-flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-semibold text-main text-xs hover:underline underline-offset-4"
                                    >
                                        {insight.linkLabel}
                                        <LuArrowRight className="size-3.5" aria-hidden="true" />
                                    </Link>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
