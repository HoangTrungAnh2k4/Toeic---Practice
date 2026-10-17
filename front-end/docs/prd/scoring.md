# PRD — Chấm điểm Speaking (E4-1)

> Trạng thái: **Đã duyệt, đã triển khai** · 2026-10-17 · Thay hướng E2-2: **không lưu audio** (R2 chỉ giữ env và `lib/r2.ts` cho sau này)

## Vấn đề

Bài Speaking nộp xong không có điểm (`score`, `scoring_error` luôn `null`), người học không biết mình đang ở Level nào. Audio giọng nói là dữ liệu nhạy cảm, không muốn lưu trữ lâu dài.

## Mục tiêu & chỉ số thành công

- 100% câu Speaking được chấm có `responses.score` hoặc lý do lỗi (người đăng nhập: `attempts.scoring_error`; khách: lưu cùng attempt trong localStorage).
- Mỗi câu chấm xong ≤ 15s sau khi chốt câu (p95); sau khi bấm Kết thúc, chờ ≤ 20s là có tổng điểm.
- Không có file audio nào được ghi ra storage, DB hay log của hệ thống.
- Chi phí $0: free tier (Azure F0 + tín dụng Azure for Students, Groq, Gemini API).

## User stories

1. Là người học, tôi muốn biết điểm phát âm Part 1 (đọc to) theo thang ETS, để biết cần luyện phát âm/ngữ điệu ở đâu.
2. Là người học, tôi muốn Part 2–5 được chấm theo Fluency, Vocabulary, Grammar, Task Response kèm nhận xét tiếng Việt, để biết câu trả lời thiếu gì.
3. Là người học, tôi muốn có tổng điểm 0–200 và Level ngay sau khi nộp, để theo dõi tiến bộ.
4. Là người học, tôi muốn biết giọng nói của mình được gửi đi đâu, để tự quyết có làm bài hay không.

## Trong phạm vi

- Part 1 (câu 1–2): **Azure AI Speech – Pronunciation Assessment**, reference text là nội dung câu hỏi lấy từ DB.
- Part 2–5 (câu 3–11): audio → **Groq Whisper** (`whisper-large-v3-turbo`) lấy transcript + timestamp → **Gemma** (`gemma-4-31b-it` qua Gemini API) chấm câu hỏi + transcript theo rubric IELTS, trả JSON điểm + nhận xét ngắn tiếng Việt.
- Audio chỉ nằm trên RAM: trình duyệt → Route Handler → Azure/Groq, rồi bỏ. Gemma chỉ nhận transcript (và ảnh đề Part 2).
- Lưu điểm từng câu, transcript, điểm thành phần, nhận xét; tổng điểm attempt và Level.

## Ngoài phạm vi

Writing; trang kết quả chi tiết (E4-5); `annotations` lỗi theo đoạn và Sổ lỗi (E7-3); chấm phát âm/ngữ điệu Part 2–5; hàng đợi chấm lại sau khi đã rời phòng (E4-4, không còn audio để chấm lại); nghe lại bài nói; gói trả phí; lưu audio lên R2.

## Thiết kế kỹ thuật

- **Luồng**: chốt câu → phòng thi gửi audio của câu đó lên `POST /api/speaking/score` ngay (chạy nền). Bấm Kết thúc → chờ các câu đang chấm, thử lại câu lỗi, đặt attempt `submitted`, gọi `POST /api/speaking/finalize` → `scored`.
- **Route Handler** (Node runtime) trong front-end: lấy câu hỏi, Part từ DB theo `questionId` (không tin text client gửi; đề phải `published`).
  - Người đăng nhập: kiểm tra attempt là của mình và đang làm, rồi ghi `responses.score/max_score/transcript/metrics/feedback/scoring_model`, `attempts.score/feedback_summary/scored_at/scoring_error` bằng **service_role** (client không có grant các cột này).
  - Khách: không có attempt trên DB → route chỉ trả kết quả, client lưu vào localStorage như dữ liệu khách hiện tại; finalize tính tổng phía client bằng cùng hàm quy đổi.
- **Part 1 – Azure**: chỉ nhận WAV PCM 16 kHz mono hoặc OGG/Opus, Chrome ghi ra WebM → trình duyệt chuyển bản ghi Part 1 sang WAV 16 kHz (~1,4 MB cho 45s). REST short audio chỉ chấm phát âm tối đa 30s, Part 1 cho nói 45s → dùng **Speech SDK** (`microsoft-cognitiveservices-speech-sdk`, recognition liên tục, đã duyệt dependency). Điểm Azure (0–100: accuracy, fluency, completeness, prosody) quy về 0–3.
- **Part 2–5 – Groq Whisper**: gửi thẳng WebM, `response_format=verbose_json` để có timestamp từng đoạn. Từ timestamp tính số đo Fluency: tốc độ nói (từ/phút), số quãng nghỉ > 2s, tỉ lệ im lặng — gửi kèm transcript cho Gemma. Gọi bằng `fetch`, không thêm SDK.
- **Part 2–5 – Gemma**: prompt gồm đề (text câu hỏi; Part 2 gửi kèm ảnh đề — Gemma 4 nhận ảnh; Part 4 kèm thông tin `context`), transcript, số đo Fluency; yêu cầu JSON `{ fluency, vocabulary, grammar, task_response: band 0–9, feedback: string tiếng Việt }`. Validate bằng zod. Gọi Gemini API bằng `fetch`: Gemma một lần (timeout 20s); lỗi mạng/5xx/429/timeout/sai schema → chấm bằng `gemini-3.5-flash` (tối đa 2 lần), `scoring_model` ghi model đã chấm. Lý do (đo 2026-10-17): Gemma trả 500 khoảng 40–60% lượt và có lúc mất ~40s.
- **Thang điểm**: band trung bình 4 tiêu chí (0–9) quy tuyến tính về thang câu: câu 3–10 thang 0–3, câu 11 thang 0–5; 4 band lưu trong `metrics`. Tổng thô (tối đa 35) quy về 0–200, làm tròn bội số 10; Level theo `lib/domain/score-levels.ts`.
- **Quota free tier** (theo project/tổ chức, cần xác nhận lại trên trang quản trị): Azure F0 5 giờ audio/tháng (Part 1 ≈ 1,5 phút/bài → ~200 bài/tháng), dư thì chuyển S0 trừ vào tín dụng $100; Groq Whisper ~20 RPM, 2.000 request và 28.800 giây audio/ngày; Gemma 4 31B ~1.500 request/ngày (nguồn không chính thức). Mỗi bài 9 request Groq + 9 request Gemma → Gemma là trần, ~166 bài/ngày. Hết quota (429) → báo "Hết lượt chấm miễn phí, thử lại sau", không tính là lỗi bài.
- **Quyền riêng tư**: phòng thi ghi rõ "Part 1 gửi Azure, Part 2–5 gửi Groq để chuyển thành chữ; hệ thống không lưu bản ghi". Gemini API Free Tier dùng nội dung để cải thiện sản phẩm Google, nhưng chỉ nhận transcript và ảnh đề, không nhận giọng nói.
- **Giới hạn lượt chấm**: đếm số câu đã chấm theo ngày (giờ VN) trên DB; khách đếm theo IP (lưu hash, không lưu IP thô), người đăng nhập theo `user_id`. Khách 33 câu (3 bài)/ngày, đăng nhập 55 câu (5 bài)/ngày. Vượt → 429 "Hết lượt chấm hôm nay". Tăng đếm bằng một Postgres function atomic, chỉ service_role gọi được; chấm/lưu lỗi thì hoàn lại lượt (`refund_scoring_quota`).
- **DB**: migration thêm `responses.feedback text`, `responses.scoring_model text` (dịch vụ/model đã chấm, để hiệu chỉnh sau); thêm `'fluency'`, `'task_response'` vào enum `criterion`; bảng đếm lượt chấm (RLS bật, không policy cho client); `attempts.status` dùng `scored` khi xong.
- **Env mới (server)**: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Chế độ**: chấm cả `cbt`, `timed`, `guided`.
- **shadcn**: không thêm component; phòng thi chỉ đổi trạng thái nút Kết thúc, dòng báo lỗi và dòng thông báo quyền riêng tư.

## Trạng thái UI

- **Loading**: chấm từng câu chạy nền, không chặn làm bài; sau khi bấm Kết thúc nút chuyển sang "Đang chấm bài…" và bị khoá.
- **Empty**: câu im lặng (Azure `InitialSilenceTimeout`, Whisper trả transcript rỗng) → 0 điểm, không gọi Gemma, nhận xét "Chưa ghi nhận câu trả lời".
- **Error**: câu chấm lỗi → thử lại khi nộp; vẫn lỗi thì báo lỗi + cho bấm lại (audio còn trên RAM). Rời phòng khi còn câu chưa chấm → attempt giữ `in_progress`, câu đó mất (xử lý gián đoạn ở E2-4). Hết lượt chấm giữa bài → vẫn nộp, câu chưa chấm tính 0 và ghi `scoring_error`.

## Kiểm thử

- Quy đổi: Azure 0–100 → 0–3; band IELTS → 0–3/0–5; tổng thô → 0–200.
- Số đo Fluency từ timestamp Whisper (tốc độ nói, quãng nghỉ).
- Parse JSON Gemma: sai schema, band ngoài 0–9 → lỗi, không ghi điểm.
- Chuyển WebM → WAV 16 kHz (header WAV, sample rate, mono).
- Route chấm: attempt người khác hoặc đã nộp → 404, câu thuộc đề chưa `published` → 404, audio quá lớn → 400, vượt giới hạn lượt chấm → 429.

## Các bước thực hiện

1. Gỡ upload R2: xoá `app/api/answer-audio`, `saveAnswerAudio`; giữ `lib/r2.ts` và env R2; sửa lại E2-2 và E2-3 trong backlog.
2. Migration (`responses.feedback`, `scoring_model`, enum `criterion`, bảng/function đếm lượt chấm + pgTAP), gen types; thêm env và client Supabase service_role chỉ dùng phía server.
3. Chuyển bản ghi Part 1 sang WAV 16 kHz trên trình duyệt + test.
4. Chấm Part 1 bằng Azure (Speech SDK) trong `/api/speaking/score` + test quy đổi.
5. Chấm Part 2–5: Groq Whisper → số đo Fluency → Gemma, trong cùng route + test số đo, parse, quy đổi.
6. Phòng thi gửi chấm khi chốt câu, thử lại khi nộp, trạng thái "Đang chấm bài…", thông báo quyền riêng tư; khách lưu kết quả vào localStorage.
7. `/api/speaking/finalize`: tổng điểm, `feedback_summary` (ghép nhận xét các câu), `scored` hoặc `scoring_error`.

## Giả định & câu hỏi mở

- Đã chốt: Azure Speech SDK cho Part 1; Groq Whisper + Gemma 4 31B cho Part 2–5 theo rubric IELTS, quy về thang TOEIC; số đo Fluency từ timestamp Whisper; thêm `fluency`, `task_response` vào `criterion`; chi phí $0; chấm cả `guided`; khách cũng được chấm; giới hạn 3 bài/ngày (khách), 5 bài/ngày (đăng nhập), đếm trên DB.
- Giả định: quy đổi band → thang câu và tổng → 0–200 là tuyến tính (ETS không công bố bảng quy đổi), hiệu chỉnh khi có dữ liệu thật.
- Rủi ro: rubric IELTS khác rubric TOEIC (TOEIC chấm theo yêu cầu từng Part, có phát âm/ngữ điệu) → điểm Part 2–5 chỉ là ước lượng.
- Rủi ro: chưa xác minh Gemma 4 trên Gemini API có hỗ trợ JSON schema/system instruction → dự phòng bằng prompt yêu cầu JSON + zod validate.
- Rủi ro: chưa xác minh Groq có lưu audio hay không, và Azure F0 có tính Pronunciation Assessment vào 5 giờ miễn phí không — kiểm tra điều khoản/Portal khi tạo key.
- Rủi ro: IP dùng chung (trường, quán cafe) làm khách chung một hạn mức; khách đổi IP để lách được — chấp nhận ở MVP.
