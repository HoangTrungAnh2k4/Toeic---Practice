import { LuAward, LuLock, LuMic, LuTimer } from 'react-icons/lu';
import { getPartDurationSec, getPartTemplates, TEST_DURATION_MIN } from '@/lib/domain/parts';
import type { PartTemplate, Skill } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { IoTimerOutline } from 'react-icons/io5';
import { CiMicrophoneOn } from 'react-icons/ci';

const SHEETS: { skill: Skill; title: string; answerVerb: string; fill: string; tilt: string }[] = [
    { skill: 'speaking', title: 'TOEIC Speaking Test', answerVerb: 'nói', fill: 'bg-main', tilt: '-rotate-1 self-end' },
    { skill: 'writing', title: 'TOEIC Writing Test', answerVerb: 'viết', fill: 'bg-sub2', tilt: 'rotate-1 self-start' },
];

const FEATURES = [
    'Đếm ngược đúng từng giây',
    'Beep rồi tự ghi âm',
    'Hết giờ tự khóa bài',
    'Chấm theo rubric ETS, thang 0–200'
];

const fmt = (sec: number) => (sec >= 60 ? `${sec / 60} phút` : `${sec}s`);

/** Từng câu của Part: giây chuẩn bị (gồm thời gian đọc ngữ liệu chung ở câu đầu) và giây trả lời. */
function questionSlots(part: PartTemplate) {
    const count = part.q_to - part.q_from + 1;
    return Array.from({ length: count }, (_, i) => ({
        q: part.q_from + i,
        prep: (part.prep_sec ?? 0) + (i === 0 ? (part.context_sec ?? 0) : 0),
        answer: part.response_sec?.[i] ?? (part.section_sec ?? 0) / count,
    }));
}

function partTiming(part: PartTemplate, answerVerb: string) {
    if (part.section_sec) return `${fmt(part.section_sec)} cho ${part.q_to - part.q_from + 1} câu`;
    const answers = part.response_sec ?? [];
    const min = Math.min(...answers);
    const max = Math.max(...answers);
    return [
        part.context_sec && `${fmt(part.context_sec)} đọc`,
        part.prep_sec && `${fmt(part.prep_sec)} chuẩn bị`,
        `${min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`} ${answerVerb}`,
    ]
        .filter(Boolean)
        .join(' · ');
}

/** Một "tờ đề": dải thời gian tỉ lệ theo số giây thật của từng câu, và bảng Part. */
function ExamSheet({ skill, title, answerVerb, fill, tilt }: (typeof SHEETS)[number]) {
    const parts = getPartTemplates(skill);
    const total = parts.at(-1)?.q_to ?? 0;

    return (
        <article
            data-reveal
            aria-label={`${title}: ${total} câu, ${TEST_DURATION_MIN[skill]} phút`}
            className={cn(
                'bg-card shadow-[5px_5px_0_0_#000] border-2 border-black rounded-2xl w-full max-w-3xl overflow-hidden',
                tilt,
            )}
        >
            <header className="flex flex-wrap gap-x-6 gap-y-1 bg-sub3 px-4 py-2 border-black border-b-2 font-mono font-semibold text-black text-xs uppercase tracking-wider">
                <span>{title}</span>
                <span>
                    {total} câu · {TEST_DURATION_MIN[skill]} phút
                </span>
            </header>

            <div className="flex flex-col gap-3 p-4">
                {/* Dải minh hoạ; cùng thông tin có ở bảng Part bên dưới cho screen reader */}
                <div aria-hidden="true" className="flex gap-1.5">
                    {parts.map((part) => (
                        // Inline flexGrow: độ rộng tỉ lệ theo số giây, Tailwind không sinh class động được
                        <div key={part.id} style={{ flexGrow: getPartDurationSec(part) ?? 1 }} className="flex flex-col gap-1 min-w-0 basis-0">
                            <span className="font-mono font-semibold text-[0.6875rem] text-subText">P{part.part_no}</span>
                            <div className="flex gap-0.5 h-6">
                                {questionSlots(part).map((slot) => (
                                    <div
                                        key={slot.q}
                                        style={{ flexGrow: slot.prep + slot.answer }}
                                        className="flex border-2 border-black rounded min-w-1.5 overflow-hidden basis-0"
                                    >
                                        {slot.prep > 0 && <span style={{ flexGrow: slot.prep }} className="bg-hatch basis-0" />}
                                        <span style={{ flexGrow: slot.answer }} className={cn('basis-0', fill)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 font-medium text-[0.6875rem] text-subText">
                    <span className="inline-flex items-center gap-1.5">
                        <span aria-hidden="true" className="bg-hatch border border-black rounded-sm size-2.5" />
                        Chuẩn bị, đọc đề
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span aria-hidden="true" className={cn('border border-black rounded-sm size-2.5', fill)} />
                        Thời gian {answerVerb}
                    </span>
                    <span>Mỗi ô là một câu, dài theo đúng số giây.</span>
                </div>

                <ol className="gap-x-4 gap-y-2.5 grid sm:grid-cols-2 lg:grid-cols-3 pt-3 border-sub2/30 border-t-2 border-dashed">
                    {parts.map((part) => (
                        <li key={part.id} className="flex items-start gap-2">
                            <span className="bg-canvas px-1.5 py-0.5 border-2 border-black rounded-md font-mono font-semibold text-[0.6875rem] text-main whitespace-nowrap">
                                {part.q_from === part.q_to ? `Q${part.q_from}` : `Q${part.q_from}–${part.q_to}`}
                            </span>
                            <span className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-semibold text-main text-xs">{part.task}</span>
                                <span className="font-medium text-[0.6875rem] text-subText">{partTiming(part, answerVerb)}</span>
                            </span>
                        </li>
                    ))}
                </ol>
            </div>
        </article>
    );
}

/** Section chuẩn ETS: hai tờ đề xếp lệch như giấy trên bàn, con dấu "đúng format" đè lên góc. */
export default function LandingEtsFormat() {
    return (
        <section id="chuan-ets" aria-labelledby="ets-title" className="bg-dots-inverse bg-main px-4 sm:px-8 py-16 w-full overflow-hidden">
            <div className="flex flex-col gap-10 mx-auto max-w-300">
                {/* z-10: con dấu đè lên tờ đề kể cả lúc hàng này đang fade-up (transform tạo stacking context) */}
                <div data-reveal className="z-10 relative flex flex-wrap justify-between items-end gap-8">
                    <div className="flex flex-col gap-3">
                        <p className="font-semibold text-white text-xs uppercase tracking-wider">Chuẩn ETS, Format</p>
                        <h2 id="ets-title" className="font-bold text-sub3 text-4xl sm:text-5xl leading-[1.1] tracking-tight">
                            Đề nào cũng đúng
                            <br />
                            <span className="inline-block bg-sub3 mt-1 px-3 pb-1.5 rounded-lg text-main -rotate-1">
                                từng giây
                            </span>{' '}
                            đề thật.
                        </h2>
                        <p className="max-w-xl font-medium text-white leading-relaxed">
                            Mọi đề trên Toeco theo cấu trúc TOEIC Speaking & Writing hiện hành của ETS: cùng số câu, cùng thứ tự
                            Part, cùng thời gian chuẩn bị và trả lời.
                        </p>
                    </div>

                    <div
                        aria-hidden="true"
                        className="z-10 relative place-content-center grid bg-card shadow-[4px_4px_0_0_#000] lg:-mb-24 p-2 border-2 border-black rounded-full size-36 rotate-12 motion-safe:animate-stamp motion-safe:[animation-delay:300ms]"
                    >
                        <div className="place-content-center grid border-2 border-main border-dashed rounded-full size-full text-main text-center">
                            <span className="font-mono font-semibold text-[0.6875rem] uppercase tracking-wider">Format</span>
                            <span className="font-bold text-3xl leading-none tracking-tight">ETS</span>
                            <span className="font-hand text-subText text-lg leading-tight">chuẩn từng câu</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {SHEETS.map((sheet) => (
                        <ExamSheet key={sheet.skill} {...sheet} />
                    ))}
                </div>

                <ul className="flex flex-wrap gap-3">
                    {FEATURES.map((label) => (
                        <li
                            key={label}
                            data-reveal
                            className="inline-flex items-center gap-2 bg-card shadow-[3px_3px_0_0_#000] px-3 py-2 border-2 border-black rounded-lg font-semibold text-main text-sm"
                        >
                            {label}
                        </li>
                    ))}
                </ul>


            </div>
        </section>
    );
}
