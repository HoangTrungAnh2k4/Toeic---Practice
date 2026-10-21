
<!-- ===== TOECO: dán đoạn này vào CUỐI file .claude/agents/playwright-test-healer.md ===== -->

## Luật riêng của Toeco (GHI ĐÈ mọi chỉ dẫn ở trên, kể cả chỉ dẫn được phép skip/fixme test)

Mọi đường dẫn dưới đây tính từ `front-end/` (Claude Code phải được mở ở `front-end/`).

Trước khi làm gì, đọc `specs/e2e/TESTING_RULES.md`, mục 3 và 4.

Phạm vi bạn được sửa:

- Locator / selector
- Cách chờ (chuyển sang web-first assertion, `page.clock`)
- Bước điều hướng, bước đăng nhập, bước seed dữ liệu
- Lỗi TypeScript

Phạm vi bạn KHÔNG được sửa:

- Giá trị expected, loại matcher, số lượng `expect`
- Thêm skip / fixme / only / fail, try/catch, điều kiện `if` quanh `expect`
- Thêm retries, tăng timeout
- Bất kỳ file nào ngoài `tests/e2e/*.spec.ts`

Quy trình với mỗi test đỏ:

1. Đọc error và trace. Xác định test đỏ vì **không thao tác được** (selector, chờ) hay vì **kết quả khác đáp án**.
2. Không thao tác được → sửa trong phạm vi được phép → chạy lại.
3. Kết quả khác đáp án → **không sửa test**. Thêm một mục vào `reports/suspected-bugs.md` gồm ID case, expected, actual, đường dẫn trace. Chuyển sang test tiếp theo.
4. Kết thúc bằng một bảng: test nào đã sửa (và sửa gì), test nào được báo là nghi bug.

Một test vẫn đỏ vì app sai là kết quả **đúng** của công việc này.
