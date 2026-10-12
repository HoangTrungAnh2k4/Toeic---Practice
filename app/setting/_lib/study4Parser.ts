import { StudioExam } from '../types';
import { STUDIO_EXAM } from '../utils';

const STUDY4_TEST_URL = /^https?:\/\/(www\.)?study4\.com\/tests\/\S+/i;

const MOCK_PARSE_DELAY = 1200;

/** Trả về thông báo lỗi nếu link không hợp lệ, ngược lại trả về `null`. */
export function validateStudy4Url(url: string): string | null {
    const value = url.trim();
    if (!value) return 'Vui lòng dán link bài kiểm tra từ Study4.';
    if (!STUDY4_TEST_URL.test(value)) return 'Link chưa đúng định dạng. Ví dụ: https://study4.com/tests/328/...';
    return null;
}

/**
 * Bóc tách đề thi từ link Study4.
 * Hiện trả về dữ liệu mẫu sau một khoảng trễ — thay bằng lời gọi API thật khi backend sẵn sàng.
 */
export function parseStudy4Test(url: string): Promise<StudioExam> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (validateStudy4Url(url)) {
                reject(new Error('Không đọc được cấu trúc đề từ link này.'));
                return;
            }
            resolve(STUDIO_EXAM);
        }, MOCK_PARSE_DELAY);
    });
}
