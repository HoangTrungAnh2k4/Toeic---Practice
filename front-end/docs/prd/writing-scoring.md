# PRD — Chấm điểm Writing (E4-3 Writing + E4-4)

> Trạng thái: **Đã duyệt, đã triển khai** · 2026-10-19 · Nối tiếp [`scoring.md`](scoring.md) (Speaking), dùng lại hạ tầng LLM trên Groq, hạn mức chấm và service_role.

## Vấn đề

Bài Writing nộp xong không có điểm, nhận xét hay lỗi cụ thể, nên Sổ lỗi và Lộ trình không có dữ liệu thật của kỹ năng này. Mỗi Part là một attempt riêng (từ E3-2), nên cần chấm theo từng Part.

## Mục tiêu & chỉ số thành công

- 100% attempt Writing đã nộp có `score` hoặc `scoring_error`; không attempt nào kẹt ở `scoring` quá 2 phút mà không có cách chấm lại.
- Chấm một Part xong ≤ 30s sau khi nộp (p95), không chặn việc chuyển sang Part tiếp theo.
- Mỗi câu có điểm theo thang ETS, nhận xét tiếng Việt và ít nhất các lỗi chính dưới dạng `annotations` (vị trí đúng trong bài).
- Chi phí $0 (Groq free, chung ngân sách với Speaking).

## User stories

1. Là người học, tôi muốn mỗi câu Writing có điểm theo thang ETS (Q1–5: 0–3, Q6–7: 0–4, Q8: 0–5) kèm nhận xét, để biết mình mất điểm ở đâu.
2. Là người học, tôi muốn thấy đúng đoạn viết sai cùng bản sửa và giải thích, để không lặp lại lỗi.
3. Là người học, tôi muốn có điểm ước lượng 0–200 cho từng Part và tổng cả bài khi đã làm đủ 3 Part, để theo dõi tiến bộ.
4. Là người học, tôi muốn bấm "Chấm lại" khi chấm lỗi, để không phải viết lại bài.

## Trong phạm vi

- Chấm theo **rubric ETS TOEIC Writing** bằng LLM trên Groq (xoay vòng model như Speaking).
  - Q1–5: đúng ngữ pháp, dùng đủ 2 từ khoá, liên quan tới tranh.
  - Q6–7: đáp ứng đủ các yêu cầu của email, tổ chức, câu và từ vựng đa dạng.
  - Q8: lập luận, ví dụ/giải thích, tổ chức, ngôn ngữ, độ dài.
- Kiểm tra cứng phía server làm đầu vào cho LLM: từ khoá đã dùng, số câu (Q1–5), số từ (Q8).
- `annotations` cho mọi câu Writing: câu trích, bản sửa, giải thích tiếng Việt, `criterion`, `severity`. Server tự tính vị trí đoạn trong bài, `mistake_pattern_id` để trống (E7-3 gắn sau).
- Điểm theo Part: `attempts.score` là điểm ước lượng 0–200 của Part. Tổng 0–200 cả bài tính từ lần nộp gần nhất đã chấm của cả 3 Part.
- Chấm đồng bộ ngay khi nộp, có trạng thái và nút chấm lại (phạm vi rút gọn của E4-4).

## Ngoài phạm vi

Hàng đợi nền/worker, tự động retry; trang kết quả chi tiết và hiển thị tổng cả bài (E4-5); gắn `annotations` vào mẫu lỗi (E7-3); gửi ảnh cho LLM; chấm lại bài đã chấm thành công; `annotations` cho Speaking; nhóm 3 attempt thành một lượt thi.

## Thiết kế kỹ thuật

- **Luồng**: nộp Part (`submitted`) → phòng thi gọi `POST /api/writing/score` chạy nền rồi chuyển Part ngay. Fetch vẫn chạy khi điều hướng phía client. Route đổi `submitted → scoring` (điều kiện trên status, chống chấm trùng), chấm song song các câu, ghi kết quả → `scored`. Lỗi thì quay về `submitted` và ghi `scoring_error`.
- **Route Handler** (Node runtime, `maxDuration` 60s): lấy câu hỏi, Part, từ khoá, `image_alt`, email/đề từ DB, không tin text đề do client gửi; đề phải `published` (admin xem trước được).
  - **Người đăng nhập**: chỉ nhận `attemptId`; bài viết đọc từ `responses`. Attempt phải là của mình và đang `submitted`, hoặc `scoring` quá 2 phút. Ghi `responses.score/max_score/feedback/metrics/scoring_model`, xoá rồi ghi lại `annotations`, ghi `attempts.score/feedback_summary/scored_at/scoring_error` bằng service_role.
  - **Khách**: gửi kèm bài viết từng câu (giới hạn độ dài, câu phải thuộc đúng Part của đề). Route chỉ trả kết quả, client lưu `responses`, `annotations`, attempt vào localStorage như Speaking.
- **LLM**: mỗi câu một lượt gọi để lỗi/retry gói trong từng câu. Prompt gồm rubric của Part, đề (Q1–5 kèm `image_alt` và từ khoá; Q6–7 kèm email và yêu cầu; Q8 kèm đề), bài viết, kết quả kiểm tra cứng. Yêu cầu JSON `{ score, feedback, annotations[] }`, validate bằng zod (score trong thang của câu, `criterion` thuộc enum). Dùng lại `MODELS`, cooldown 429 và timeout trong `lib/scoring/grade.ts`.
- **Vị trí annotation**: tìm `quote` trong bài (khớp chính xác, lần xuất hiện đầu tiên chưa dùng); không tìm thấy thì bỏ annotation đó, không bỏ cả câu.
- **Thang điểm**: điểm thô Part (Part 1 tối đa 15, Part 2 tối đa 8, Part 3 tối đa 5) quy tuyến tính về 0–200, làm tròn bội số 10. Tổng cả bài = tổng thô 3 Part (tối đa 28) quy tuyến tính về 0–200. Level theo `lib/domain/score-levels.ts`.
- **Câu bỏ trống**: 0 điểm, không gọi LLM, nhận xét "Chưa có câu trả lời".
- **Hạn mức**: dùng chung bộ đếm lượt chấm theo ngày với Speaking (`lib/scoring/quota.ts`), mỗi câu Writing không bỏ trống tính 1 lượt; chấm lỗi thì hoàn lượt.
- **Chấm lại**: chỉ chấm các câu chưa có điểm, câu đã chấm giữ nguyên (không trừ thêm lượt).
- **Chấm lại**: trang xem bài (`/setting/history/[id]`) hiện nút "Chấm lại" khi attempt có `scoring_error` hoặc `scoring` quá 2 phút; gọi cùng route.
- **DB**: thêm cột `attempts.scoring_started_at` (migration `20261019140000`, client không có quyền ghi). Lý do: lượt `scoring` bị hỏng giữa chừng chỉ được chiếm lại khi đã quá 2 phút tính từ lúc bắt đầu chấm. Nếu tính từ `submitted_at` thì bài nộp đã lâu sẽ bị chấm trùng khi bấm chấm lại hai lần. Các cột còn lại (`scoring`, `responses.feedback/scoring_model`, `annotations`, enum `criterion`) đã có sẵn.
- **shadcn**: không thêm component.

## Trạng thái UI

- **Loading**: lịch sử và trang xem bài hiện "Đang chấm" (nhóm `pending` có sẵn, `ReviewScoringState`); phòng thi không chờ.
- **Empty**: câu bỏ trống thì 0 điểm kèm nhận xét "Chưa có câu trả lời"; câu không có lỗi thì không có `annotations`.
- **Error**: chấm lỗi hoặc hết lượt thì attempt `submitted` + `scoring_error`, trang xem bài báo lỗi và hiện nút "Chấm lại". Khách đóng tab trước khi chấm xong thì cũng chấm lại được, vì bài viết vẫn còn trong localStorage.

## Kiểm thử

- Parse JSON của LLM: sai schema, điểm ngoài thang, `criterion` lạ → lỗi, không ghi điểm.
- Tính vị trí annotation: không khớp, trùng câu trích, ký tự đặc biệt.
- Quy đổi: thô Part → 0–200, tổng 3 Part → 0–200, câu bỏ trống.
- Route: attempt người khác hoặc sai trạng thái → 404/409, chấm trùng song song chỉ một lượt chạy, đề chưa `published` → 404, bài quá dài → 400, vượt hạn mức → 429.

## Các bước thực hiện

1. `lib/scoring/writing.ts`: prompt theo Part, schema, parse + tính vị trí annotation, kèm test.
2. Quy đổi điểm Part và tổng cả bài trong `lib/scoring/scale.ts`, kèm test.
3. `POST /api/writing/score`: đăng nhập và khách, chuyển trạng thái, hạn mức, ghi `responses`/`annotations`/`attempts`.
4. Phòng thi gọi chấm sau khi nộp mỗi Part (chạy nền); khách lưu kết quả vào localStorage (`user-data`).
5. Nút "Chấm lại" + trạng thái lỗi trên trang xem bài.
6. Cập nhật backlog (E4-3 phần Writing, E4-4 thu gọn) và PRD nếu thực tế khác.

## Giả định & câu hỏi mở

- Đã chốt (2026-10-19): rubric ETS; điểm theo Part, tổng cả bài khi đủ 3 Part; có `annotations` cho Writing; chấm đồng bộ + chấm lại, không hàng đợi.
- Giả định: LLM nhận `image_alt` thay cho ảnh (như Speaking Part 2), nên form tạo đề Writing (E5-7) phải bắt buộc mô tả ảnh chi tiết.
- Giả định: quy đổi tuyến tính (ETS không công bố bảng quy đổi), hiệu chỉnh khi có dữ liệu thật.
- Rủi ro: chung ngân sách token với Speaking. Một bài Writing đủ 3 Part ước ~7.500 token, tức khoảng 25 bài/model/ngày khi không có Speaking. Cần đo thật sau bước 3.
- Rủi ro: LLM trích sai câu trong bài → annotation bị bỏ; nếu tỉ lệ bỏ cao thì đổi sang trả vị trí theo từ.
- Đã chốt (2026-10-19): dùng chung bộ đếm lượt chấm với Speaking.
- Đo thật (2026-10-19, `gpt-oss-120b`): mỗi câu chấm xong ~1,5s; annotations trích đúng câu và đúng vị trí trên 2 bài thử.
