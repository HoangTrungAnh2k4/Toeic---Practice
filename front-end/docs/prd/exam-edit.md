# PRD — Sửa đề + chuyển trạng thái (E5-8)

> Trạng thái: **Đã duyệt, đã triển khai** · 2026-10-20 · Nối tiếp [`exam-builder.md`](exam-builder.md) và [`writing-exam-builder.md`](writing-exam-builder.md).

## Vấn đề

Đề tạo xong nằm mãi ở `draft`: admin không sửa được lỗi trong đề, không gửi thẩm định hay phát hành được nếu không sửa DB tay. Người học chỉ thấy đề `published`, nên hiện chưa có đường nào đưa đề mới tới người học.

## Mục tiêu & chỉ số thành công

- Admin sửa và phát hành một đề hoàn toàn trên giao diện, không cần sửa DB tay.
- 100% đề `published` đủ dữ liệu để làm bài và chấm AI (ảnh, mô tả ảnh, từ khoá, email, ngữ liệu chung theo từng Part).
- Bài làm cũ trong Lịch sử luôn khớp với đề lúc làm: đề đã có lượt làm không bị đổi nội dung câu hỏi.
- R2 không giữ ảnh cũ sau khi thay ảnh.

## User stories

1. Là admin, tôi muốn mở đề nháp trong form quen thuộc để sửa lỗi trước khi phát hành.
2. Là admin, tôi muốn đưa đề qua Nháp → Chờ thẩm định → Đang khả dụng, để có một bước kiểm tra trước khi người học thấy đề.
3. Là admin, tôi muốn trả đề về nháp kèm lý do, để người sửa biết cần sửa gì.
4. Là admin, tôi muốn được báo câu nào còn thiếu dữ liệu khi phát hành, để không phát hành đề hỏng.
5. Là người học, tôi muốn bài làm cũ vẫn hiển thị đúng đề tôi đã làm.

## Trong phạm vi

- **Sửa đề**: route `/setting/exam-management/[id]/edit`, dùng lại form tạo đề với dữ liệu có sẵn. Đề chưa có lượt làm thì sửa được tất cả, kể cả thay ảnh. Đề đã có lượt làm chỉ sửa được thông tin chung (tiêu đề, chủ đề, level, năm), phần Part bị khoá kèm lời giải thích.
- **Trạng thái tuần tự**: Nháp → Chờ thẩm định → Đang khả dụng. Từ Chờ thẩm định hoặc Đang khả dụng có thể "Trả về nháp", bắt buộc ghi lý do (`review_note`). Không nhảy thẳng từ Nháp lên Đang khả dụng. Gửi thẩm định hoặc phát hành thì xoá ghi chú cũ.
- **Kiểm tra khi phát hành**: server kiểm tra đề theo đúng quy tắc của form (`getPartFields`): đủ câu, nội dung câu hỏi, ảnh + mô tả ảnh, 2 từ khoá, email, ngữ liệu chung. Thiếu thì chặn và liệt kê "Câu 3: thiếu mô tả ảnh"...
- **Thao tác trên kho đề**: mỗi dòng có menu "Sửa đề" và nút chuyển trạng thái phù hợp; hiện `review_note` dưới tiêu đề đề nháp bị trả về.

## Ngoài phạm vi

Lịch sử phiên bản đề; nhân bản đề; nhiều vai trò (người soạn khác người duyệt); sửa nội dung đề đã có lượt làm; thông báo cho người soạn khi đề bị trả về; tự động lưu nháp.

## Thiết kế kỹ thuật

- **Đọc đề để sửa**: phía client bằng phiên admin (RLS đã cho admin đọc đề `draft`/`review`), dùng lại `getExamRoom`/`listQuestions`; đổi sang giá trị form. Ảnh có sẵn giữ dạng URL, ảnh mới là `File`.
- **Schema**: `examSchema` nhận thêm `image_path` (ảnh có sẵn) bên cạnh `image` (ảnh mới); câu cần ảnh phải có một trong hai.
- **Lưu** `PUT /api/exams/[id]`: tải ảnh mới lên R2 trước, rồi gọi RPC `update_exam` (một transaction). RPC lỗi thì xoá các ảnh vừa tải. RPC thành công thì xoá các ảnh cũ đã bị thay, nhưng chỉ ảnh dưới `exam-images/` mà không câu nào còn dùng (cùng quy tắc với route xoá đề).
- **RPC `update_exam`** (`security invoker`, RLS admin): cập nhật thông tin chung; nếu payload có `parts` thì cập nhật `exam_parts.context` và từng câu theo (Part, số câu). Đề đã có lượt làm mà payload có `parts` → lỗi `exam_has_attempts`. Cấu trúc Part/câu không đổi được (khung cố định), sai thì lỗi `22023` như `create_exam`.
- **Đổi trạng thái** `POST /api/exams/[id]/status` `{ status, note? }`: kiểm tra chuyển trạng thái hợp lệ; khi phát hành thì nạp đề và kiểm tra theo `getPartFields`; ghi `status`, `review_note` bằng phiên admin.
- **UI**: kho đề dùng shadcn `DropdownMenu` cho menu thao tác dòng, `AlertDialog` cho xác nhận và nhập lý do trả về (dùng `Textarea` có sẵn).

## Trạng thái UI

- **Loading**: trang sửa có skeleton khi nạp đề; nút Lưu và nút chuyển trạng thái disable kèm spinner khi đang gửi.
- **Empty**: id không tồn tại hoặc không có quyền → "Không tìm thấy đề" kèm link về kho đề.
- **Error**: lỗi validate dưới từng field như form tạo đề; phát hành bị chặn thì dialog liệt kê các câu thiếu; lỗi lưu/tải ảnh hiện phía trên form, giữ dữ liệu đã nhập.

## Kiểm thử

- Quy tắc chuyển trạng thái: hợp lệ/không hợp lệ, trả về nháp thiếu lý do.
- Kiểm tra phát hành: đề Speaking/Writing thiếu từng loại dữ liệu → đúng danh sách lỗi.
- Schema: câu có `image_path` cũ không cần chọn lại ảnh.
- pgTAP `update_exam`: student bị chặn; đề có lượt làm sửa `parts` bị chặn nhưng sửa thông tin chung được; sửa câu giữ nguyên `id` câu hỏi.

## Các bước thực hiện

1. RPC `update_exam` + pgTAP.
2. Quy tắc chuyển trạng thái và kiểm tra phát hành (TS thuần, dùng `getPartFields`) + test; route `POST /api/exams/[id]/status`.
3. Menu thao tác dòng + dialog đổi trạng thái/trả về nháp trên kho đề, hiện `review_note`.
4. Schema nhận `image_path`; route `PUT /api/exams/[id]` (ảnh mới → RPC → dọn ảnh cũ).
5. Trang sửa đề dùng lại form, khoá phần Part khi đã có lượt làm.
6. Thử trên app: sửa → gửi thẩm định → phát hành (bị chặn khi thiếu) → trả về nháp. Cập nhật backlog.

## Giả định & câu hỏi mở

- Đã chốt (2026-10-20): đề đã có lượt làm chỉ sửa thông tin chung; trạng thái tuần tự, trả về nháp kèm lý do; chặn phát hành khi thiếu dữ liệu.
- Giả định: chỉ có một vai trò admin, ai cũng duyệt được kể cả người tạo đề.
- Rủi ro: trả một đề đang khả dụng về nháp thì người học mất đề đó khỏi thư viện, và lượt làm cũ của đề đó biến khỏi Lịch sử của họ (Lịch sử bỏ qua lượt làm của đề không đọc được). Dialog trả về nháp phải cảnh báo số lượt làm bị ảnh hưởng.
- Thêm khi triển khai: `private.exam_has_attempts` (security definer) vì RLS `attempts` không cho admin thấy lượt làm của người khác; `examInfoSchema` tách riêng để đề đã có lượt làm (kể cả đề cũ thiếu dữ liệu) vẫn đổi tên được; `lib/exam-images.ts` dùng chung cho tạo/sửa/xoá đề; `review_note` hiện ở cột nguồn dữ liệu có sẵn của bảng.
- Rủi ro: kiểm tra phát hành viết bằng TS ở route, nên ai sửa trực tiếp `exams.status` trên DB (admin qua Studio) thì vẫn bỏ qua được.
