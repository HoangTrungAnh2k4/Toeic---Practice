import { LuArrowRight } from 'react-icons/lu';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SettingSection } from '../types';

interface SettingSectionCardProps {
    section: SettingSection;
}

export default function SettingSectionCard({ section }: SettingSectionCardProps) {
    const { id, title, description, href, actionLabel, Icon } = section;
    const titleId = `setting-section-${id}`;

    return (
        <article
            aria-labelledby={titleId}
            className="flex flex-col gap-4 bg-white shadow-sm hover:shadow-md p-5 border border-sub2/30 rounded-xl transition-shadow"
        >
            <span className="flex justify-center items-center bg-main rounded-lg size-11 text-sub3 shrink-0">
                <Icon className="size-5" aria-hidden="true" />
            </span>

            <div className="flex flex-col gap-1">
                <h3 id={titleId} className="font-bold text-main text-lg">
                    {title}
                </h3>
                <p className="text-subText text-sm leading-relaxed">{description}</p>
            </div>

            <Link
                href={href}
                aria-describedby={titleId}
                className={cn(buttonVariants({ variant: 'third', size: 'md' }), 'gap-2 self-end bg-white mt-auto')}
            >
                <span>{actionLabel}</span>
                <LuArrowRight className="size-4" aria-hidden="true" />
            </Link>
        </article>
    );
}
