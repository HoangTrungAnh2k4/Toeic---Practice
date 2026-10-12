'use client';

import { useEffect, useRef, useState } from 'react';
import { LuSparkles } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { parseStudy4Test, validateStudy4Url } from '../_lib/study4Parser';
import { useStudioDraft } from '../_lib/useStudioDraft';
import { ParseStatus, StudioExam } from '../types';
import { DEFAULT_STUDY4_URL, IMPORT_STUDIO_ID, STUDIO_EXAM, formatTime, getCompletionPercent } from '../utils';
import DiscardChangesDialog from './DiscardChangesDialog';
import ParseStatusBanner from './ParseStatusBanner';
import PartEditor from './PartEditor';
import Study4ImportForm from './Study4ImportForm';
import StudioEmptyState from './StudioEmptyState';
import StudioOutline from './StudioOutline';
import StudioSkeleton from './StudioSkeleton';

type DiscardAction = 'close' | 'parse';

interface DiscardDialogState {
    open: boolean;
    action: DiscardAction;
    unsavedCount: number;
}

const DISCARD_ACTION_LABEL: Record<DiscardAction, string> = {
    close: 'Đóng Studio',
    parse: 'Bóc tách đề mới',
};

const STACKED_LAYOUT_QUERY = '(max-width: 1023px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export default function ImportStudio() {
    const [url, setUrl] = useState(DEFAULT_STUDY4_URL);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [status, setStatus] = useState<ParseStatus>('success');
    const [parseError, setParseError] = useState<string | null>(null);
    const [exam, setExam] = useState<StudioExam | null>(STUDIO_EXAM);
    const [activePartId, setActivePartId] = useState('p3');
    // Giữ action & số Part khi đóng dialog để nội dung không đổi trong lúc chạy animation
    const [discardDialog, setDiscardDialog] = useState<DiscardDialogState>({
        open: false,
        action: 'close',
        unsavedCount: 0,
    });
    const [notice, setNotice] = useState('');
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
    const requestIdRef = useRef(0);
    const editorRef = useRef<HTMLDivElement>(null);
    const studio = useStudioDraft(STUDIO_EXAM.parts);

    const { hasUnsavedChanges } = studio;
    const activePart = exam?.parts.find((part) => part.id === activePartId) ?? exam?.parts[0];
    const completion = exam ? getCompletionPercent(exam.parts, studio.drafts) : 0;

    // Cảnh báo khi rời trang mà còn thay đổi chưa lưu
    useEffect(() => {
        if (!hasUnsavedChanges) return;
        const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const startParse = async () => {
        const requestId = ++requestIdRef.current;
        setStatus('parsing');
        setParseError(null);
        setNotice('');

        try {
            const result = await parseStudy4Test(url);
            if (requestId !== requestIdRef.current) return;
            setExam(result);
            studio.load(result.parts);
            setActivePartId(result.parts[0]?.id ?? '');
            setLastSavedAt(null);
            setStatus('success');
        } catch (error) {
            if (requestId !== requestIdRef.current) return;
            setParseError(error instanceof Error ? error.message : null);
            setStatus('error');
        }
    };

    const closeStudio = () => {
        setExam(null);
        studio.load([]);
        setStatus('idle');
        setNotice('');
        setLastSavedAt(null);
    };

    const handleUrlChange = (value: string) => {
        setUrl(value);
        if (fieldError) setFieldError(null);
    };

    const openDiscardDialog = (action: DiscardAction) =>
        setDiscardDialog({ open: true, action, unsavedCount: studio.dirtyPartIds.length });

    const handleSubmit = () => {
        const error = validateStudy4Url(url);
        setFieldError(error);
        if (error) return;
        if (hasUnsavedChanges) {
            openDiscardDialog('parse');
            return;
        }
        void startParse();
    };

    const handleClose = () => {
        if (hasUnsavedChanges) {
            openDiscardDialog('close');
            return;
        }
        closeStudio();
    };

    const handleConfirmDiscard = () => {
        setDiscardDialog((prev) => ({ ...prev, open: false }));
        if (discardDialog.action === 'close') closeStudio();
        else void startParse();
    };

    const handleSelectPart = (partId: string) => {
        setActivePartId(partId);
        // Trên màn hình nhỏ, trình biên tập nằm dưới mục lục nên cần cuộn tới
        if (window.matchMedia(STACKED_LAYOUT_QUERY).matches) {
            const behavior = window.matchMedia(REDUCED_MOTION_QUERY).matches ? 'auto' : 'smooth';
            editorRef.current?.scrollIntoView({ behavior, block: 'start' });
        }
    };

    const stampSavedTime = () => setLastSavedAt(formatTime(new Date()));

    const handleSavePart = () => {
        if (!activePart) return;
        studio.savePart(activePart.id);
        stampSavedTime();
        setNotice(`Đã lưu thay đổi ${activePart.code}.`);
    };

    const handleSaveAll = () => {
        studio.saveAll();
        stampSavedTime();
        setNotice('Đã lưu bản nháp cho toàn bộ đề thi.');
    };

    const handleRestorePart = () => {
        if (!activePart) return;
        studio.restorePart(activePart.id);
        setNotice(`Đã khôi phục ${activePart.code} về dữ liệu gốc từ Study4.`);
    };

    const handlePublish = () => {
        setNotice(`Đã xuất bản lên Thư viện đề lúc ${formatTime(new Date())}.`);
    };

    const session =
        status === 'parsing'
            ? { label: 'Đang bóc tách dữ liệu…', dotClassName: 'bg-sub3 motion-safe:animate-pulse' }
            : exam
              ? { label: `Đang mở: ${exam.id}`, dotClassName: 'bg-success motion-safe:animate-pulse' }
              : { label: 'Chưa mở bản thảo', dotClassName: 'bg-sub2' };

    return (
        <section id={IMPORT_STUDIO_ID} aria-labelledby="import-studio-title" className="flex flex-col gap-4 scroll-mt-4">
            {/* Section header */}
            <div className="flex sm:flex-row flex-col justify-between sm:items-end gap-3">
                <div className="flex items-start gap-3">
                    <span className="flex justify-center items-center bg-sub3 shadow-sm rounded-lg size-10 text-main shrink-0">
                        <LuSparkles className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                        <h2 id="import-studio-title" className="font-bold text-main text-lg">
                            Study4 AI Import & Studio biên tập
                        </h2>
                        <p className="font-medium text-subText text-xs leading-relaxed">
                            Bóc tách đề trực tuyến từ Study4 sang chuẩn IIG/ETS, sau đó chỉnh sửa và kiểm duyệt từng
                            Part.
                        </p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 border border-sub2/30 rounded-full font-semibold text-main text-xs whitespace-nowrap">
                    <span className={cn('rounded-full size-2', session.dotClassName)} aria-hidden="true" />
                    {session.label}
                </span>
            </div>

            {/* Import box */}
            <div className="flex flex-col gap-4 bg-white shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl">
                <Study4ImportForm
                    url={url}
                    error={fieldError}
                    isParsing={status === 'parsing'}
                    onUrlChange={handleUrlChange}
                    onSubmit={handleSubmit}
                />
                <ParseStatusBanner status={status} exam={exam} errorMessage={parseError} />
            </div>

            {/* Studio workspace */}
            {status === 'parsing' ? (
                <StudioSkeleton />
            ) : exam && activePart ? (
                <div className="items-start gap-4 grid grid-cols-1 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <StudioOutline
                            exam={exam}
                            drafts={studio.drafts}
                            dirtyPartIds={studio.dirtyPartIds}
                            activePartId={activePart.id}
                            completion={completion}
                            lastSavedAt={lastSavedAt}
                            notice={notice}
                            onSelectPart={handleSelectPart}
                            onSaveAll={handleSaveAll}
                            onPublish={handlePublish}
                            onClose={handleClose}
                        />
                    </div>
                    <div ref={editorRef} className="lg:col-span-8 scroll-mt-4">
                        <PartEditor
                            part={activePart}
                            content={studio.drafts[activePart.id]}
                            isDirty={studio.dirtyPartIds.includes(activePart.id)}
                            isModified={studio.isModified(activePart.id)}
                            onContextChange={(value) => studio.updateContext(activePart.id, value)}
                            onPromptChange={(index, value) => studio.updatePrompt(activePart.id, index, value)}
                            onSave={handleSavePart}
                            onRestore={handleRestorePart}
                        />
                    </div>
                </div>
            ) : (
                <StudioEmptyState />
            )}

            <DiscardChangesDialog
                open={discardDialog.open}
                unsavedCount={discardDialog.unsavedCount}
                confirmLabel={DISCARD_ACTION_LABEL[discardDialog.action]}
                onOpenChange={(open) => setDiscardDialog((prev) => ({ ...prev, open }))}
                onConfirm={handleConfirmDiscard}
            />
        </section>
    );
}
