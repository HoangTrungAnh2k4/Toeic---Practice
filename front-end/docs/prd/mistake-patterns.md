# PRD — Sổ lỗi từ annotations thật (E7-3)

> Trạng thái: **Đã triển khai** · duyệt 2026-10-20 · Nối tiếp [`writing-scoring.md`](writing-scoring.md).

## Vấn đề

Chấm Writing đã sinh `annotations` (câu sai, bản sửa, giải thích), nhưng `mistake_pattern_id` luôn trống. Sổ lỗi, "Trọng tâm" ở Overview và Lộ trình chỉ đọc lỗi đã gắn mẫu, nên đang trống với mọi người dùng. Danh mục mẫu lỗi lại hard-code trong `lib/data/mistake-patterns.ts` với id dạng chữ, trong khi cột trên DB là uuid FK tới bảng `mistake_patterns` (đang rỗng).

## Mục tiêu & chỉ số thành công

- Sau khi chấm một Part Writing có lỗi, Sổ lỗi hiện ít nhất một mẫu lỗi có bằng chứng (câu trích) trỏ về đúng bài.
- ≥ 60% annotation Writing mới được gắn mẫu (đo trên DB sau 1 tuần dùng thật); phần còn lại để trống, không gắn sai cho đủ số.
- Không tăng số lượt gọi LLM (gắn mẫu ngay trong lượt chấm).

## User stories

1. Là người học, tôi muốn lỗi lặp lại qua nhiều bài được gom thành một mẫu lỗi, để biết mình hay sai gì nhất.
2. Là người học, tôi muốn mỗi mẫu lỗi có "Vì sao" và "Cách khắc phục" cụ thể, để sửa được ngay.
3. Là người học, tôi muốn trạng thái lỗi (đang mắc → đang cải thiện → đã khắc phục) đi theo các bài làm mới, để thấy mình tiến bộ.
4. Là admin, tôi muốn danh mục mẫu lỗi nằm trên DB, để sau này sửa nội dung mà không cần deploy.

## Trong phạm vi

- Seed danh mục vào bảng `mistake_patterns` bằng migration, uuid cố định: 6 mẫu đang có (4 Speaking giữ lại cho sau) + khoảng 8 mẫu Writing mới, phủ đủ Q1–5 (thiếu/sai dạng từ khoá, câu không khớp tranh, câu cụt), Q6–7 (thiếu nhiệm vụ, sai giọng văn), Q8 (không nêu rõ quan điểm, thiếu ví dụ, liên kết ý kém) và lỗi chung (mạo từ, hoà hợp chủ–vị, thì động từ).
- `listMistakePatterns` đọc từ DB, bỏ mảng hard-code.
- Khi chấm Writing, LLM chọn mẫu lỗi cho từng annotation từ danh sách mẫu của đúng Part + mẫu dùng chung của Writing; không khớp thì để trống. Ghi vào `annotations.mistake_pattern_id` (đăng nhập) hoặc localStorage (khách).
- Chỉ Writing, chỉ bài chấm mới hoặc bấm "Chấm lại" (câu chưa có điểm).

## Ngoài phạm vi

Gắn mẫu cho annotation đã có; annotations và mẫu lỗi cho Speaking; trang admin sửa danh mục; tự sinh mẫu lỗi mới từ annotations không khớp; gom nhóm theo tiêu chí cho lỗi không khớp mẫu.

## Thiết kế kỹ thuật

- **DB**: migration seed `mistake_patterns` (uuid cố định, `remedy` jsonb giữ cấu trúc hiện có). Không đổi schema.
- **Danh mục**: `listMistakePatterns` trong `lib/data/mistake-patterns.ts`, đọc DB với `'use cache'` (dự án bật Cache Components; `content.ts` còn được client import nên không đặt ở đó). Các trang đang nhận `patterns` từ server giữ nguyên luồng.
- **Prompt chấm** (`lib/scoring/writing.ts`): thêm danh sách mẫu đánh số `1..N` (tiêu đề + tiêu chí) và trường `pattern` (số hoặc `null`) cho mỗi annotation. Server đổi số sang uuid; số ngoài danh sách thì coi là `null`, không bỏ annotation. Dùng số thay uuid để tiết kiệm token và tránh model chép sai id.
- **Route** `POST /api/writing/score`: nạp mẫu lỗi Writing một lần cho mỗi request, truyền vào chấm từng câu, ghi `mistake_pattern_id` khi insert annotations. Khách nhận kèm trong `outcomes`.
- **Sổ lỗi** (`app/mistakes/_lib/data.ts`): giữ logic hiện tại (cửa sổ 5 bài, chuỗi sạch, độ ưu tiên), vì logic này đã đọc `mistake_pattern_id`.
- **shadcn**: không thêm component.

## Trạng thái UI

- **Loading/Error**: giữ như hiện tại (skeleton, `LoadError`) của Sổ lỗi; nếu đọc danh mục lỗi thì trang báo lỗi tải.
- **Empty**: chưa có lỗi nào được gắn mẫu thì Sổ lỗi hiện trạng thái trống sẵn có. Annotation không khớp mẫu vẫn hiện trên trang xem bài, chỉ không vào Sổ lỗi.

## Kiểm thử

- Parse `pattern`: số hợp lệ → uuid; `null`, số ngoài danh sách, sai kiểu → `null`, annotation vẫn được giữ.
- Danh sách mẫu trong prompt chỉ gồm mẫu Writing của đúng Part + mẫu dùng chung.
- pgTAP: anon đọc được `mistake_patterns`, seed có đủ số mẫu.

## Các bước thực hiện

1. Migration seed danh mục (mẫu cũ + mẫu Writing mới), `listMistakePatterns` đọc DB, bỏ mảng hard-code.
2. Prompt + schema chấm Writing có `pattern`, đổi số → uuid, kèm test.
3. Route ghi `mistake_pattern_id`; khách lưu kèm vào localStorage.
4. Thử: chấm một Part có lỗi → Sổ lỗi hiện mẫu, trạng thái và bằng chứng đúng. Cập nhật backlog.

## Giả định & câu hỏi mở

- Đã chốt (2026-10-19): LLM chọn từ danh mục; danh mục trên DB; chỉ Writing, không gắn lại bài cũ.
- Giả định: nội dung ~8 mẫu Writing mới do mình soạn theo rubric ETS, bạn duyệt khi review migration.
- Rủi ro: lỗi kiểu "thiếu nhiệm vụ" không có câu để trích, nên `locateAnnotations` có thể bỏ annotation đó. Khi đo thấy mẫu này không bao giờ có bằng chứng thì cho phép trích câu gần nhất.
- Rủi ro: thêm danh sách mẫu vào prompt tốn khoảng 200–300 token mỗi câu.
