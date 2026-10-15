/** Đổi version khi shape của row thay đổi — dữ liệu cũ bị bỏ qua thay vì làm vỡ UI. */
const PREFIX = 'toeco:v1:';

/**
 * Đọc một "bảng" lưu trong localStorage. Hỏng, trống hoặc bị chặn truy cập đều trả về mảng rỗng.
 * shortcut: không validate từng row, chỉ dựa vào version key; thêm zod schema nếu dữ liệu từng lệch shape.
 */
export function readTable<T>(table: string): T[] {
    try {
        const raw = localStorage.getItem(PREFIX + table);
        const rows: unknown = raw ? JSON.parse(raw) : [];
        return Array.isArray(rows) ? (rows as T[]) : [];
    } catch {
        return [];
    }
}

/** Ghi đè cả bảng. Ném lỗi khi trình duyệt chặn hoặc hết dung lượng để UI báo "không lưu được". */
export function writeTable<T>(table: string, rows: T[]): void {
    try {
        localStorage.setItem(PREFIX + table, JSON.stringify(rows));
    } catch (error) {
        throw new Error(`Không lưu được dữ liệu "${table}" trên trình duyệt.`, { cause: error });
    }
}
