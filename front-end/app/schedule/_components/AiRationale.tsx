import Link from 'next/link';
import { LuArrowRight, LuBrain } from 'react-icons/lu';
import type { AiInsight, AiInsightItem } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { SKILL_STYLE } from '../_lib/skillStyle';

interface AiRationaleProps {
    /** Bản `ai_insights` mới nhất; `null` khi AI chưa phân tích. */
    insight: AiInsight | null;
}

const TONE_STYLE: Record<AiInsightItem['tone'], string> = {
    critical: 'bg-destructive/10 text-destructive',
    warning: 'bg-sub3/25 text-main',
};

export default function AiRationale({ insight }: AiRationaleProps) {
    const items = insight?.payload.items ?? [];

    return (
        <section
            aria-labelledby="ai-rationale-title"
            className="flex flex-col gap-4 bg-white shadow-sm p-5 border border-sub2/30 rounded-xl"
        >
            <div className="flex items-start gap-3">
                <span className="flex justify-center items-center bg-main rounded-lg size-10 text-sub3 shrink-0">
                    <LuBrain className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-0.5">
                    <h2 id="ai-rationale-title" className="font-bold text-main text-lg">
                        Vì sao lộ trình tuần này như vậy?
                    </h2>
                    {insight && (
                        <p className="font-medium text-subText text-xs">
                            Phân tích tự động từ {insight.payload.based_on_attempts} bài làm gần nhất.
                        </p>
                    )}
                </div>
            </div>

            {items.length === 0 ? (
                <p className="bg-sub1/40 p-4 rounded-lg font-medium text-subText text-xs text-center">
                    Chưa đủ dữ liệu để phân tích. Hoàn thành thêm vài bài để nhận đề xuất cá nhân hóa.
                </p>
            ) : (
                <ul className="gap-3 grid grid-cols-1 lg:grid-cols-2">
                    {items.map((item, index) => {
                        const style = SKILL_STYLE[item.skill];

                        return (
                            <li
                                key={index}
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
                                        <h3 className="font-semibold text-main text-sm">{item.title}</h3>
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 rounded-md w-fit font-semibold text-[11px]',
                                                TONE_STYLE[item.tone],
                                            )}
                                        >
                                            {item.metric}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-subText text-xs leading-relaxed">{item.body}</p>
                                <Link
                                    href={item.href}
                                    className="inline-flex items-center self-end gap-1 mt-auto rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-semibold text-main text-xs hover:underline underline-offset-4"
                                >
                                    {item.action_label}
                                    <LuArrowRight className="size-3.5" aria-hidden="true" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
