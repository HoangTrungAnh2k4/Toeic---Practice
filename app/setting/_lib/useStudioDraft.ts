'use client';

import { useCallback, useMemo, useState } from 'react';
import { PartContentMap, StudioPart } from '../types';
import { isSameContent, toPartContentMap } from '../utils';

interface DraftState {
    /** Dữ liệu gốc AI bóc tách từ Study4. */
    original: PartContentMap;
    /** Phiên bản đã lưu gần nhất. */
    saved: PartContentMap;
    /** Nội dung đang chỉnh sửa. */
    drafts: PartContentMap;
}

function createState(parts: StudioPart[]): DraftState {
    const content = toPartContentMap(parts);
    return { original: content, saved: content, drafts: content };
}

/** Quản lý nội dung biên tập theo từng Part: chỉnh sửa, lưu, khôi phục dữ liệu gốc. */
export function useStudioDraft(initialParts: StudioPart[]) {
    const [state, setState] = useState<DraftState>(() => createState(initialParts));

    const load = useCallback((parts: StudioPart[]) => setState(createState(parts)), []);

    const updateContext = useCallback((partId: string, value: string) => {
        setState((prev) => ({
            ...prev,
            drafts: { ...prev.drafts, [partId]: { ...prev.drafts[partId], context: value } },
        }));
    }, []);

    const updatePrompt = useCallback((partId: string, index: number, value: string) => {
        setState((prev) => {
            const prompts = [...prev.drafts[partId].prompts];
            prompts[index] = value;
            return { ...prev, drafts: { ...prev.drafts, [partId]: { ...prev.drafts[partId], prompts } } };
        });
    }, []);

    const savePart = useCallback((partId: string) => {
        setState((prev) => ({ ...prev, saved: { ...prev.saved, [partId]: prev.drafts[partId] } }));
    }, []);

    const saveAll = useCallback(() => setState((prev) => ({ ...prev, saved: prev.drafts })), []);

    const restorePart = useCallback((partId: string) => {
        setState((prev) => ({ ...prev, drafts: { ...prev.drafts, [partId]: prev.original[partId] } }));
    }, []);

    const dirtyPartIds = useMemo(
        () => Object.keys(state.drafts).filter((id) => !isSameContent(state.drafts[id], state.saved[id])),
        [state.drafts, state.saved],
    );

    const isModified = useCallback(
        (partId: string) => !isSameContent(state.drafts[partId], state.original[partId]),
        [state.drafts, state.original],
    );

    return {
        drafts: state.drafts,
        dirtyPartIds,
        hasUnsavedChanges: dirtyPartIds.length > 0,
        isModified,
        load,
        updateContext,
        updatePrompt,
        savePart,
        saveAll,
        restorePart,
    };
}
