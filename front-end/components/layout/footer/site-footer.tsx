import Link from 'next/link';
import packageJson from '@/package.json';
import { cn } from '@/lib/utils';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import type { Skill } from '@/lib/domain/types';
import { author, copyrightYear, linkGroups } from './footer-data';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sub3';

/**
 * Footer toàn cục. Nền `bg-main` nối liền với đáy sidebar thành khung chữ L;
 * pseudo-element `before` tạo góc bo ngược bên trái để vùng nội dung phía trên trông như được bo tròn.
 */
const SKILL_ROWS: { skill: Skill; name: string; note: string; href: string }[] = [
    { skill: 'speaking', name: 'TOEIC Speaking', note: '11 câu, 5 Part', href: '/speaking' },
    { skill: 'writing', name: 'TOEIC Writing', note: '8 câu, 3 Part', href: '/writing' },
];

/** Số đề đã phát hành mỗi kỹ năng; lỗi thì ẩn khối thay vì làm hỏng cả trang (footer nằm ở root layout). */
async function countPublishedExams() {
    try {
        const exams = await getExamSummaries();
        return (skill: Skill) => exams.filter((exam) => exam.skill === skill && exam.status === 'published').length;
    } catch {
        return null;
    }
}

export async function SiteFooter() {
    const countBySkill = await countPublishedExams();

    return (
        <footer className="@container before:-top-6 before:left-0 before:absolute relative bg-main before:bg-[radial-gradient(circle_at_100%_0,transparent_23.5px,var(--main)_24px)] px-4 sm:px-8 pt-12 pb-8 before:size-6 text-sub1 before:content-['']">
            <div className="flex flex-col gap-12 mx-auto w-full max-w-360">
                <div className="gap-10 @4xl:gap-8 grid @2xl:grid-cols-2 @4xl:grid-cols-12">
                    {/* Thương hiệu + tác giả */}
                    <div className="flex flex-col gap-6 @4xl:col-span-3">
                        <p className="max-w-xs text-sub1/75 text-sm leading-6">
                            Luyện TOEIC Speaking và Writing mỗi ngày, có điểm và nhận xét ngay sau khi nộp bài.
                        </p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-white text-sm">{author.name}</span>
                                    <span className="text-sub1/75 text-xs">{author.role}</span>
                                </div>
                            </div>
                            <ul className="flex items-center gap-2">
                                {author.links.map(({ label, href, icon: Icon }) => (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            aria-label={label}
                                            target={href.startsWith('http') ? '_blank' : undefined}
                                            rel={href.startsWith('http') ? 'noreferrer' : undefined}
                                            className={cn(
                                                'place-items-center grid border border-sub2/50 hover:border-sub3 rounded-lg size-9 text-sub1 hover:text-sub3 transition-colors',
                                                focusRing,
                                            )}
                                        >
                                            <Icon aria-hidden="true" size={22} />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Kho đề */}
                    <section aria-labelledby="footer-library" className="@4xl:col-span-4">
                        {countBySkill && (
                            <>
                                <h2 id="footer-library" className="font-semibold text-white text-sm">
                                    Kho đề
                                </h2>
                                <dl className="mt-4 divide-y divide-sub2/30">
                                    {SKILL_ROWS.map(({ skill, name, note, href }) => (
                                        <div
                                            key={skill}
                                            className="flex justify-between items-baseline gap-4 py-2.5 first:pt-0"
                                        >
                                            <dt className="flex flex-col">
                                                <Link
                                                    href={href}
                                                    className={cn('rounded-sm text-white hover:text-sub3 text-sm', focusRing)}
                                                >
                                                    {name}
                                                </Link>
                                                <span className="text-sub1/70 text-xs">{note}</span>
                                            </dt>
                                            <dd className="font-semibold tabular-nums text-sub3 text-sm shrink-0">
                                                {countBySkill(skill)} đề
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </>
                        )}
                    </section>

                    {/* Liên kết */}
                    <div className="flex justify-evenly @4xl:col-span-4">
                        {linkGroups.map((group) => (
                            <nav key={group.title} aria-label={group.title} className="">
                                <h2 className="font-semibold text-white text-sm">{group.title}</h2>
                                <ul className="flex flex-col gap-3 mt-4">
                                    {group.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className={cn(
                                                    'rounded-sm text-sub1/75 hover:text-white text-sm transition-colors',
                                                    focusRing,
                                                )}
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>

                <div className="flex @3xl:flex-row flex-col @3xl:justify-between gap-2 @3xl:gap-8 pt-6 border-sub2/30 border-t text-sub1/70 text-xs leading-5">
                    <p className="shrink-0">
                        © {copyrightYear} Toeco. Phiên bản {packageJson.version}.
                    </p>
                    <p className="@3xl:text-right">
                        TOEIC® là nhãn hiệu đã đăng ký của ETS. Toeco không liên kết với ETS và không được ETS xác nhận.
                    </p>
                </div>
            </div>
        </footer>
    );
}
