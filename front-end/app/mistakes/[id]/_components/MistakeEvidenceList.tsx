import Link from 'next/link';
import { LuArrowRight, LuClock, LuEye, LuInbox } from 'react-icons/lu';
import { getAttemptHref } from '@/app/setting/history/utils';
import { MistakeDetail } from '../../types';
import { formatTimestamp, RESPONSE_VERB } from '../../utils';
import SectionHeading from './SectionHeading';

interface MistakeEvidenceListProps {
    mistake: MistakeDetail;
}

const CHIP_CLASS =
    'inline-flex items-center gap-1 bg-sub1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] text-main tracking-wider';

export default function MistakeEvidenceList({ mistake }: MistakeEvidenceListProps) {
    return (
        <section
            aria-labelledby="mistake-evidence-title"
            className="flex flex-col gap-4 bg-card shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl"
        >
            <SectionHeading
                id="mistake-evidence-title"
                eyebrow={`${mistake.evidence.length} lần ghi nhận`}
                title="Lỗi này trong bài làm của bạn"
            />

            {mistake.evidence.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <LuInbox className="size-6 text-sub2" aria-hidden="true" />
                    <p className="text-subText text-xs">Chưa có trích dẫn nào trong các bài đã chấm.</p>
                </div>
            ) : (
                <ol className="flex flex-col gap-3">
                    {mistake.evidence.map(({ attemptId, code, attemptTitle, submittedAt, assisted, question, annotation }) => (
                        <li key={annotation.id} className="flex flex-col gap-3 bg-sub1/30 p-4 border border-sub2/20 rounded-xl">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="font-semibold text-main text-sm">{attemptTitle}</span>
                                    <span className="font-medium text-subText text-xs tabular-nums">
                                        {code} · {submittedAt}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    <span className={CHIP_CLASS}>Q{question}</span>
                                    {annotation.at_sec !== null && (
                                        <span className={CHIP_CLASS}>
                                            <LuClock className="size-3" aria-hidden="true" />
                                            {formatTimestamp(annotation.at_sec)}
                                        </span>
                                    )}
                                    {assisted && (
                                        <span className={CHIP_CLASS} title="Bài có xem bài mẫu không được tính vào tiến độ khắc phục">
                                            <LuEye className="size-3" aria-hidden="true" />
                                            Có xem bài mẫu
                                        </span>
                                    )}
                                </div>
                            </div>

                            <dl className="gap-2 grid grid-cols-1 md:grid-cols-2">
                                <div className="flex flex-col gap-1 bg-card p-3 border-sub3 border-l-4 rounded-lg">
                                    <dt className="font-semibold text-subText text-xs">{RESPONSE_VERB[mistake.skill]}</dt>
                                    <dd className="font-medium text-main text-sm">“{annotation.quote}”</dd>
                                </div>
                                <div className="flex flex-col gap-1 bg-card p-3 border-success border-l-4 rounded-lg">
                                    <dt className="font-semibold text-subText text-xs">Nên sửa thành</dt>
                                    <dd className="font-medium text-main text-sm">“{annotation.correction}”</dd>
                                </div>
                            </dl>

                            <div className="flex sm:flex-row flex-col justify-between sm:items-end gap-2">
                                <p className="text-subText text-xs leading-relaxed">{annotation.explanation}</p>
                                <Link
                                    href={getAttemptHref(attemptId, annotation.id)}
                                    className="inline-flex items-center gap-1 rounded-md font-semibold text-main text-xs hover:underline underline-offset-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3 shrink-0"
                                >
                                    Xem trong bài làm
                                    <LuArrowRight className="size-3.5" aria-hidden="true" />
                                </Link>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
