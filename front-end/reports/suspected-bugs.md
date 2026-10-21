# Bug nghi ngờ

Agent ghi vào đây; chỉ người chuyển bug thật sang `specs/e2e/known-bugs.md`.
Các mục dưới đây phát hiện khi đối chiếu `docs/prd/*` với code (2026-10-21), chưa chạy app. Chưa mục nào được xác nhận.

## A. PRD và code mâu thuẫn

### SB-01. Điểm mục tiêu không chọn được 0 (PL-E04)

- **PRD** (`study-plan.md#Trong phạm vi`): điểm mục tiêu Speaking/Writing 0–200, bước 10.
- **Code**: ô chọn trong `PlanGoalDialog` chỉ có 200 → 10 và "Không luyện"; zod `planForm.ts` đặt `min(10)`. Không chọn được 0.
- **Ảnh hưởng**: thấp (mục tiêu 0 ít ý nghĩa), nhưng PRD và code lệch nhau. Sửa PRD hoặc sửa form.

### SB-02. Task thi thử Writing: PRD gọi là giới hạn, `known-bugs.md` gọi là bug (PL-C02)

- **PRD** (`study-plan.md#Giả định & câu hỏi mở`): "task thi thử Writing được đánh dấu xong ngay khi nộp Part đầu của đề đó" là giới hạn chấp nhận.
- **`known-bugs.md`**: BUG-04 coi đúng hành vi đó là bug.
- **Cần quyết**: một trong hai tài liệu phải sửa trước khi duyệt PL-C02.

### SB-03. Route chấm Speaking nhận câu của đề nháp khi người gọi là admin

- **PRD** (`scoring.md#Thiết kế kỹ thuật`): route lấy câu hỏi từ DB, "đề phải `published`".
- **Code** (`app/api/speaking/score/route.ts`): đọc câu bằng phiên người gọi, RLS cho admin đọc đề `draft`/`review`, nên admin xem trước vẫn chấm được (tốn lượt chấm thật). PRD Writing (`writing-scoring.md`) ghi rõ "admin xem trước được", PRD Speaking thì không.
- **Ảnh hưởng**: thấp. Cần chốt Speaking có cho admin chấm khi xem trước hay không (liên quan BUG-03).

### SB-04. Nộp bài Speaking không qua trạng thái `submitted`

- **PRD** (`scoring.md#Thiết kế kỹ thuật`, Luồng): bấm Kết thúc → "đặt attempt `submitted`, gọi `/api/speaking/finalize` → `scored`".
- **Code** (`app/api/speaking/finalize/route.ts`): chỉ nhận attempt `in_progress` và chuyển thẳng sang `scored` (ghi luôn `submitted_at`).
- **Ảnh hưởng**: thấp, người học không thấy khác biệt. Nếu finalize lỗi giữa chừng, lượt vẫn ở `in_progress` thay vì `submitted`.

### SB-05. `exam-builder.md` lỗi thời so với code

- **PRD** (`exam-builder.md#Trạng thái UI`, `#Trong phạm vi / Ngoài phạm vi`):
  - "Trùng `code` thì báo riêng 'Mã đề đã tồn tại'".
  - "Xóa đề thật trong DB: hiện chỉ xóa phía client".
- **Code**:
  - Mã đề tự sinh bằng trigger (migration `20261019100000_auto_exam_code_drop_unused_columns.sql`), admin không nhập mã.
  - Đã có `DELETE /api/exams/[id]`.
- **Đề xuất**: cập nhật PRD. Không viết case cho "Mã đề đã tồn tại".

## B. Code và nguyên tắc bảo mật (không có PRD)

### SB-06. Route quản trị đề không kiểm vai trò admin trước (AU-S04, AU-S07)

- `POST /api/exams`: học viên gửi body sai → 400; body đúng nhưng chưa cấu hình R2 → 500; chỉ khi R2 có cấu hình mới tới RLS → 403.
- `POST /api/exams/[id]/status`: học viên → RLS cập nhật 0 dòng → 404 `not_found`.
- **Không lộ dữ liệu, không ghi được** (RLS chặn), nhưng mã lỗi phụ thuộc thứ tự kiểm tra và cấu hình môi trường.
- PRD (`exam-builder.md#Kiểm thử`) chỉ yêu cầu RLS chặn, nên đây không phải mâu thuẫn PRD. Xem câu hỏi AU-S04, AU-S07.

### SB-07. Form đăng ký cho biết email nào đã có tài khoản (AU-S05)

- `RegisterForm.tsx`: khi Supabase trả user không có identity (email đã tồn tại), form báo "Email này đã được đăng ký, hãy đăng nhập".
- Quên mật khẩu (AU-S01) thì không lộ. Hai luồng không nhất quán về chống dò tài khoản. Xem câu hỏi AU-S05.

## C. Hạ tầng DB

### SB-09. service_role không insert được vào `exams`

- Trigger `exams_set_code` gọi `private.set_exam_code()` với `security invoker`, dùng sequence `private.exam_code_seq`. Migration chỉ `grant usage on schema private to authenticated`.
- **Hậu quả**: mọi insert `exams` bằng service_role lỗi `42501 permission denied for schema private`. Đã thấy khi chạy `pnpm seed:e2e` (2026-10-21); insert bằng phiên admin thì được, service_role xoá đề vẫn được.
- App hiện tạo đề bằng phiên admin (RPC `create_exam`) nên chưa bị ảnh hưởng. Script hoặc route nào sau này ghi `exams` bằng service_role sẽ lỗi.
- **Lựa chọn**: cấp `usage` trên schema `private` (và sequence) cho `service_role`, hoặc đổi trigger sang `security definer`. Hoặc giữ nguyên và ghi đề bằng phiên admin như bản vá seed.

## D. Dữ liệu seed

### SB-08. Tài khoản admin trong `back-end/supabase/seed.sql` không khớp với comment

- Comment ghi một email `@toeco.test` kèm mật khẩu.
- Dòng `insert into auth.users` lại dùng email khác (`admin@gmail.com`) và mật khẩu khác, ngắn hơn 8 ký tự (không đạt `password_requirements` trong `config.toml`; insert thẳng vào DB nên không bị chặn).
- `auth.identities.identity_data.email` thì dùng email theo comment.
- **Hậu quả**: đăng nhập theo comment sẽ thất bại; email của user và của identity lệch nhau.
- **Không tự sửa** theo yêu cầu. E2E không dùng tài khoản này (`scripts/seed-e2e.mjs` tạo tài khoản riêng).
