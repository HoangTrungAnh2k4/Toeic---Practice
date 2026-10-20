# PRD — Tạo đề Writing (E5-7)

> Trạng thái: **Đã duyệt, đã triển khai** · 2026-10-20 · Nối tiếp [`exam-builder.md`](exam-builder.md) (Speaking), dùng lại form, RPC `create_exam` và luồng tải ảnh lên R2.

## Vấn đề

Admin chỉ tạo được đề Speaking. Đề Writing (8 câu / 3 Part) phải chèn tay vào DB, nên kho đề Writing không tăng lên, và việc chấm AI phụ thuộc vào mô tả ảnh và từ khoá mà không có form nào bắt buộc nhập.

## Mục tiêu & chỉ số thành công

- Admin tạo xong một đề Writing đủ 8 câu, không cần sửa DB. Đề lưu ở `draft` và xem trước được trong phòng thi.
- Ảnh Q1–5 nằm trên Cloudflare R2. Email và yêu cầu Q6–7, đề luận Q8 lưu dạng text trên Supabase.
- Đề tạo ra chấm AI được ngay: mỗi câu Q1–5 có ảnh, mô tả ảnh chi tiết và đủ 2 từ khoá.
- Không còn đề ghi dở, và R2 không giữ ảnh của đề đã bị huỷ khi lưu lỗi (như Speaking).

## User stories

1. Là admin, tôi muốn chọn tạo đề Speaking hoặc Writing ở cùng một trang và điền theo đúng khung 3 Part, để không phải nhớ số câu.
2. Là admin, tôi muốn tải ảnh Q1–5 lên mà không phải tự nén, để thao tác nhanh.
3. Là admin, tôi chỉ muốn nhập 2 từ khoá gốc mỗi câu Q1–5, để AI tự đánh giá thí sinh dùng từ đúng dạng và đúng nghĩa hay không.
4. Là admin, tôi muốn dán nguyên email Q6–7 vào một ô, để giữ đúng định dạng đề gốc.
5. Là người học, tôi không được thấy đề nháp, để chỉ làm đề đã được duyệt.

## Trong phạm vi

- Trang tạo đề có lựa chọn kỹ năng (Speaking/Writing); form Writing theo `PART_TEMPLATES`:
  - **Part 1 (Q1–5)**: ảnh (bắt buộc), mô tả ảnh tiếng Anh (bắt buộc, tối đa 1.000 ký tự), đúng 2 từ khoá gốc (mỗi từ khoá một ô, không nhập biến thể), bài mẫu.
  - **Part 2 (Q6–7)**: email (một textarea tự do, gồm From/To/Subject/nội dung), yêu cầu (Directions), bài mẫu.
  - **Part 3 (Q8)**: đề bài luận, bài mẫu.
- Nén ảnh phía trình duyệt trước khi gửi: cạnh dài tối đa 1600px, WebP. Áp dụng cho cả ảnh Speaking Part 2.
- Chỉ tạo mới, lưu `draft`. Đề `draft` chỉ admin thấy (xem trước); người học không thấy trong thư viện, mở link trực tiếp thì nhận 404 (RLS đã có từ E5-10, giữ nguyên).
- Chấm Q1–5: bỏ bước server dò từ khoá theo danh sách biến thể; LLM nhận 2 từ khoá gốc và tự đánh giá thí sinh đã dùng đủ chưa (chấp nhận mọi dạng chia, số nhiều, thì) và dùng đúng nghĩa chưa. Vẫn giữ đếm số câu phía server.

## Ngoài phạm vi

Sửa đề và chuyển trạng thái (E5-8); import JSON; tách email thành các ô From/To/Subject; nhập biến thể từ khoá; ảnh cho Q6–8; gợi ý đề bằng AI.

## Thiết kế kỹ thuật

- **Route**: dùng lại `/setting/exam-management/new`, thêm `?skill=writing` (mặc định Speaking). Tiêu đề trang và form đổi theo kỹ năng. Kho đề có hai nút "Tạo đề Speaking" và "Tạo đề Writing" (thay cho menu chọn kỹ năng dự kiến ban đầu, theo bố cục đang có ở `ExamLibrary`).
- **Form**: tách `ExamBuilderForm` để nhận kỹ năng; gộp thành một `examSchema` có trường `skill`; ô nào bắt buộc ở Part nào do bảng `getPartFields` quyết định, dùng chung cho schema và form. Thêm field `stimulus` và `keywords`. `PartSection` render field theo Part. Không thêm component shadcn mới.
- **Nén ảnh**: nén ngay khi chọn/dán ảnh (`lib/image/compress.ts`, canvas → WebP), nên ảnh xem trước cũng là ảnh được gửi. Ảnh gốc tối đa 10 MB, sau nén tối đa 1,5 MB/ảnh, nên 5 ảnh dưới giới hạn body 10 MB của proxy. Ảnh nén lỗi thì báo ngay tại field.
- **API** `POST /api/exams`: nhận `skill` trong form data, validate bằng schema của kỹ năng, phần còn lại giữ nguyên (ghi DB trước, tải ảnh lên R2 sau, lỗi thì hoàn tác).
- **DB**: migration cập nhật RPC `create_exam` để ghi thêm `questions.stimulus` (text) và `questions.keywords` (jsonb `[{word, forms: []}]`: giữ kiểu `RequiredKeyword` hiện có, `forms` để rỗng). Không đổi schema bảng.
- **Phòng thi**: không đổi, đã đọc `stimulus` và `keywords`.
- **Chấm** (`lib/scoring/writing.ts`): phần kiểm tra cứng của Q1–5 chỉ còn số câu; prompt yêu cầu LLM tự xác định từng từ khoá đã được dùng (dạng nào) và rubric vẫn trừ điểm khi thiếu. Xoá `findKeywordUsage` vì không còn ai dùng.
- **Quyền**: `create_exam` là `security invoker`, RLS chỉ cho admin ghi bảng nội dung; route `/setting/exam-management/*` đã chặn người không phải admin.

## Trạng thái UI

- **Loading**: nút Lưu disable kèm spinner trong lúc nén ảnh và lưu.
- **Empty**: form mở sẵn đủ 8 câu rỗng.
- **Error**: lỗi validate hiện dưới từng field, badge đếm lỗi theo Part. Lỗi lưu hoặc tải ảnh hiện phía trên form, giữ nguyên dữ liệu đã nhập. Người không phải admin nhận 403 (đã có).

## Kiểm thử

- `writingExamSchema`: thiếu ảnh, mô tả ảnh hoặc không đủ 2 từ khoá ở Q1–5; thiếu email ở Q6–7; sai số câu → bị chặn.
- Prompt chấm Q1–5 có 2 từ khoá gốc và không còn dòng kiểm tra từ khoá.
- pgTAP: student không gọi được `create_exam` và không đọc được đề `draft`.
- pgTAP: `create_exam` với đề Writing ghi đúng `stimulus`, `keywords`; sai cấu trúc → lỗi `22023`, không sót dòng nào.
- Nén ảnh: ảnh đầu ra là WebP, cạnh dài ≤ 1600px (test thủ công trên trình duyệt).

## Các bước thực hiện

1. Migration `create_exam` ghi `stimulus` + `keywords`, kèm pgTAP.
2. `writingExamSchema` + giá trị rỗng, kèm test; API nhận `skill`.
3. Prompt chấm Q1–5: AI tự đánh giá từ khoá, bỏ dò biến thể phía server.
4. Nén ảnh phía client, dùng chung cho Speaking và Writing.
5. Form Writing (field theo Part), route `?skill=writing`, menu "Tạo đề".
6. Thử tạo một đề Writing → xem trước → làm bài → chấm AI. Cập nhật backlog.

## Giả định & câu hỏi mở

- Đã chốt (2026-10-20): ảnh lưu trên R2, email lưu text trên Supabase; nén ảnh phía client; admin chỉ nhập 2 từ khoá gốc, AI tự đánh giá cách dùng; admin tạo được cả hai kỹ năng; người học không xem được đề nháp; email là một ô text tự do.
- Giả định: đề Writing không có `context` chung cho Part; mỗi câu Q6–7 có email riêng trong `questions.stimulus`.
- Giả định: chủ đề, level mục tiêu và năm ấn bản dùng chung danh sách với Speaking.
- Thêm khi triển khai: yêu cầu Q1–5 điền sẵn câu chuẩn ETS; gợi ý "đã dùng từ khoá" trong phòng thi khớp từ gốc + hậu tố (desk → desks), dạng bất quy tắc (women, carried) chỉ được AI nhận khi chấm.
- Đo thật (2026-10-20): ảnh 2400×1800 nén còn 1600×1200 WebP ~187 KB; tạo đề 5 ảnh → R2 + DB thành công; chấm Q1–5 với từ khoá chỉ có từ gốc cho điểm hợp lý.
- Rủi ro: Safari cũ không xuất được WebP từ canvas. Khi đó trình duyệt trả PNG, ảnh vẫn được chấp nhận nhưng nặng hơn.
