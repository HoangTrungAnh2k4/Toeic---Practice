# PRD — Chấm điểm Speaking (E4-1)

> Trạng thái: **Đã duyệt, đã triển khai** · 2026-10-17 · Thay hướng E2-2: **không lưu audio** (R2 chỉ giữ env và `lib/r2.ts` cho sau này)

## Vấn đề

Bài Speaking nộp xong không có điểm (`score`, `scoring_error` luôn `null`), người học không biết mình đang ở Level nào. Audio giọng nói là dữ liệu nhạy cảm, không muốn lưu trữ lâu dài.

## Mục tiêu & chỉ số thành công

- 100% câu Speaking được chấm có `responses.score` hoặc lý do lỗi (người đăng nhập: `attempts.scoring_error`; khách: lưu cùng attempt trong localStorage).
- Mỗi câu chấm xong ≤ 15s sau khi chốt câu (p95); sau khi bấm Kết thúc, chờ ≤ 20s là có tổng điểm.
- Không có file audio nào được ghi ra storage, DB hay log của hệ thống.
- Chi phí $0: free tier (Azure F0 + tín dụng Azure for Students, Groq).

## User stories

1. Là người học, tôi muốn biết điểm phát âm Part 1 (đọc to) theo thang ETS, để biết cần luyện phát âm/ngữ điệu ở đâu.
2. Là người học, tôi muốn Part 2–5 được chấm theo Fluency, Vocabulary, Grammar, Task Response kèm nhận xét tiếng Việt, để biết câu trả lời thiếu gì.
3. Là người học, tôi muốn có tổng điểm 0–200 và Level ngay sau khi nộp, để theo dõi tiến bộ.
4. Là người học, tôi muốn biết giọng nói của mình được gửi đi đâu, để tự quyết có làm bài hay không.

## Trong phạm vi

- Part 1 (câu 1–2): **Azure AI Speech – Pronunciation Assessment**, reference text là nội dung câu hỏi lấy từ DB.
- Part 2–5 (câu 3–11): audio → **Groq Whisper** (xoay vòng `whisper-large-v3` → `whisper-large-v3-turbo`) lấy transcript + timestamp → **LLM trên Groq** (xoay vòng `gpt-oss-120b` → `qwen3.8-27b` → `gpt-oss-20b`) chấm câu hỏi + transcript theo rubric IELTS, trả JSON điểm + nhận xét ngắn tiếng Việt.
- Audio chỉ nằm trên RAM: trình duyệt → Route Handler → Azure/Groq, rồi bỏ. LLM chấm chỉ nhận transcript và text đề (Part 2 là mô tả ảnh `image_alt`).
- Lưu điểm từng câu, transcript, điểm thành phần, nhận xét; tổng điểm attempt và Level.

## Ngoài phạm vi

Writing; trang kết quả chi tiết (E4-5); `annotations` lỗi theo đoạn và Sổ lỗi (E7-3); chấm phát âm/ngữ điệu Part 2–5; hàng đợi chấm lại sau khi đã rời phòng (E4-4, không còn audio để chấm lại); nghe lại bài nói; gói trả phí; lưu audio lên R2.

## Thiết kế kỹ thuật

- **Luồng**: chốt câu → phòng thi gửi audio của câu đó lên `POST /api/speaking/score` ngay (chạy nền). Bấm Kết thúc → chờ các câu đang chấm, thử lại câu lỗi, đặt attempt `submitted`, gọi `POST /api/speaking/finalize` → `scored`.
- **Route Handler** (Node runtime) trong front-end: lấy câu hỏi, Part từ DB theo `questionId` (không tin text client gửi; đề phải `published`).
  - Người đăng nhập: kiểm tra attempt là của mình và đang làm, rồi ghi `responses.score/max_score/transcript/metrics/feedback/scoring_model`, `attempts.score/feedback_summary/scored_at/scoring_error` bằng **service_role** (client không có grant các cột này).
  - Khách: không có attempt trên DB → route chỉ trả kết quả, client lưu vào localStorage như dữ liệu khách hiện tại; finalize tính tổng phía client bằng cùng hàm quy đổi.
- **Part 1 – Azure**: chỉ nhận WAV PCM 16 kHz mono hoặc OGG/Opus, Chrome ghi ra WebM → trình duyệt chuyển bản ghi Part 1 sang WAV 16 kHz (~1,4 MB cho 45s). REST short audio chỉ chấm phát âm tối đa 30s, Part 1 cho nói 45s → dùng **Speech SDK** (`microsoft-cognitiveservices-speech-sdk`, recognition liên tục, đã duyệt dependency). Điểm Azure (0–100: accuracy, fluency, completeness, prosody) quy về 0–3.
- **Part 2–5 – Groq Whisper**: gửi thẳng WebM, `response_format=verbose_json` để có timestamp từng đoạn. Từ timestamp tính số đo Fluency: tốc độ nói (từ/phút), số quãng nghỉ > 2s, tỉ lệ im lặng — gửi kèm transcript cho LLM chấm. Gọi bằng `fetch`, không thêm SDK. Xoay vòng `whisper-large-v3` (WER 10,3%) → `whisper-large-v3-turbo` (WER 12%) khi lỗi/429, dùng chung cơ chế cooldown với LLM chấm.
- **Part 2–5 – LLM trên Groq**: prompt gồm đề (text câu hỏi; Part 2 gửi mô tả ảnh `image_alt` thay cho ảnh, dặn model không trừ điểm chi tiết mô tả không nhắc tới, chỉ trừ chi tiết mâu thuẫn rõ; Part 4 kèm thông tin `context`), transcript, số đo Fluency; yêu cầu JSON `{ fluency, vocabulary, grammar, task_response: band 0–9, feedback: string tiếng Việt }` (`response_format: json_object`). Validate bằng zod. Gọi Groq chat completions bằng `fetch`, xoay vòng model mạnh trước: `openai/gpt-oss-120b` (reasoning low) → `qwen/qwen3.8-27b` (không reasoning) → `openai/gpt-oss-20b`. Không gửi ảnh vì trên Groq free chỉ Qwen nhận ảnh: mô tả chi tiết viết một lần lúc tạo đề (tối đa 1.000 ký tự) thì mọi model chấm cùng một đầu vào, mỗi lượt ~700 token. Lỗi mạng/5xx/429/timeout 20s/sai schema → model kế; model 429 bị bỏ qua tới hết `retry-after` (mặc định 60s, nhớ trong instance server). `scoring_model` ghi model đã chấm. Lý do (2026-10-18): bỏ Gemini, chỉ dùng tài khoản Groq free.
- **Thang điểm**: band trung bình 4 tiêu chí (0–9) quy tuyến tính về thang câu: câu 3–10 thang 0–3, câu 11 thang 0–5; 4 band lưu trong `metrics`. Tổng thô (tối đa 35) quy về 0–200, làm tròn bội số 10; Level theo `lib/domain/score-levels.ts`.
- **Quota free tier** (theo project/tổ chức, cần xác nhận lại trên trang quản trị): Azure F0 5 giờ audio/tháng (Part 1 ≈ 1,5 phút/bài → ~200 bài/tháng), dư thì chuyển S0 trừ vào tín dụng $100; Groq free (docs + header đo 2026-10-18, giới hạn riêng từng model): mỗi Whisper 20 RPM, 2.000 request/ngày, 7.200 giây audio/giờ, 28.800 giây/ngày (tính tối thiểu 10s/request); mỗi model chat 30 RPM, 1.000 request/ngày, 8.000 token/phút, **200.000 token/ngày**. Đo thật: một lượt chấm ~700 token (mô tả ảnh dài thêm ~200) → mỗi bài ~6.500 token → ~30 bài/model/ngày, 3 model ≈ **90 bài/ngày (trần thật)**. Whisper: mỗi bài ~240s audio → ~120 bài/model/ngày, 30 bài/model/giờ, 2 model gấp đôi. TPM 8K/model ≈ 11 lượt/phút/model → nhiều người nộp cùng lúc thì dồn sang model sau. Hết quota (429) → báo "Hết lượt chấm miễn phí, thử lại sau", không tính là lỗi bài.
- **Quyền riêng tư**: phòng thi ghi rõ "Part 1 gửi Azure, Part 2–5 gửi Groq để chuyển thành chữ; hệ thống không lưu bản ghi". LLM chấm chỉ nhận transcript và text đề, không nhận giọng nói. Nên bật Zero Data Retention trong Data Controls của Groq để khớp câu "không lưu bản ghi".
- **Giới hạn lượt chấm**: đếm số câu đã chấm theo ngày (giờ VN) trên DB; khách đếm theo IP (lưu hash, không lưu IP thô), người đăng nhập theo `user_id`. Khách 33 câu (3 bài)/ngày, đăng nhập 55 câu (5 bài)/ngày. Vượt → 429 "Hết lượt chấm hôm nay". Tăng đếm bằng một Postgres function atomic, chỉ service_role gọi được; chấm/lưu lỗi thì hoàn lại lượt (`refund_scoring_quota`).
- **DB**: migration thêm `responses.feedback text`, `responses.scoring_model text` (dịch vụ/model đã chấm, để hiệu chỉnh sau); thêm `'fluency'`, `'task_response'` vào enum `criterion`; bảng đếm lượt chấm (RLS bật, không policy cho client); `attempts.status` dùng `scored` khi xong.
- **Env mới (server)**: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Chế độ**: chấm cả `cbt`, `timed`, `guided`.
- **shadcn**: không thêm component; phòng thi chỉ đổi trạng thái nút Kết thúc, dòng báo lỗi và dòng thông báo quyền riêng tư.

## Trạng thái UI

- **Loading**: chấm từng câu chạy nền, không chặn làm bài; sau khi bấm Kết thúc nút chuyển sang "Đang chấm bài…" và bị khoá.
- **Empty**: câu im lặng (Azure `InitialSilenceTimeout`, Whisper trả transcript rỗng) → 0 điểm, không gọi LLM chấm, nhận xét "Chưa ghi nhận câu trả lời".
- **Error**: câu chấm lỗi → thử lại khi nộp; vẫn lỗi thì báo lỗi + cho bấm lại (audio còn trên RAM). Rời phòng khi còn câu chưa chấm → attempt giữ `in_progress`, câu đó mất (xử lý gián đoạn ở E2-4). Hết lượt chấm giữa bài → vẫn nộp, câu chưa chấm tính 0 và ghi `scoring_error`.

## Kiểm thử

- Quy đổi: Azure 0–100 → 0–3; band IELTS → 0–3/0–5; tổng thô → 0–200.
- Số đo Fluency từ timestamp Whisper (tốc độ nói, quãng nghỉ).
- Parse JSON của LLM chấm: sai schema, band ngoài 0–9 → lỗi, không ghi điểm.
- Chuyển WebM → WAV 16 kHz (header WAV, sample rate, mono).
- Route chấm: attempt người khác hoặc đã nộp → 404, câu thuộc đề chưa `published` → 404, audio quá lớn → 400, vượt giới hạn lượt chấm → 429.

## Các bước thực hiện

1. Gỡ upload R2: xoá `app/api/answer-audio`, `saveAnswerAudio`; giữ `lib/r2.ts` và env R2; sửa lại E2-2 và E2-3 trong backlog.
2. Migration (`responses.feedback`, `scoring_model`, enum `criterion`, bảng/function đếm lượt chấm + pgTAP), gen types; thêm env và client Supabase service_role chỉ dùng phía server.
3. Chuyển bản ghi Part 1 sang WAV 16 kHz trên trình duyệt + test.
4. Chấm Part 1 bằng Azure (Speech SDK) trong `/api/speaking/score` + test quy đổi.
5. Chấm Part 2–5: Groq Whisper → số đo Fluency → LLM trên Groq, trong cùng route + test số đo, parse, quy đổi.
6. Phòng thi gửi chấm khi chốt câu, thử lại khi nộp, trạng thái "Đang chấm bài…", thông báo quyền riêng tư; khách lưu kết quả vào localStorage.
7. `/api/speaking/finalize`: tổng điểm, `feedback_summary` (ghép nhận xét các câu), `scored` hoặc `scoring_error`.

## Giả định & câu hỏi mở

- Đã chốt: Azure Speech SDK cho Part 1; Groq Whisper + LLM trên Groq (xoay vòng model) cho Part 2–5 theo rubric IELTS, quy về thang TOEIC; số đo Fluency từ timestamp Whisper; thêm `fluency`, `task_response` vào `criterion`; chi phí $0; chấm cả `guided`; khách cũng được chấm; giới hạn 3 bài/ngày (khách), 5 bài/ngày (đăng nhập), đếm trên DB.
- Giả định: quy đổi band → thang câu và tổng → 0–200 là tuyến tính (ETS không công bố bảng quy đổi), hiệu chỉnh khi có dữ liệu thật.
- Rủi ro: rubric IELTS khác rubric TOEIC (TOEIC chấm theo yêu cầu từng Part, có phát âm/ngữ điệu) → điểm Part 2–5 chỉ là ước lượng.
- Rủi ro: Groq free có thể đổi/gỡ model (đặc biệt model preview) → model bị gỡ trả 4xx và tự rơi xuống model kế; kiểm tra `GET /openai/v1/models` khi chấm lỗi hàng loạt.
- Rủi ro: chưa xác minh Groq có lưu audio hay không, và Azure F0 có tính Pronunciation Assessment vào 5 giờ miễn phí không — kiểm tra điều khoản/Portal khi tạo key.
- Rủi ro: IP dùng chung (trường, quán cafe) làm khách chung một hạn mức; khách đổi IP để lách được — chấp nhận ở MVP.
