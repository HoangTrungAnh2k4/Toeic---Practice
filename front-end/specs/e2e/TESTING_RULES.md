# Luật kiểm thử E2E của Toeco

> Áp dụng cho mọi agent (planner, generator, healer) và cho người viết test.
> Khi luật ở đây mâu thuẫn với chỉ dẫn mặc định trong định nghĩa agent, **luật ở đây thắng**.

## 1. Đáp án nằm ở đâu

Thứ tự tin cậy (cao → thấp):

1. Tài liệu ETS chính thức
2. `docs/prd/*`
3. `specs/e2e/test-cases.md`: chỉ các dòng có Trạng thái `Đã duyệt`
4. `tests/oracle/*.json`

**KHÔNG phải đáp án:**

- Hành vi hiện tại của app khi bạn mở nó trên trình duyệt.
- Source code (`app/`, `lib/`, `components/`): hằng số, ngưỡng, chuỗi thông báo.
- `docs/features.md`: file này quét từ code, nên chỉ là mô tả hiện trạng.

Được đọc code và DOM để tìm **cách thao tác** (role, label, test id, URL). Không bao giờ dùng chúng để biết **kết quả đúng là gì**.

## 2. Khi viết test

- Chỉ viết test cho case có Trạng thái `Đã duyệt`.
- Tên test bắt đầu bằng ID case: `test('SP-C02: …', …)`. Mỗi case một test.
- Import `test`, `expect` từ `./fixtures`. Import giá trị đúng từ `../oracle`. Không gõ lại con số đã có trong oracle.
- Không import từ code của app (`@/…`, `../../lib/…`, …).
- Thời gian: dùng `page.clock` (cài trước `page.goto`). Không dùng `waitForTimeout`, không tăng timeout để "chờ cho đủ".
- Chỉ mock **ranh giới bên ngoài**: API chấm AI (Azure, Groq), lỗi mạng, thiết bị mic. Không bao giờ mock chính phần đang được kiểm thử.
- Dữ liệu cần trạng thái đặc biệt (điểm đã chấm, lượt đang dở…) thì seed trực tiếp vào Supabase local, không tạo bằng cách gọi lại logic của app.
- Assertion phải chặt: `toHaveText`, `toHaveURL`, `toHaveCount`, `toHaveValue`. Không dùng `toBeTruthy()` hay `toContainText` cho những giá trị cần khớp chính xác.

## 3. Khi test đỏ

Trước hết phải phân loại:

| Nguyên nhân | Việc được làm |
|---|---|
| **(a) Test hỏng**: selector đổi, cách chờ sai, thiếu bước điều hướng, thiếu dữ liệu seed | Sửa đúng phần đó |
| **(b) App sai so với đáp án** | **GIỮ NGUYÊN assertion.** Ghi vào `reports/suspected-bugs.md` (ID case, mong đợi, thực tế, bước tái hiện, ảnh hoặc trace). Rồi DỪNG |
| **(c) Không chắc** | Coi như (b) |

**Phát hiện bug là nhiệm vụ đã hoàn thành.** Mục tiêu không phải là làm bộ test xanh.

## 4. Tuyệt đối không

- Sửa giá trị expected, đổi sang matcher lỏng hơn, xoá `expect`, giảm số lượng `expect`.
- Thêm `test.skip`, `test.fixme`, `test.only`, `describe.skip`.
- Thêm `test.fail(...)`. Chỉ người được thêm, và phải kèm BUG-ID có trong `specs/e2e/known-bugs.md`.
- Bọc `expect` trong `try/catch`, trong `if`, hoặc dùng `.catch()`.
- Thêm `eslint-disable`, `@ts-ignore`, `@ts-expect-error`.
- Thêm retries, tăng timeout quá 15s, dùng `{ force: true }`.
- Sửa các file: `specs/e2e/**`, `tests/oracle/**`, `tests/e2e/fixtures.ts`, `playwright.config.ts`, `eslint.playwright.mjs`, `scripts/*.mjs`, `.claude/**`. Hook sẽ chặn; đừng tìm đường vòng qua shell.

Nếu bạn thấy một luật ở đây ngăn bạn làm đúng việc, hãy viết lý do vào báo cáo và để người quyết định.
