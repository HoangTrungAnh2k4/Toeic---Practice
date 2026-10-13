import { ResponseAnnotation } from '@/app/mistakes/types';

export interface PlacedAnnotation {
    annotation: ResponseAnnotation;
    /** Số thứ tự hiển thị, theo vị trí xuất hiện trong câu trả lời. */
    number: number;
    /** Có tô sáng được trong câu trả lời không (không tìm thấy hoặc chồng lấn → chỉ hiện trong danh sách). */
    isHighlighted: boolean;
}

export interface ResponseSegment {
    text: string;
    placed?: PlacedAnnotation;
}

/** Cắt câu trả lời thành các đoạn thường / đoạn bị nhận xét để tô sáng tại chỗ. */
export function placeAnnotations(response: string, annotations: ResponseAnnotation[]) {
    const located = annotations
        .map((annotation) => ({ annotation, start: response.indexOf(annotation.quote) }))
        .sort(
            (a, b) =>
                (a.start < 0 ? Number.MAX_SAFE_INTEGER : a.start) - (b.start < 0 ? Number.MAX_SAFE_INTEGER : b.start),
        );

    const placed: PlacedAnnotation[] = [];
    const segments: ResponseSegment[] = [];
    let cursor = 0;

    located.forEach(({ annotation, start }, index) => {
        const isHighlighted = start >= cursor;
        const item = { annotation, number: index + 1, isHighlighted };
        placed.push(item);
        if (!isHighlighted) return;

        if (start > cursor) segments.push({ text: response.slice(cursor, start) });
        segments.push({ text: annotation.quote, placed: item });
        cursor = start + annotation.quote.length;
    });

    if (cursor < response.length) segments.push({ text: response.slice(cursor) });

    return { placed, segments };
}
