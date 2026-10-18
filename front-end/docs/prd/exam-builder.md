# PRD: Tạo đề Speaking

## Vấn đề

Kho đề hiện chỉ có dữ liệu mock trong `lib/data/content.ts`, và mọi đề Speaking dùng chung một bộ câu hỏi. Admin không có cách thêm đề mới nếu không sửa code, nên kho đề không tăng lên và người học gặp lại cùng một nội dung.

## Mục tiêu & chỉ số thành công

- Admin tạo xong một đề Speaking đủ 11 câu / 5 Part, không cần đụng tới code.
- Đề vừa tạo lưu vào Supabase với trạng thái `draft`, hiện ngay trong trang Quản trị đề thi và mở được bằng nút xem trước.
- Không có đề nào bị ghi dở (thiếu part hoặc thiếu câu) khi lưu lỗi giữa chừng.

## User stories

1. Là admin, tôi muốn điền câu hỏi theo đúng khung 5 Part của ETS để không phải tự nhớ số câu và thứ tự.
2. Là admin, tôi muốn nhập thông tin chung của đề (mã, tiêu đề, chủ đề, level mục tiêu, tag) để lọc và tìm đề sau này.
3. Là admin, tôi muốn biết ngay câu nào còn thiếu hoặc sai trước khi lưu, để không bị lỗi lúc lưu.
4. Là admin, tôi muốn lưu đề ở trạng thái nháp rồi xem trước phòng thi, để kiểm tra trước khi phát hành.

## Trong phạm vi / Ngoài phạm vi

**Trong phạm vi (MVP)**

- Chỉ làm kỹ năng Speaking, nhập bằng form theo từng Part.
- Chỉ tạo mới và lưu ở trạng thái `draft`.
- Media nhập dưới dạng text: Part 2 điền thẳng key hoặc URL ảnh vào `image_path` cùng `image_alt` (tả chi tiết bằng tiếng Anh, tối đa 1.000 ký tự: vừa là alt cho trình đọc màn hình, vừa là đầu vào duy nhất về ảnh khi AI chấm Part 2).
- Trang Quản trị đề thi đọc đề từ Supabase.

**Ngoài phạm vi**

- Tạo đề Writing.
- Import file JSON.
- Upload ảnh/audio lên Cloudflare.
- Sửa hoặc nhân bản đề.
- Luồng thẩm định `review` → `published`.
- Lưu nháp tự động (autosave).
- Xóa đề thật trong DB: hiện chỉ xóa phía client.

## Thiết kế kỹ thuật

- **Route**: `app/setting/exam-management/new/page.tsx`. Thêm nút "Tạo đề" (`Button` variant `primary`) vào `ExamManagementHeader` để vào trang này.
- **Quyền truy cập**: chỉ `profiles.role = admin` vào được. Hiện trang quản trị chưa chặn quyền, nên phải làm bước này trước. Lớp bảo vệ thật là RLS: chỉ admin được ghi bảng nội dung (đã có trong `docs/erd.md`).
- **Form**: shadcn `Form` + react-hook-form + zod. Nếu thiếu thì thêm bằng `npx shadcn@latest add form input textarea select`.
    - **Thông tin chung**: `code`, `title`, `topic` (shadcn `Select`), `target_level`, `description`, `tags`, `edition`.
    - **5 Part**: số Part và số câu lấy từ `PART_TEMPLATES` (`lib/domain/parts.ts`), không cho thêm hay bớt câu.
        - Part 1: đoạn văn cần đọc (`prompt`) và `hint`.
        - Part 2: `image_path`, `image_alt`, `sample_answer`.
        - Part 3: tình huống chung (`exam_parts.context`) và 3 câu hỏi.
        - Part 4: thông tin chung (`context`) và 3 câu hỏi.
        - Part 5: câu hỏi nêu quan điểm.
    - Có thể dùng chung `keywords`, `sample_answer`, `hint` (không bắt buộc).
- **Xem trước**: tái dùng phòng thi hiện có qua `buildTestHref(skill, id)` sau khi lưu.
- **Lưu**: gọi một Postgres function (RPC) `create_exam`, nhận toàn bộ payload và insert `exams` → `exam_parts` → `questions` trong một transaction. Insert ba bảng tuần tự từ client sẽ để lại đề ghi dở nếu lỗi giữa chừng.
    - Payload: `status = draft`, `source = internal`, `created_by` là user hiện tại.
- **Đọc dữ liệu**: thay ruột `listExams`, `getExam`, `listExamParts`, `listQuestions` trong `lib/data/content.ts` bằng query Supabase, giữ nguyên signature như comment trong file đã định sẵn.

## Trạng thái UI

- **Loading**: nút Lưu bị disable và hiện spinner. Trang quản trị dùng skeleton khi tải danh sách đề.
- **Empty**: kho đề trống thì hiện lời nhắc "Chưa có đề nào" kèm nút "Tạo đề".
- **Error**:
    - Lỗi validate hiển thị ngay dưới từng field. Mỗi Part có một badge đếm số lỗi.
    - Lỗi khi lưu hiện thông báo phía trên form và giữ nguyên dữ liệu đã nhập.
    - Trùng `code` thì báo riêng "Mã đề đã tồn tại".
    - Người không phải admin thấy trang 403.

## Kiểm thử

- Zod schema: đề thiếu câu hoặc sai số câu của một Part phải bị chặn.
- `create_exam`: nếu insert `questions` lỗi thì không còn bản ghi `exams` hay `exam_parts` nào sót lại.
- Phân quyền: student không gọi được `create_exam` (RLS) và không vào được route.

## Các bước thực hiện

1. Chặn quyền admin cho `/setting/exam-management` và các route con.
2. Chuyển `lib/data/content.ts` sang đọc từ Supabase. Seed các đề mock vào DB để trang không bị trống.
3. Viết zod schema cho đề Speaking dựa trên `PART_TEMPLATES`, kèm test.
4. Backend: migration cho RPC `create_exam` và RLS cho admin.
5. Làm UI form tạo đề (thông tin chung và 5 Part) cùng nút "Tạo đề" trên header.
6. Nối form với `create_exam`, xử lý lỗi, sau khi lưu thì chuyển về kho đề kèm link xem trước.

## Giả định & câu hỏi mở

- **Giả định**: chỉ admin dùng tính năng này. Ảnh Part 2 đã có sẵn trên Cloudflare và admin dán key/URL vào.
- **Ghi chú khi triển khai**: sau khi lưu, form quay về kho đề kèm thông báo; dòng đề nháp có nút xem trước. Từ E5-10, phòng thi đọc đề bằng phiên của người dùng phía server nên RLS cho admin xem đề `draft`/`review`, người khác nhận 404.
- **Câu hỏi mở**:
    - RPC `create_exam` và RLS do ai viết: repo backend hay trực tiếp trên Supabase?
    - Các đề mock hiện có (`sp-01`...) sẽ seed vào DB, hay giữ mock song song với đề từ DB một thời gian?
    - `code` có cần tự sinh (ví dụ `SP-xx` tiếp theo) hay để admin tự nhập?
