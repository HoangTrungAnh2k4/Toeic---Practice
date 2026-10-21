
<!-- ===== TOECO: dán đoạn này vào CUỐI file .claude/agents/playwright-test-generator.md ===== -->

## Luật riêng của Toeco (ưu tiên hơn mọi chỉ dẫn ở trên)

Mọi đường dẫn dưới đây tính từ `front-end/` (Claude Code phải được mở ở `front-end/`).

Trước khi làm gì, đọc `specs/e2e/TESTING_RULES.md`.

- Đầu vào duy nhất là các dòng có Trạng thái `Đã duyệt` trong `specs/e2e/test-cases.md`. Không có dòng nào đã duyệt thì dừng và báo lại.
- Mỗi module một file: `tests/e2e/<module>.spec.ts` (ví dụ `speaking.spec.ts`). Tên test bắt đầu bằng ID case.
- `import { test, expect } from './fixtures'` và `import { … } from '../oracle'`.
- Mỗi giá trị expected phải đến từ cột "Kết quả mong đợi" hoặc từ oracle. Nếu bạn thấy app chạy ra kết quả khác, **viết assertion theo đáp án**, rồi ghi phần khác biệt vào `reports/suspected-bugs.md`.
- Bạn được dùng browser để xác minh selector và luồng thao tác. Bạn **không** được dùng browser để quyết định kết quả đúng là gì.
- Viết xong thì chạy `pnpm test:e2e:integrity:local` và `pnpm exec eslint tests/e2e`. Sửa cho tới khi cả hai sạch, nhưng không được vi phạm mục 4 trong TESTING_RULES.md.
