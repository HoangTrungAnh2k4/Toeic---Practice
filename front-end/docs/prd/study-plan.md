# PRD — Sinh lộ trình học (E6-2)

> Trạng thái: **Đã làm** · duyệt 2026-10-20 · Sprint 6.

## Vấn đề

Trang `/schedule` đã đọc được `study_plans`/`study_plan_weeks`/`plan_tasks`, nhưng chưa có gì ghi dữ liệu vào ba bảng này. Vì vậy mọi người dùng đều thấy "Bạn chưa có lộ trình học", và nút "Tối ưu lộ trình (AI)" bấm không có tác dụng. Ngoài ra hiện chưa có chỗ nào để người dùng nhập mục tiêu điểm và ngày thi (`profiles.target_*`, `exam_date` chỉ đọc).

## Mục tiêu & chỉ số thành công

- Người dùng đã đăng nhập lưu mục tiêu + ngày thi lần đầu thì có lộ trình ngay (< 2 giây, không gọi AI).
- 100% lộ trình sinh ra đáp ứng: mỗi ngày học có ít nhất 1 task, tổng thời lượng mỗi ngày không vượt `minutes_per_day` (trừ ngày thi thử: tính theo thời lượng thật của đề), không có task nào sau ngày thi.
- Kết quả xác định: cùng đầu vào thì ra cùng lộ trình (để test được).

## User stories

1. Là người học, tôi muốn nhập điểm mục tiêu Speaking/Writing và ngày thi, để được xếp lịch học theo đó.
2. Là người học, tôi muốn lộ trình ưu tiên kỹ năng và Part còn xa mục tiêu, để học đúng chỗ yếu.
3. Là người học, tôi muốn lộ trình có buổi ôn các mẫu lỗi trong Sổ lỗi, để sửa lỗi lặp lại.
4. Là người học, tôi muốn bấm "Tạo lại lộ trình" khi đổi mục tiêu hoặc bị lỡ nhịp, để có lịch mới.
5. Là người học, tôi muốn task tự đánh dấu xong khi tôi nộp bài tương ứng, để thấy được tiến độ.

## Trong phạm vi

- **Form "Mục tiêu & Lịch thi"**: điểm mục tiêu Speaking và Writing (0–200, bước 10), ngày thi (phải sau hôm nay), số ngày học/tuần (3–7, mặc định 5), thời lượng/buổi (30/45/60, mặc định 45). Mở từ nút ở header `/schedule` và từ thẻ mục tiêu ở Profile.
- **Sinh tự động** khi lưu form mà chưa có lộ trình `active`.
- **Nút "Tạo lại lộ trình"** (thay nút "Tối ưu lộ trình (AI)"): có hộp thoại xác nhận. Lộ trình cũ chuyển `archived`, task đã làm vẫn nằm trong lịch sử.
- **Luật sinh lộ trình (rule-based)**:
  - Lộ trình kéo dài từ hôm nay đến hết ngày trước ngày thi, tối đa 12 tuần. Ngày thi xa hơn thì chỉ xếp 12 tuần đầu, khi hết hạn người dùng bấm "Tạo lại".
  - Ngày học trải đều trong tuần theo `days_per_week`.
  - Chia ngày học giữa hai kỹ năng theo khoảng cách còn thiếu tới mục tiêu (mục tiêu − điểm gần nhất), mỗi kỹ năng có mục tiêu được ít nhất 1 ngày/tuần. Kỹ năng không đặt mục tiêu thì không xếp.
  - Tuần 1 có 1 bài thi thử (`mock`) cho mỗi kỹ năng chưa có điểm cả đề, để có điểm làm mốc.
  - Các tuần giữa có task luyện Part (`speaking`/`writing` + `part_template_id`). Part có điểm trung bình thấp nhất được xếp nhiều hơn; chưa có điểm thì xoay vòng đủ các Part.
  - Mỗi tuần có ít nhất 1 buổi `review` cho mẫu lỗi đang mắc nặng nhất của kỹ năng ưu tiên (đọc từ Sổ lỗi). Sổ lỗi trống thì bỏ buổi này.
  - Ngày học cuối mỗi tuần có `summary`. Tuần cuối trước ngày thi gồm thi thử cả đề + `review`, không xếp Part mới.
  - Chọn đề cho task: đề `published` của đúng kỹ năng mà người dùng chưa làm, nếu đã làm hết thì lấy đề làm lâu nhất. Không còn đề phù hợp thì để trống (UI hiện "Chọn đề").
  - Mỗi tuần có `theme` (vd. "Chẩn đoán", "Củng cố Part yếu", "Nước rút"). `ai_rationale` là 1–2 câu sinh theo mẫu (vd. "Ưu tiên Writing vì còn thiếu 40 điểm…").
- **Tự đánh dấu xong**: nộp một lượt làm thì gắn `attempt_id` vào task chưa xong sớm nhất (từ hôm nay trở về trước) có cùng đề, hoặc cùng kỹ năng + Part nếu task không gắn đề. Task `review`/`summary` có nút "Đánh dấu xong" (`completed_at`).
- Chỉ người đã đăng nhập. Khách giữ thẻ "Đăng ký để nhận lộ trình học riêng" như hiện tại.

## Ngoài phạm vi

- Gọi AI/LLM, tự sinh lại sau mỗi lượt chấm, nhắc lịch/thông báo, kéo thả đổi ngày, lộ trình cho khách.
- `getLatestInsight`/`ai_insights` (E6-4).

## Thiết kế kỹ thuật

- **Luật sinh**: một hàm thuần, đặt cạnh `lib/data/study-plan.ts`. Đầu vào là mục tiêu, ngày thi, cấu hình buổi học, ngày hiện tại, điểm theo kỹ năng/Part (`useUserStats`), mẫu lỗi đang mắc (`useMistakeBook`) và danh sách đề (`getExamSummaries`). Đầu ra là plan + weeks + tasks. Hàm chạy phía client vì thống kê và Sổ lỗi vốn đã được tính ở client.
- **Ghi DB**: RPC mới `create_study_plan(payload)` (migration ở `back-end/supabase/migrations`). Trong một transaction: lưu mục tiêu vào `profiles`, archive lộ trình `active` cũ, insert plan/weeks/tasks. Gom vào một transaction để không bao giờ còn lại lộ trình ghi dở. `security invoker`, quyền dựa vào RLS hiện có.
- **Gắn task khi nộp bài**: `linkPlanTask` (`lib/data/user-data.ts`) gọi sau khi nộp xong ở cả hai phòng thi: ưu tiên task thi thử cùng đề, rồi task luyện cùng Part. *Đổi so với bản duyệt:* không cần RPC vì RLS `plan_tasks` đã cho cập nhật task của chính mình và chặn gắn attempt của người khác; ghi có điều kiện `attempt_id is null`.
- **Mẫu lỗi**: `plan_tasks.mistake_pattern_id` là uuid FK, trong khi danh mục hiện hard-code id dạng chữ (E7-3 chưa seed DB). Trước khi có E7-3: task `review` để `mistake_pattern_id` trống, tên mẫu lỗi đưa vào `title`, link dẫn tới `/mistakes`. Sau E7-3 thì điền id thật.
- **UI**: thêm shadcn `dialog` cho form (`npx shadcn@latest add dialog`). Tái dùng `Form` + zod, `Select` (ngày/tuần, thời lượng), `Input`, `AlertDialog` (xác nhận tạo lại), `SessionDurationSwitch`. Sau khi lưu hoặc tạo lại thì gọi `retry` của `useAsync` để `ScheduleView` nạp lại.
- **Dữ liệu**: không thêm bảng hay cột. Thêm hàm ghi vào `lib/data/user-data.ts` (`savePlanGoals`/`createStudyPlan`, `completePlanTask`).

## Trạng thái UI

- **Loading**: nút lưu/tạo lại ở trạng thái disabled + "Đang tạo lộ trình…". Trang giữ Skeleton như hiện tại.
- **Empty**: chưa có mục tiêu → `NoPlanCard` có nút "Đặt mục tiêu" mở form. Không còn đề `published` → vẫn sinh lộ trình, task hiện "Chọn đề".
- **Error**: lỗi RPC → thông báo trong dialog, giữ nguyên dữ liệu đã nhập, lộ trình cũ không đổi. Lỗi gắn task khi nộp bài chỉ ghi console, không chặn việc nộp.

## Kiểm thử

- Vitest cho hàm sinh: không có task sau ngày thi, tổng phút mỗi ngày ≤ `minutes_per_day`, số ngày học/tuần đúng, kỹ năng thiếu nhiều điểm hơn có nhiều ngày hơn, tuần cuối chỉ có `mock`/`review`, chạy lại cho cùng kết quả, ngày thi < 7 ngày vẫn ra lộ trình hợp lệ.
- pgTAP `create_study_plan.test.sql`: lưu mục tiêu, archive đúng lộ trình cũ (giữ task), không đụng lộ trình người khác, task sai thì không ghi gì. Việc không gắn được attempt của người khác đã có RLS sẵn.

## Các bước thực hiện

1. Hàm sinh lộ trình + test Vitest.
2. Migration RPC `create_study_plan` + pgTAP, cập nhật `database.types.ts`.
3. Form "Mục tiêu & Lịch thi" (dialog) nối RPC, tự sinh lần đầu, mở từ `/schedule` và Profile.
4. Nút "Tạo lại lộ trình" + hộp thoại xác nhận.
5. `linkPlanTask` gọi khi nộp bài ở hai phòng thi, nút "Đánh dấu xong" cho `review`/`summary`.

## Giả định & câu hỏi mở

- Giả định: tối đa 12 tuần, mặc định 5 ngày/tuần và 45 phút/buổi, điểm mục tiêu cho phép để trống từng kỹ năng (khi đó chỉ luyện kỹ năng còn lại).
- *Đổi khi làm:* lưu form "Mục tiêu & Lịch thi" luôn sinh lại lộ trình (form có cảnh báo). Mục tiêu mới mà lịch cũ thì không khớp nhau. Nút "Tạo lại lộ trình" dùng mục tiêu hiện tại, cho trường hợp bị lỡ nhịp.
- Giới hạn: Writing lưu mỗi Part một lượt, nên task thi thử Writing được đánh dấu xong ngay khi nộp Part đầu của đề đó.
- Chốt: bước 5 làm luôn trong Sprint 6.
