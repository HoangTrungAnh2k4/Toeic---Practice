import { LuCircleAlert, LuCircleCheck, LuCloudDownload, LuSave, LuSend, LuX } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PartContentMap, StudioExam } from '../types';
import { isPartComplete } from '../utils';

interface StudioOutlineProps {
    exam: StudioExam;
    drafts: PartContentMap;
    dirtyPartIds: string[];
    activePartId: string;
    completion: number;
    lastSavedAt: string | null;
    notice: string;
    onSelectPart: (partId: string) => void;
    onSaveAll: () => void;
    onPublish: () => void;
    onClose: () => void;
}

export default function StudioOutline({
    exam,
    drafts,
    dirtyPartIds,
    activePartId,
    completion,
    lastSavedAt,
    notice,
    onSelectPart,
    onSaveAll,
    onPublish,
    onClose,
}: StudioOutlineProps) {
    const hasUnsaved = dirtyPartIds.length > 0;
    const isReady = completion === 100;
    const publishHint = hasUnsaved
        ? 'Lưu các thay đổi trước khi xuất bản.'
        : !isReady
          ? 'Hoàn thiện các Part còn thiếu để xuất bản.'
          : 'Đề đã sẵn sàng phát hành cho thí sinh.';

    return (
        <aside
            aria-label="Mục lục bản thảo"
            className="flex flex-col gap-4 bg-white shadow-sm p-4 border border-sub2/30 rounded-xl"
        >
            {/* Draft meta */}
            <div className="flex flex-col gap-2 bg-main p-4 rounded-lg">
                <div className="flex justify-between items-center gap-2">
                    <span className="font-semibold text-sub2 text-xs uppercase tracking-wider">Bản thảo đang mở</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded font-mono font-semibold text-sub3 text-xs">
                        {exam.id}
                    </span>
                </div>
                <h3 className="font-bold text-white text-base leading-snug">{exam.title}</h3>
                <p className="flex items-center gap-1.5 text-sub1 text-xs">
                    <LuCloudDownload className="size-3.5 text-sub3 shrink-0" aria-hidden="true" />
                    {exam.sourceLabel} · {lastSavedAt ? `Đã lưu lúc ${lastSavedAt}` : exam.updatedLabel}
                </p>
                <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex justify-between items-center font-semibold text-xs">
                        <span className="text-sub1">Độ hoàn thiện</span>
                        <span className={isReady ? 'text-success' : 'text-sub3'}>
                            {completion}%{isReady ? ' · Sẵn sàng phát hành' : ''}
                        </span>
                    </div>
                    <div
                        role="progressbar"
                        aria-label="Độ hoàn thiện đề thi"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={completion}
                        className="bg-white/15 rounded-full w-full h-1.5 overflow-hidden"
                    >
                        <div
                            className={cn(
                                'rounded-full h-full transition-all duration-500',
                                isReady ? 'bg-success' : 'bg-sub3',
                            )}
                            style={{ width: `${completion}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Part navigator */}
            <nav aria-labelledby="studio-outline-title" className="flex flex-col gap-1">
                <span
                    id="studio-outline-title"
                    className="px-1 pb-1 font-semibold text-subText text-xs uppercase tracking-wider"
                >
                    Các phần thi TOEIC Speaking
                </span>
                <ul className="flex flex-col gap-1">
                    {exam.parts.map((part) => {
                        const isActive = part.id === activePartId;
                        const isDirty = dirtyPartIds.includes(part.id);
                        const isComplete = isPartComplete(part, drafts[part.id]);

                        return (
                            <li key={part.id}>
                                <button
                                    type="button"
                                    onClick={() => onSelectPart(part.id)}
                                    aria-current={isActive ? 'true' : undefined}
                                    className={cn(
                                        'group flex justify-between items-center gap-3 p-2.5 rounded-lg w-full text-left transition-colors cursor-pointer',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
                                        isActive ? 'bg-main shadow-sm' : 'hover:bg-sub1/60',
                                    )}
                                >
                                    <span className="flex items-center gap-3 min-w-0">
                                        <span
                                            className={cn(
                                                'flex justify-center items-center rounded-md size-8 font-bold text-xs shrink-0',
                                                isActive ? 'bg-sub3 text-main' : 'bg-sub1 text-main',
                                            )}
                                        >
                                            {part.code}
                                        </span>
                                        <span className="flex flex-col min-w-0">
                                            <span
                                                className={cn(
                                                    'font-semibold text-sm truncate',
                                                    isActive ? 'text-white' : 'text-main',
                                                )}
                                            >
                                                {part.title}
                                            </span>
                                            <span
                                                className={cn('text-xs truncate', isActive ? 'text-sub1' : 'text-subText')}
                                            >
                                                {part.summary}
                                            </span>
                                        </span>
                                    </span>

                                    {isDirty ? (
                                        <span className="bg-sub3 px-1.5 py-0.5 rounded font-semibold text-main text-xs whitespace-nowrap shrink-0">
                                            Chưa lưu
                                        </span>
                                    ) : isComplete ? (
                                        <span className="shrink-0">
                                            <LuCircleCheck
                                                className={cn('size-4', isActive ? 'text-sub3' : 'text-success')}
                                                aria-hidden="true"
                                            />
                                            <span className="sr-only">Đã hoàn thiện</span>
                                        </span>
                                    ) : (
                                        <span className="shrink-0">
                                            <LuCircleAlert className="size-4 text-destructive" aria-hidden="true" />
                                            <span className="sr-only">Còn thiếu nội dung</span>
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Draft actions */}
            <div className="flex flex-col gap-2 bg-sub1/40 p-3 rounded-lg">
                <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={onPublish}
                    disabled={hasUnsaved || !isReady}
                    aria-describedby="studio-publish-hint"
                    className="gap-2 w-full"
                >
                    <LuSend className="size-4" aria-hidden="true" />
                    Xuất bản lên Thư viện đề
                </Button>
                <div className="gap-2 grid grid-cols-2">
                    <Button
                        type="button"
                        variant="third"
                        size="sm"
                        onClick={onSaveAll}
                        disabled={!hasUnsaved}
                        className="gap-1.5 bg-white text-xs"
                    >
                        <LuSave className="size-3.5" aria-hidden="true" />
                        Lưu bản nháp
                    </Button>
                    <Button
                        type="button"
                        variant="third"
                        size="sm"
                        onClick={onClose}
                        className="gap-1.5 bg-white hover:bg-destructive text-xs"
                    >
                        <LuX className="size-3.5" aria-hidden="true" />
                        Đóng Studio
                    </Button>
                </div>
                <p id="studio-publish-hint" className="text-subText text-xs">
                    {publishHint}
                </p>
                <p role="status" aria-live="polite" className="font-semibold text-main text-xs">
                    {notice}
                </p>
            </div>
        </aside>
    );
}
