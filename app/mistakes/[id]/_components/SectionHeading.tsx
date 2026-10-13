import type { ReactNode } from 'react';

interface SectionHeadingProps {
    id: string;
    eyebrow: string;
    title: string;
    action?: ReactNode;
}

export default function SectionHeading({ id, eyebrow, title, action }: SectionHeadingProps) {
    return (
        <div className="flex flex-wrap justify-between items-end gap-2">
            <div className="flex flex-col gap-1">
                <span className="font-semibold text-subText text-xs uppercase tracking-wider">{eyebrow}</span>
                <h2 id={id} className="font-bold text-main text-xl tracking-tight">
                    {title}
                </h2>
            </div>
            {action}
        </div>
    );
}
