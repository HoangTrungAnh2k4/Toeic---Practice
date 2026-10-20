import { LuChevronRight } from 'react-icons/lu';
import Link from 'next/link';
import { SettingGroup } from '../types';

interface SettingGroupSectionProps {
    group: SettingGroup;
}

export default function SettingGroupSection({ group }: SettingGroupSectionProps) {
    const { id, title, Icon, sections } = group;
    const titleId = `setting-group-${id}-title`;

    return (
        <section id={id} aria-labelledby={titleId} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <h2 id={titleId} className="font-bold text-[#333] text-lg tracking-tight">
                    {title}
                </h2>
                <div className="flex-1 border-sub2/30 border-b"></div>
            </div>

            <ul className="bg-white shadow-sm border border-sub2/30 rounded-xl divide-y divide-sub2/20 overflow-hidden">
                {sections.map((section) => (
                    <li key={section.id}>
                        <Link
                            href={section.href}
                            className="group flex items-center gap-4 hover:bg-sub1/50 p-4 sm:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3 focus-visible:ring-inset transition-colors"
                        >
                            <span className="flex justify-center items-center bg-sub1 rounded-lg size-11 text-main shrink-0">
                                <section.Icon className="size-5" aria-hidden="true" />
                            </span>
                            <span className="flex flex-col flex-1 gap-0.5 min-w-0">
                                <span className="font-semibold text-main">{section.title}</span>
                                <span className="font-medium text-subText text-sm leading-relaxed">
                                    {section.description}
                                </span>
                            </span>
                            <span className="hidden xl:inline font-semibold text-main text-sm whitespace-nowrap">
                                {section.actionLabel}
                            </span>
                            <LuChevronRight
                                className="size-5 text-sub2 group-hover:text-main transition-transform group-hover:translate-x-0.5 shrink-0"
                                aria-hidden="true"
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
