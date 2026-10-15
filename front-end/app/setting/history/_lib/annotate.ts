import type { Annotation } from '@/lib/domain/types';

export interface PlacedAnnotation {
    annotation: Annotation;
    /** Số thứ tự hiển thị, theo vị trí xuất hiện trong câu trả lời. */
    number: number;
    /** Có tô sáng được trong câu trả lời không (offset sai hoặc chồng lấn → chỉ hiện trong danh sách). */
    isHighlighted: boolean;
}

export interface ResponseSegment {
    text: string;
    placed?: PlacedAnnotation;
}

/** Cắt câu trả lời theo `start_offset`/`end_offset` thành đoạn thường / đoạn bị nhận xét để tô sáng tại chỗ. */
export function placeAnnotations(response: string, annotations: Annotation[]) {
    const sorted = [...annotations].sort((a, b) => a.start_offset - b.start_offset || a.end_offset - b.end_offset);
    const placed: PlacedAnnotation[] = [];
    const segments: ResponseSegment[] = [];
    let cursor = 0;

    sorted.forEach((annotation, index) => {
        const { start_offset: start, end_offset: end } = annotation;
        const isHighlighted = start >= cursor && start < end && end <= response.length;
        const item = { annotation, number: index + 1, isHighlighted };
        placed.push(item);
        if (!isHighlighted) return;

        if (start > cursor) segments.push({ text: response.slice(cursor, start) });
        segments.push({ text: response.slice(start, end), placed: item });
        cursor = end;
    });
    if (cursor < response.length) segments.push({ text: response.slice(cursor) });
    return { placed, segments };
}
