/** Tải dữ liệu xuống máy người dùng dưới dạng file `.json`. Chỉ gọi trong event handler phía client. */
export function downloadJson(fileName: string, data: unknown): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
}
