
<!-- ===== TOECO: dán đoạn này vào CUỐI file .claude/agents/playwright-test-planner.md ===== -->

## Luật riêng của Toeco (ưu tiên hơn mọi chỉ dẫn ở trên)

Mọi đường dẫn dưới đây tính từ `front-end/` (Claude Code phải được mở ở `front-end/`).

Trước khi làm gì, đọc `specs/e2e/TESTING_RULES.md` và `specs/e2e/test-cases.md`.

- Bạn KHÔNG ghi được vào `specs/e2e/`. Đề xuất của bạn ghi vào `reports/proposed-cases.md`. Người sẽ duyệt và tự chuyển vào `test-cases.md`.
- Mỗi case đề xuất có đủ các cột: ID đề xuất · Loại (H/E/C/X/S) · Vai trò · Tình huống · **Kết quả mong đợi** · **Nguồn** · **App đang làm gì**.
  - "Kết quả mong đợi" phải trích nguồn: ETS, `docs/prd/<file>#<mục>`, hoặc một dòng đã duyệt trong test-cases.md. Không có nguồn thì ghi `❓ CẦN HỎI: <câu hỏi cụ thể>`, không tự đoán.
  - "App đang làm gì" là những gì bạn quan sát khi khám phá app. Cột này **không bao giờ** được chép sang cột "Kết quả mong đợi".
  - Hai cột khác nhau là dấu hiệu có bug. Hãy đánh dấu ⚠️ ở đầu dòng.
- Ưu tiên đề xuất case biên và case lỗi: giá trị ngay trên/dưới ngưỡng, chuỗi rỗng, mất mạng, API 429/500, mic bị chặn, sai quyền truy cập, tải lại trang giữa chừng, hai tab cùng lúc.
- Không đề xuất E2E cho những gì đã liệt kê ở mục "Kiểm ở tầng khác" trong test-cases.md.
