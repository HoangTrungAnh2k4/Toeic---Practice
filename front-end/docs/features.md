# Tính năng website Toeco (hiện trạng)

> Quét từ code `front-end/` + `back-end/supabase` ngày 2026-10-20. Mô tả cái **đang chạy trong code**, không phải kế hoạch. Việc còn dở xem [`backlog.md`](backlog.md); thiết kế chi tiết từng phần xem `docs/prd/*`.

## 1. Tổng quan sản phẩm

**Toeco** là web luyện thi **TOEIC Speaking & Writing** theo format ETS hiện hành:

- **Speaking**: 11 câu / 5 Part, khoảng 20 phút.
- **Writing**: 8 câu / 3 Part, 60 phút.

Vòng học khép kín: **chọn đề → kiểm tra thiết bị → làm bài trong phòng thi → AI chấm + nhận xét → lỗi gom vào Sổ lỗi → Lộ trình học xếp lịch theo điểm và lỗi**.

**Stack**: Next.js 16 (App Router, Cache Components, `proxy.ts`), Tailwind + shadcn/ui, Supabase (Postgres + Auth + RLS), Cloudflare R2 (ảnh đề), Azure AI Speech + Groq (chấm điểm).

### Đối tượng dùng

| Vai trò | Quyền |
| --- | --- |
| **Khách** (chưa đăng nhập) | Làm bài, được chấm AI, xem lịch sử/sổ lỗi. Dữ liệu chỉ lưu `localStorage` của trình duyệt. Không có lộ trình học. |
| **Học viên** (`student`) | Như khách, dữ liệu lưu trên Supabase, có lộ trình học, mục tiêu điểm, hạn mức chấm cao hơn. |
| **Quản trị** (`admin`) | Thêm mục **Quản trị đề thi**: tạo/sửa/xoá/phát hành đề, xem trước đề nháp. |

### Bản đồ route

| Route | Trang | Ai vào được |
| --- | --- | --- |
| `/` | Landing page | Mọi người |
| `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password` | Xác thực | Mọi người |
| `/overview` | Tổng quan | Mọi người |
| `/speaking`, `/writing` | Thư viện đề theo kỹ năng | Mọi người |
| `/speaking/test?id=…&mode=…` | Phòng thi Speaking | Mọi người |
| `/writing/test?id=…&mode=…&part=…` | Phòng thi Writing | Mọi người |
| `/mistakes`, `/mistakes/[id]` | Sổ lỗi, chi tiết mẫu lỗi | Mọi người |
| `/schedule` | Lộ trình học | Mọi người (khách thấy lời mời đăng ký) |
| `/setting` | Trang cài đặt (danh mục) | Mọi người |
| `/setting/profile` | Hồ sơ cá nhân | Mọi người |
| `/setting/history`, `/setting/history/[id]` | Lịch sử làm bài, xem lại bài | Mọi người |
| `/setting/device-check` | Kiểm tra thiết bị | Mọi người |
| `/setting/exam-management` (+ `/new`, `/[id]/edit`) | Quản trị đề | Chỉ admin |

Điều hướng chính: **sidebar** bên trái (Overview, Speaking, Writing, Mistakes, Schedule, Setting), thu gọn được; dưới `md` chuyển thành thanh trên + drawer. Đáy sidebar là menu tài khoản (Hồ sơ, Lịch sử, Đăng xuất) hoặc nút Đăng nhập/Đăng ký cho khách. Sidebar và footer ẩn ở trang auth, footer ẩn trong phòng thi.

---

## 2. Landing page (`/`)

Trang giới thiệu, dẫn người dùng vào luyện tập. Các section:

1. **Hero**: thông điệp chính, đồng hồ đếm giờ minh hoạ, sóng âm, CTA "Thi thử".
2. **Sổ lỗi**: demo cách hệ thống gạch lỗi và gom lỗi lặp lại.
3. **Lộ trình**: minh hoạ mục tiêu điểm và lịch tuần.
4. **Format ETS**: bảng cấu trúc 5 Part Speaking (câu, thời gian chuẩn bị/trả lời).
5. **FAQ**: 5 câu hỏi (chế độ khách, đăng nhập, hạn mức chấm, cấu trúc đề, độ tin cậy điểm AI), dạng accordion `<details>` chỉ mở một câu.
6. Footer + nút **Back to top**.

---

## 3. Xác thực & tài khoản

| Tính năng | Chi tiết |
| --- | --- |
| **Đăng ký email** | Họ tên, email, mật khẩu (≥ 8 ký tự, có cả chữ và số), validate bằng zod. |
| **Xác thực email bằng OTP** | Sau đăng ký, `/verify-email` nhập mã 6 số (hiệu lực 10 phút), có nút "Nhập lại email". |
| **Đăng nhập email + mật khẩu** | Có checkbox **Ghi nhớ đăng nhập**: tắt thì cookie phiên hết khi đóng trình duyệt. |
| **Google OAuth** | "Tiếp tục với Google" / "Đăng ký bằng Google". |
| **Quên / đặt lại mật khẩu** | `/forgot-password` gửi mã 6 số (không tiết lộ email có tồn tại hay không) → `/reset-password` nhập mã + mật khẩu mới → vào `/overview`. |
| **Đăng xuất** | Từ menu tài khoản ở sidebar. |
| **Phiên đăng nhập** | Lưu trong cookie (`@supabase/ssr`); `proxy.ts` làm mới token mỗi request và chuyển khách về `/login` khi vào route cần đăng nhập. Quyền admin kiểm tra thêm ở layout. |
| **Chế độ khách** | Banner `GuestDataNotice` nhắc dữ liệu chỉ lưu trên trình duyệt này, mời đăng ký (đóng được). Dữ liệu khách **không** được chuyển sang tài khoản khi đăng nhập. |

Lỗi Supabase được dịch sang thông báo tiếng Việt (`authErrorMessage`).

---

## 4. Tổng quan (`/overview`)

Dashboard sau khi đăng nhập:

- **Banner chào mừng** + nút "Bắt đầu luyện tập", "Kiểm tra âm thanh".
- **Mục tiêu kỹ năng** (Speaking/Writing): điểm hiện tại (lượt làm cả đề gần nhất), điểm mục tiêu, Level, lỗi trọng tâm từ Sổ lỗi; chưa có mục tiêu thì mời đặt mục tiêu.
- **Biểu đồ tiến độ**: số lượt nộp bài theo Part.
- **Hoạt động gần đây**: bảng các lượt làm mới nhất (kỹ năng, Part, điểm, trạng thái, nút hành động) + link "Xem toàn bộ lịch sử".
- **Thẻ cam kết** về chuẩn ETS.

Có skeleton khi tải và empty state cho người dùng mới.

---

## 5. Thư viện đề (`/speaking`, `/writing`)

Dùng chung bộ component `components/exam-library/*`, chỉ hiển thị đề **`published`**.

- **Hero**: đề được gợi ý làm tiếp/làm tiếp theo, với nút thi thử và nút "Có hướng dẫn".
- **KPI**: thống kê nhanh của người dùng trên kho đề (đã làm, đang dở…).
- **Tab**: Tất cả đề · Làm lại · Đã đánh dấu.
- **Bộ lọc**: tìm theo tên/mã, trạng thái (Chưa làm / Đang làm dở / Đã hoàn thành), chủ đề (Workplace & Office, Customer Service, Retail & Sales, Travel & Hospitality, Technology & Media, Logistics & Supply, Business Strategy). Bộ lọc đồng bộ lên URL.
- **Phân trang**: 6 đề / trang.
- **Thẻ đề** theo trạng thái người dùng:
  - *Chưa làm*: badge "Chuẩn ETS" / "Toeco biên soạn", số câu + thời lượng, nút **Thi thử CBT** và **Có hướng dẫn**.
  - *Đang làm dở*: nút làm tiếp.
  - *Đã làm*: số lượt đã làm, ngày làm gần nhất, nút làm lại / xem kết quả.
- **Bookmark** đề (cập nhật lạc quan; khách lưu localStorage).
- **Hướng dẫn rubric** (Speaking/Writing) và **mẹo chiến lược từng Part**.
- Writing có header riêng giới thiệu 3 Part.

### Chế độ làm bài (`mode`)

| Mode | Tên hiển thị | Hành vi |
| --- | --- | --- |
| `cbt` (mặc định) | Thi thử chuẩn (CBT) | Đúng thời gian ETS, khoá chuyển câu khi chưa xong. |
| `timed` | Luyện có thời gian | Có đồng hồ. Thư viện hiện chưa có nút vào mode này (chỉ vào được qua URL). |
| `guided` | Học có hướng dẫn | Speaking: được bỏ qua chuẩn bị, chuyển câu bất cứ lúc nào. Writing: không giới hạn thời gian. |

---

## 6. Phòng thi Speaking (`/speaking/test`)

Server đọc đề bằng phiên người dùng (admin mở được đề `draft`/`review` để xem trước; người khác chỉ đề `published`).

- **Luồng mỗi câu**: Chuẩn bị (không ghi âm, đếm `prep_sec`) → Trả lời (ghi âm `MediaRecorder`, đếm `response_sec`) → Đã chốt → "Tiếp tục". Thời gian theo `PART_TEMPLATES`:

  | Part | Câu | Nhiệm vụ | Chuẩn bị | Trả lời |
  | --- | --- | --- | --- | --- |
  | 1 | 1–2 | Read a text aloud | 45s | 45s |
  | 2 | 3–4 | Describe a picture | 45s | 30s |
  | 3 | 5–7 | Respond to questions | 3s | 15/15/30s |
  | 4 | 8–10 | Respond using information provided (đọc trước 45s) | 3s | 15/15/30s |
  | 5 | 11 | Express an opinion | 45s | 60s |

- **Giao diện**: header (tên đề, mode, thanh bước Chuẩn bị → Trả lời → Chốt bài, đồng hồ), banner hướng dẫn Part, đề bài (đoạn văn / ảnh / ngữ liệu chung), HUD ghi âm có đo mức âm, thanh tiến độ 11 câu.
- **Thông báo quyền riêng tư**: bài nói chấm ngay sau mỗi câu, không lưu; Part 1 gửi Azure, Part 2–5 gửi Groq.
- **Chấm nền**: chốt câu nào gửi chấm câu đó ngay; bấm Kết thúc thì chờ các câu đang chấm, thử lại câu lỗi, rồi chuyển sang trang kết quả.
- **Gián đoạn**: vào lại đề là **làm tiếp** lượt dở (`in_progress`/`interrupted`), bỏ qua câu đã có điểm. Bấm "Thoát bài thi" có hộp thoại xác nhận (tên đề + câu hiện tại) → lượt chuyển `interrupted`. Mic tắt thì đồng hồ dừng.
- Hết hạn mức chấm giữa bài vẫn nộp được; câu chưa chấm tính 0 và ghi lỗi.

## 7. Phòng thi Writing (`/writing/test`)

**Mỗi Part là một lượt làm (attempt) riêng**, chọn Part qua `?part=`. Nộp Part 1 tự sang Part 2, Part 2 sang Part 3, Part cuối sang trang kết quả.

| Part | Câu | Nhiệm vụ | Thời gian |
| --- | --- | --- | --- |
| 1 | Q1–5 | Viết câu theo tranh, dùng 2 từ khoá | 8 phút cả Part |
| 2 | Q6–7 | Trả lời email | 10 phút / câu |
| 3 | Q8 | Bài luận nêu quan điểm | 30 phút |

- **Header**: tên đề, mode, nhóm câu (Q1–5 / Q6–7 / Q8), đồng hồ (cảnh báo khi còn ≤ 60s), trạng thái lưu nháp.
- **Đề bài**: ảnh + từ khoá (Part 1), email gốc + yêu cầu (Part 2), đề luận (Part 3).
- **Trình soạn thảo**: Cut / Copy / Paste / Undo (Ctrl+Z) / Redo (Ctrl+Y) tự cài, đếm từ (gợi ý 12–25 từ cho Q1–5, mục tiêu ≥ 300 từ cho Q8), **phát hiện từ khoá đã dùng** ở Part 1. Không có kiểm tra chính tả (giống thi thật).
- **Điều hướng câu** trong Part + hộp thoại xác nhận nộp Part, hộp thoại thoát.
- **Autosave**: lưu debounce 600ms lên Supabase/localStorage + bản nháp `localStorage` ghi đồng bộ mỗi lần gõ; tải lại trang thì khôi phục (ưu tiên bản nháp).
- **Chấm nền** sau khi nộp mỗi Part, không chặn chuyển Part.

---

## 8. Chấm điểm bằng AI

Chạy trong Route Handler của Next (`app/api/*`), ghi kết quả bằng `service_role` (client không ghi được cột điểm).

### Speaking — `POST /api/speaking/score`, `POST /api/speaking/finalize`

- **Part 1**: Azure AI Speech Pronunciation Assessment (trình duyệt chuyển bản ghi sang WAV 16 kHz), điểm 0–100 quy về thang câu 0–3.
- **Part 2–5**: Groq Whisper (transcript + timestamp) → tính số đo Fluency (tốc độ nói, số quãng nghỉ > 2s, tỉ lệ im lặng) → LLM trên Groq chấm 4 tiêu chí Fluency, Vocabulary, Grammar, Task Response (band 0–9) + nhận xét tiếng Việt. Model xoay vòng khi lỗi/hết quota.
- Câu im lặng: 0 điểm, "Chưa ghi nhận câu trả lời".
- **Không lưu audio** ở đâu cả (chỉ nằm trên RAM của request).
- Finalize: tổng thô (tối đa 35) quy về **0–200** (bội số 10) + **Level 1–8**.
- Chưa có `annotations` (gạch lỗi theo đoạn) cho Speaking.

### Writing — `POST /api/writing/score` (`maxDuration` 60s)

- Rubric ETS bằng LLM trên Groq, mỗi câu một lượt gọi. Thang câu: Q1–5 0–3, Q6–7 0–4, Q8 0–5.
- Kiểm tra cứng phía server làm đầu vào: từ khoá đã dùng, số câu (Q1–5), số từ (Q8).
- Sinh **`annotations`**: câu trích, bản sửa, giải thích, tiêu chí, mức độ; server tự định vị đoạn trong bài; LLM chọn **mẫu lỗi** từ danh mục của đúng Part.
- Điểm theo Part quy về 0–200; **tổng cả bài** 0–200 (Level 1–9) khi đủ 3 Part (gộp lượt chấm gần nhất mỗi Part).
- Chống chấm trùng (`submitted → scoring` có điều kiện). Lỗi → `scoring_error` + nút **Chấm lại** (chỉ chấm câu chưa có điểm, lượt kẹt > 2 phút được chiếm lại).

### Hạn mức & bảo vệ

- **Hạn mức theo câu/ngày (giờ VN), dùng chung 2 kỹ năng**: khách 33 câu (đếm theo hash IP), đăng nhập 55 câu (theo `user_id`). Vượt → 429 "Hết lượt chấm hôm nay". Chấm lỗi được hoàn lượt.
- Server tự lấy đề từ DB, không tin text đề client gửi; kiểm tra attempt thuộc về người gọi; giới hạn kích thước audio/bài viết.

### Quy đổi Level (`lib/domain/score-levels.ts`)

- Speaking 8 Level: 0, 40, 60, 80, 110, 130, 160, 190.
- Writing 9 Level: 0, 40, 50, 70, 90, 110, 140, 170, 200.

---

## 9. Lịch sử & xem lại bài (`/setting/history`)

### Danh sách

- **KPI bento**: điểm trung bình, tỉ lệ làm bài độc lập (không trợ giúp), số lượt chưa hoàn tất…
- **Bộ lọc** (đồng bộ URL): tìm kiếm, kỹ năng, chế độ (CBT / có thời gian / có hướng dẫn), phân loại (làm lần đầu, làm lại, đã xem mẫu, độc lập), trạng thái (đã chấm, đang chờ AI chấm, đang làm dở, bị gián đoạn), thời gian (7 ngày, 30 ngày, tháng này).
- **Bảng** + phân trang (10/25/50 dòng): đánh số lần làm và chênh điểm so với lần trước theo đề + Part; nút hành động theo trạng thái ("Tiếp tục làm bài", "Xem lại chi tiết", "Xem bài đã nộp"…).

### Xem lại một bài (`/setting/history/[id]`)

- Header: kỹ năng, đề, mode, có/không xem bài mẫu, thời gian làm.
- **Tổng quan kết quả**: điểm 0–200, Level, nhận xét tổng, lỗi theo tiêu chí; Writing hiện tổng cả bài.
- **Danh sách câu** để nhảy nhanh + **thẻ từng câu**: điểm, nhận xét, transcript (Speaking, có ghi chú do AI nhận dạng), bài viết được **tô các đoạn lỗi** (lỗi lặp lại tô khác lỗi đơn lẻ) kèm danh sách sửa lỗi và link "Xem cách khắc phục" sang Sổ lỗi.
- **Trạng thái đặc biệt**: đang chấm (tự tải lại mỗi 4s, dừng khi có điểm/lỗi/quá 2 phút), chấm lỗi (nút Chấm lại), bài bị gián đoạn, đề đã bị gỡ, không tìm thấy lượt làm.

---

## 10. Sổ lỗi (`/mistakes`)

Gom các `annotations` đã gắn **mẫu lỗi** (`mistake_patterns`, seed 15 mẫu: 11 Writing, 4 Speaking chưa dùng) thành danh sách lỗi cá nhân.

- **Trạng thái mẫu lỗi** tính trên cửa sổ **5 bài gần nhất**: Đang lặp lại → Đang cải thiện → **Đã khắc phục** (3 bài độc lập liên tiếp không lặp lại). Bài có xem bài mẫu vẫn ghi lỗi nhưng không tính vào tiến độ khắc phục.
- **Tóm tắt**: tổng số lỗi theo trạng thái/kỹ năng, tiêu chí yếu nhất, số bài đã phân tích / đang chấm / bị gián đoạn.
- **Bộ lọc** (đồng bộ URL): kỹ năng, trạng thái (mặc định "Cần khắc phục"), tiêu chí, tìm kiếm, sắp xếp (ưu tiên khắc phục / tần suất / gặp gần nhất).
- **Thẻ lỗi**: tên mẫu, phạm vi câu (vd. Q1–5), mức ảnh hưởng (lớn/vừa/nhỏ), thanh tần suất, lần gặp gần nhất.
- Section **"Cách hoạt động"** giải thích cơ chế.

### Chi tiết mẫu lỗi (`/mistakes/[id]`)

Vì sao mất điểm · Cách khắc phục (các bước luyện, cụm từ dùng ngay, checklist tự kiểm tra trước khi nộp) · Tiến độ trên cửa sổ 5 bài · Bằng chứng (câu trích từ từng bài, link về bài) · Thẻ luyện tập · Lỗi liên quan.

---

## 11. Lộ trình học (`/schedule`)

Chỉ cho người đăng nhập (khách thấy thẻ "Đăng ký để nhận lộ trình học riêng").

- **Dialog "Mục tiêu & Lịch thi"**: điểm mục tiêu Speaking/Writing (0–200, bước 10, để trống được), ngày thi (sau hôm nay), số ngày học/tuần (3–7), thời lượng buổi (30/45/60 phút). Lưu là **sinh lại lộ trình**. Mở từ header `/schedule` hoặc từ Profile (`/schedule#goals`).
- **Sinh lộ trình rule-based** (`lib/data/generate-plan.ts`, không gọi AI):
  - Tối đa 12 tuần, kết thúc trước ngày thi; ngày học trải đều trong tuần.
  - Chia ngày giữa 2 kỹ năng theo khoảng cách tới mục tiêu; ưu tiên Part điểm thấp.
  - Tuần 1 có thi thử lấy mốc; mỗi tuần có buổi ôn mẫu lỗi nặng nhất + buổi tổng kết; tuần cuối chỉ thi thử + ôn lỗi.
  - Mỗi tuần có chủ đề ("Chẩn đoán", "Củng cố Part yếu", "Nước rút"…) và lý do ngắn.
  - Lưu bằng RPC `create_study_plan` (một transaction, archive lộ trình cũ).
- **Giao diện**: cột mốc mục tiêu (ngày còn lại, điểm hiện tại/mục tiêu), **trọng tâm hôm nay**, **tuần hiện tại** (chuyển tuần trước/sau, tiến độ tuần), thẻ từng ngày, bảng bài tập trọng điểm trong tuần, tiến độ tháng, công tắc **thời lượng buổi học** (ghi `minutes_per_day`).
- **Tạo lại lộ trình** (có hộp thoại xác nhận, bài đã làm giữ trong lịch sử).
- **Tự đánh dấu xong**: nộp bài thì gắn vào task chưa xong sớm nhất cùng đề, hoặc cùng kỹ năng + Part. Task ôn lỗi / tổng kết có nút **"Đánh dấu xong"**.
- Panel **"Cân bằng & Linh hoạt"** và **"Vì sao lộ trình tuần này như vậy?"** (AI insight) đang là giao diện chờ, xem mục 15.

---

## 12. Hồ sơ cá nhân (`/setting/profile`)

- Thẻ danh tính (avatar, tên, email).
- **Mục tiêu luyện thi**: điểm mục tiêu, ngày thi dự kiến, trạng thái đang theo lộ trình, nút sửa mục tiêu.
- **Biểu đồ xu hướng điểm** theo bài làm cả đề.
- **Điểm theo Part**: tỉ lệ điểm đạt / tối đa của các câu đã chấm.
- **Thói quen học**: chuỗi ngày học, số bài lộ trình hoàn thành trong tháng.
- **Lỗi hay gặp** từ Sổ lỗi + link "Mở sổ lỗi".
- Khách thấy ghi chú "Bài làm chỉ lưu trên trình duyệt này".

## 13. Kiểm tra thiết bị (`/setting/device-check`)

Wizard 5 bước, có thanh bước và trạng thái từng bước:

1. **Loa & tai nghe**: phát âm thanh thử riêng tai trái / tai phải, người dùng xác nhận.
2. **Micro**: xin quyền, đo mức âm thời gian thực (vùng Nhỏ / Lý tưởng / Quá lớn); báo lỗi cụ thể khi bị chặn quyền, không có mic, mic bị app khác dùng, mất kết nối, thiếu HTTPS, trình duyệt không hỗ trợ.
3. **Ghi âm & nghe lại**: ghi thử rồi phát lại.
4. **Bàn phím & bộ gõ**: nhắc tắt bộ gõ tiếng Việt (có hướng dẫn macOS), lưu ý không có kiểm tra chính tả.
5. **Sẵn sàng vào thi**: tổng kết mức sẵn sàng cho Speaking và Writing.

Kèm mẹo khắc phục theo từng bước.

---

## 14. Quản trị đề thi (`/setting/exam-management`, chỉ admin)

Không phải admin thì thấy trang "Bạn không có quyền truy cập".

- **Kho đề**: bảng tất cả đề (mọi trạng thái), tìm kiếm, lọc theo trạng thái và nguồn dữ liệu (ETS / nội bộ), **Xuất JSON** danh sách đang lọc, số lượt làm mỗi đề (view `exam_stats`).
- **Menu thao tác mỗi dòng**: xem trước phòng thi (kể cả đề nháp), sửa đề, chuyển trạng thái, xoá.
- **Tạo đề** Speaking (5 Part / 11 câu) hoặc Writing (3 Part / 8 câu), khung câu cố định theo `PART_TEMPLATES`:
  - Thông tin chung: tiêu đề, chủ đề, mô tả, tag.
  - Speaking: đoạn đọc (P1), ảnh + mô tả ảnh chi tiết (P2, mô tả là đầu vào duy nhất về ảnh cho AI chấm), ngữ liệu chung + câu hỏi (P3, P4), câu hỏi quan điểm (P5); bài mẫu/gợi ý tuỳ chọn.
  - Writing: ảnh + mô tả + đúng 2 từ khoá gốc (Q1–5), email gốc + yêu cầu (Q6–7), đề luận (Q8).
  - **Upload ảnh**: chọn file hoặc dán Ctrl+V; JPG/PNG/WebP ≤ 10 MB, nén trên trình duyệt sang WebP (cạnh dài 1.600px) ≤ 1,5 MB rồi lên R2.
  - Form zod, lỗi dưới từng field, badge đếm lỗi mỗi Part; mã đề tự sinh. Lưu bằng RPC `create_exam` (một transaction), trạng thái `draft`.
- **Sửa đề** (`/[id]/edit`): đề chưa có lượt làm sửa được toàn bộ (thay ảnh thì ảnh cũ bị xoá khỏi R2); đề đã có lượt làm chỉ sửa thông tin chung, phần Part bị khoá.
- **Quy trình trạng thái**: Nháp → Chờ thẩm định → Đang khả dụng; trả về nháp bắt buộc ghi lý do (hiện dưới tên đề). Phát hành bị chặn nếu thiếu dữ liệu, dialog liệt kê từng câu thiếu.
- **Xoá đề**: xoá trong DB và xoá ảnh trên R2.
- API: `POST /api/exams`, `PUT`/`DELETE /api/exams/[id]`, `POST /api/exams/[id]/status`.

---

## 15. Đã có giao diện nhưng chưa hoạt động / còn hạn chế

| Chỗ | Hiện trạng |
| --- | --- |
| Lộ trình: nút "Dời bài hôm nay sang Thứ 7", "Bổ sung đề tự chọn" | Chỉ là nút giao diện, chưa có xử lý. |
| Lộ trình: "Vì sao lộ trình tuần này như vậy?" | `getLatestInsight` luôn trả `null` → luôn hiện "Chưa đủ dữ liệu để phân tích" (E6-4). |
| Cờ "Có xem bài mẫu" (`sample_viewed`) | Lịch sử/Sổ lỗi đọc cờ này nhưng phòng thi chưa có chỗ xem bài mẫu, nên luôn là "Không trợ giúp". |
| Mode `timed` | Không có nút vào từ thư viện đề. |
| Speaking `annotations` + mẫu lỗi | Chưa có; Sổ lỗi hiện chỉ có dữ liệu Writing. |
| Speaking Part 1 | Đọc sai đoạn văn vẫn được điểm (E4-7). |
| Xem trước đề nháp | Phòng thi Writing vẫn tạo attempt thật cho admin (E5-11). |
| Task thi thử Writing trong lộ trình | Được đánh dấu xong ngay khi nộp Part đầu. |
| Footer | Một số link (GitHub/LinkedIn, hướng dẫn, báo lỗi, chính sách) còn là placeholder (E9-2). |
| FAQ landing | Ghi "đăng nhập bằng OTP, không cần nhớ mật khẩu", nhưng thực tế đăng nhập email dùng mật khẩu (OTP chỉ để xác thực email / đặt lại mật khẩu). |
| Nghe lại bản ghi trước khi nộp | Chưa có (E2-5). |

---

## 16. Nền tảng kỹ thuật (tóm tắt)

- **Dữ liệu nội dung** (đề, Part, câu hỏi, mẫu lỗi): Supabase, đọc phía server (`lib/data/content.ts`, `'use cache'`).
- **Dữ liệu người dùng** (attempt, response, annotation, bookmark, lộ trình): `lib/data/user-data.ts` chọn Supabase (đăng nhập) hoặc `localStorage` (khách), chạy phía client.
- **Bảo mật**: RLS bật trên 16/16 bảng, có pgTAP test (`back-end/supabase/tests`); cột điểm chỉ `service_role` ghi; trigger `ends_at` phía server chống gian lận thời gian.
- **Migrations** ở `back-end/supabase/migrations`; template email OTP ở `back-end/supabase/templates`.
- **SEO**: metadata từng trang, Open Graph image, `sitemap.ts` (5 trang công khai), `robots.ts` (chặn `/api`, `/setting`, phòng thi).
- **Test**: Vitest cho schema đề, trạng thái đề, chấm điểm (quy đổi, parse LLM, Groq), WAV, sinh lộ trình, thống kê, cookie, R2…; CI chạy lint + tsc + test.
- **Chưa làm** cho ra mắt: biến môi trường production, deploy Vercel + domain, Sentry/analytics (E10).
