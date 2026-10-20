import type { ExamValues } from './examSchema';

/** File không đi qua JSON: mỗi ảnh thành một field `image-<n>`, JSON giữ tên field đó ở chỗ của ảnh. */
export function toExamFormData(values: ExamValues): FormData {
    const body = new FormData();
    let count = 0;
    const payload = JSON.stringify(values, (_key, value) => {
        if (!(value instanceof File)) return value;
        const name = `image-${count++}`;
        body.append(name, value);
        return name;
    });
    body.append('payload', payload);
    return body;
}

/** Ngược lại `toExamFormData`; kết quả chưa tin được, phải parse lại bằng `examSchema`. */
export function fromExamFormData(body: FormData): unknown {
    const payload = body.get('payload');
    if (typeof payload !== 'string') return null;
    try {
        return JSON.parse(payload, (key, value) =>
            key === 'image' && typeof value === 'string' ? body.get(value) : value,
        );
    } catch {
        return null;
    }
}
