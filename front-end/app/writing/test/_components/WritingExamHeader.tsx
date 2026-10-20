import { LuCheck, LuCloudAlert, LuLoaderCircle, LuLock, LuLogOut, LuPenLine, LuSave, LuTimer } from 'react-icons/lu';
import type { AttemptMode, PartTemplate } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { SaveStatus } from '../types';
import { EXAM_SECTIONS, formatTime, TIME_WARNING_SECONDS } from '../utils';

interface WritingExamHeaderProps {
    title: string;
    mode: AttemptMode;
    template: PartTemplate;
    /** Câu đang làm; Part tính giờ từng câu hiển thị đồng hồ của câu này. */
    questionNumber: number;
    /** `null` = không giới hạn giờ (chế độ có hướng dẫn). */
    secondsLeft: number | null;
    saveStatus: SaveStatus;
    savedAt: number | null;
    isRestored: boolean;
    onExit: () => void;
}

const MODE_LABEL: Record<AttemptMode, string> = {
    cbt: 'Thi thử chuẩn CBT',
    timed: 'Luyện có thời gian',
    guided: 'Học có hướng dẫn',
};

function SaveIndicator({ saveStatus, savedAt, isRestored }: Pick<WritingExamHeaderProps, 'saveStatus' | 'savedAt' | 'isRestored'>) {
    if (saveStatus === 'saving') {
        return (
            <>
                <LuLoaderCircle className="size-4 text-sub3 animate-spin" aria-hidden="true" />
                <span>Đang lưu bản nháp...</span>
            </>
        );
    }

    if (saveStatus === 'error') {
        return (
            <>
                <LuCloudAlert className="size-4 text-destructive" aria-hidden="true" />
                <span>Không thể lưu nháp trên trình duyệt này</span>
            </>
        );
    }

    const label =
        saveStatus === 'saved' && savedAt
            ? `Đã lưu nháp lúc ${new Date(savedAt).toLocaleTimeString('vi-VN')}`
            : isRestored
              ? 'Đã khôi phục bản nháp trước đó'
              : 'Tự động lưu nháp đang bật';

    return (
        <>
            <LuSave className="size-4 text-sub3" aria-hidden="true" />
            <span>{label}</span>
        </>
    );
}

export default function WritingExamHeader({
    title,
    mode,
    template,
    questionNumber,
    secondsLeft,
    saveStatus,
    savedAt,
    isRestored,
    onExit,
}: WritingExamHeaderProps) {
    const isUntimed = secondsLeft === null;
    const isTimeUp = secondsLeft === 0;
    const isWarning = !isUntimed && !isTimeUp && secondsLeft <= TIME_WARNING_SECONDS;
    const timeLabel = isUntimed ? 'Không giới hạn' : formatTime(secondsLeft);
    const activeSectionIndex = template.part_no - 1;
    const { q_from, q_to, section_sec, response_sec } = template;
    const timerScope = section_sec ? `Q${q_from}–${q_to}` : `Q${questionNumber}`;
    const questionMin = (response_sec?.[questionNumber - q_from] ?? 0) / 60;
    const timeNote = section_sec
        ? `${section_sec / 60} phút dùng chung cho ${q_to - q_from + 1} câu`
        : q_from === q_to
          ? `${questionMin} phút cho câu này`
          : `${questionMin} phút mỗi câu, giờ dư của câu trước được cộng dồn`;

    return (
        <header className="shadow-sm border border-sub2/30 rounded-xl w-full overflow-hidden">
            {/* Exam title, mode & exit */}
            <div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3 bg-main px-4 sm:px-6 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-3">
                        <span className="flex justify-center items-center bg-sub3 shadow-sm rounded-xl size-9 text-main">
                            <LuPenLine className="size-5" aria-hidden="true" />
                        </span>
                        <div className="leading-tight">
                            <p className="font-medium text-[11px] text-sub2 uppercase tracking-widest">Bài thi Writing</p>
                            <h1 className="font-semibold text-sub1 text-base sm:text-lg tracking-tight">{title}</h1>
                        </div>
                    </div>

                    <span className="hidden md:block bg-sub2/30 w-px h-8" aria-hidden="true" />

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-sub3/15 px-3 py-1 border border-sub3/40 rounded-full font-semibold text-sub3 text-xs uppercase tracking-wider">
                            <LuTimer className="size-3.5" aria-hidden="true" />
                            {MODE_LABEL[mode]}
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-sub1/10 px-2.5 py-1 rounded-full font-medium text-sub1/80 text-xs">
                            <LuLock className="size-3.5 text-sub2" aria-hidden="true" />
                            Chuẩn ETS CBT · Tắt kiểm tra chính tả
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    <p
                        className="hidden sm:flex items-center gap-1.5 font-medium text-sub1/80 text-xs"
                        role="status"
                        aria-live="polite"
                    >
                        <SaveIndicator saveStatus={saveStatus} savedAt={savedAt} isRestored={isRestored} />
                    </p>

                    <button
                        type="button"
                        onClick={onExit}
                        className="inline-flex items-center gap-1.5 hover:bg-sub3 px-3.5 py-2 border border-sub2/50 hover:border-sub3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3 focus-visible:ring-offset-2 focus-visible:ring-offset-main font-semibold text-sub1 hover:text-main text-xs transition-colors duration-200 cursor-pointer"
                    >
                        <LuLogOut className="size-4" aria-hidden="true" />
                        <span>Thoát bài thi</span>
                    </button>
                </div>
            </div>

            {/* Section stepper & countdown */}
            <div className="bg-white px-4 sm:px-6 py-3.5">
                <div className="flex md:flex-row flex-col justify-between items-center gap-4">
                    <ol aria-label="Các nhóm câu hỏi" className="flex items-center gap-2 pb-1 md:pb-0 w-full md:w-auto overflow-x-auto text-xs">
                        {EXAM_SECTIONS.map((section, index) => {
                            const isActive = index === activeSectionIndex;
                            const isDone = index < activeSectionIndex;
                            return (
                                <li key={section.id} className="flex items-center gap-2 shrink-0">
                                    {index > 0 && <span className="max-sm:hidden bg-sub2/60 w-4 h-px" aria-hidden="true" />}
                                    <span
                                        aria-current={isActive ? 'step' : undefined}
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-full font-medium',
                                            isActive && 'bg-main px-3 py-1 font-semibold text-sub1 shadow-md shadow-main/25',
                                            isDone && 'text-main/70',
                                            !isActive && !isDone && 'text-main/50',
                                        )}
                                    >
                                        {isActive && <span className="bg-sub3 rounded-full size-2" aria-hidden="true" />}
                                        {isDone && <LuCheck className="size-3.5 text-sub2" aria-hidden="true" />}
                                        {!isActive && !isDone && <LuLock className="size-3.5" aria-hidden="true" />}
                                        {/* 375px không đủ chỗ cho cả 3 nhãn: nhóm chưa/đã làm chỉ hiện số câu */}
                                        <span>
                                            {section.range}
                                            <span className={cn(!isActive && 'max-sm:sr-only')}>: {section.label}</span>
                                        </span>
                                    </span>
                                </li>
                            );
                        })}
                    </ol>

                    <div className="flex justify-between md:justify-end items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col text-left md:text-right">
                            <span className="font-semibold text-[11px] text-main uppercase tracking-wider">
                                Thời gian còn lại ({timerScope})
                            </span>
                            <span className="text-subText text-xs">
                                {isUntimed
                                    ? 'Tự do thời gian, có thể làm lại nhiều lần'
                                    : isTimeUp
                                      ? 'Đã hết giờ — bài làm bị khóa'
                                      : timeNote}
                            </span>
                        </div>

                        <div
                            className={cn(
                                'flex items-center gap-2.5 shadow-sm px-4 py-1.5 border rounded-xl transition-colors',
                                isTimeUp && 'border-sub2 bg-white',
                                isWarning && 'border-destructive bg-destructive',
                                !isTimeUp && !isWarning && 'border-sub3 bg-main',
                            )}
                        >
                            <span
                                className={cn(
                                    'rounded-full size-2.5',
                                    isTimeUp ? 'bg-sub2' : 'animate-pulse',
                                    isWarning ? 'bg-white' : !isTimeUp && 'bg-sub3',
                                )}
                                aria-hidden="true"
                            />
                            <span
                                role="timer"
                                aria-label={isUntimed ? 'Không giới hạn thời gian' : `Còn lại ${timeLabel}`}
                                className={cn(
                                    'font-mono font-bold tabular-nums text-xl tracking-tight',
                                    isTimeUp ? 'text-main' : isWarning ? 'text-white' : 'text-sub3',
                                )}
                            >
                                {timeLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
