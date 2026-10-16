# Product Backlog — Toeco (TOEIC Speaking & Writing)

> Cập nhật lần cuối: 2026-10-16 · Branch hiện tại: `feat/exam-builder-form`
>
> **Cách dùng**: đổi checkbox `[ ]` → `[x]` khi xong, cập nhật cột **Trạng thái** trong bảng Epic. Task mới thêm vào đúng Epic, đặt ID tiếp theo.

## Quy ước

| Ký hiệu | Ý nghĩa |
| --- | --- |
| **P0** | Chặn ra mắt (không có thì sản phẩm không dùng thật được) |
| **P1** | Cần cho bản phát hành đầu tiên |
| **P2** | Nên có, làm sau MVP |
| **P3** | Dọn dẹp / nice-to-have |
| **Size** | S ≤ ½ ngày · M ≈ 1–2 ngày · L ≈ 3–5 ngày · XL > 1 tuần (nên tách nhỏ) |
| **Trạng thái** | `Todo` · `In progress` · `Review` · `Done` · `Blocked` |

---

## Tổng quan Epic

| ID | Epic | Ưu tiên | Trạng thái | Tiến độ |
| --- | --- | --- | --- | --- |
| E1 | Lưu dữ liệu người dùng trên Supabase | P0 | In progress | 3/6 |
| E2 | Phòng thi Speaking thật (ghi âm, attempt) | P0 | Todo | 0/5 |
| E3 | Phòng thi Writing đủ 8 câu | P0 | In progress | 1/4 |
| E4 | Pipeline chấm điểm (AI) | P0 | Todo | 0/6 |
| E5 | Quản trị đề (admin) | P1 | In progress | 5/10 |
| E6 | Lộ trình học & AI insight | P1 | Todo | 0/4 |
| E7 | Thống kê, Lịch sử, Sổ lỗi trên dữ liệu thật | P1 | Todo | 0/4 |
| E8 | Auth & bảo mật | P1 | In progress | 4/7 |
| E9 | Chất lượng, test, dọn dẹp | P2–P3 | Todo | 0/7 |
| E10 | Phát hành | P1 | Todo | 0/5 |

---

## E1 — Lưu dữ liệu người dùng trên Supabase (P0)

Hiện `listAttempts`, `saveResponse`, bookmark… đọc/ghi qua `lib/data/local-store.ts` (localStorage). Đăng nhập có nhưng dữ liệu không gắn tài khoản.

- [x] **E1-1** Migration + RLS cho `attempts`, `responses`, `annotations`, `bookmarks` (user chỉ đọc/ghi của mình). Bảng + RLS có sẵn trong `erd_tables`; thêm trigger tính `ends_at` phía server (`20261016130000_attempt_ends_at.sql`) + pgTAP `user_data_rls.test.sql`
- [x] **E1-2** Chuyển `startAttempt`, `updateAttempt`, `getAttempt`, `listAttempts` sang Supabase khi đã đăng nhập (`lib/data/user-data.ts`); khách vẫn dùng localStorage tới khi chốt E1-5. Insert chỉ gửi `exam_id`/`part_template_id`/`mode`; `AttemptPatch` thu hẹp về cột được grant (`status`, `sample_viewed`, `submitted_at`)
- [x] **E1-3** Chuyển `saveResponse`, `listResponses`, `listAnnotations` sang Supabase khi đã đăng nhập. `saveResponse` sửa-trước-thêm-sau thay vì `.upsert()` (client không có quyền update `attempt_id`/`question_id`); phòng thi Writing chờ lưu xong mới nộp, lỗi thì ở lại phòng. Còn nợ: lưu lúc đóng tab có thể bị huỷ (`shortcut:` trong `useWritingAttempt.ts`)
- [ ] **E1-4** (P1, S) Chuyển `listBookmarkedExamIds`, `toggleBookmark` sang Supabase
- [ ] **E1-5** (P1, M) Quyết định số phận dữ liệu guest: migrate localStorage → tài khoản khi đăng nhập, hay bỏ chế độ guest
- [ ] **E1-6** (P1, S) Trạng thái loading/error cho mọi chỗ đọc dữ liệu sau khi chuyển sang mạng

## E2 — Phòng thi Speaking thật (P0)

`app/speaking/test/_components/SpeakingExamRoom.tsx`: đồng hồ chỉ mô phỏng, chưa ghi âm, chưa tạo attempt.

- [ ] **E2-1** (P0, M) Ghi âm từng câu bằng `MediaRecorder` (tái dùng hook trong `app/setting/device-check/_lib`)
- [ ] **E2-2** (P0, M) Upload audio lên storage (Supabase Storage / Cloudflare R2), lưu key vào `attempt_responses`
- [ ] **E2-3** (P0, S) Tạo attempt khi vào phòng, cập nhật `submitted` khi nộp
- [ ] **E2-4** (P1, M) Xử lý gián đoạn: mất mạng, đóng tab, từ chối mic → `interrupted`, cho làm tiếp
- [ ] **E2-5** (P2, S) Nghe lại bản ghi trước khi nộp (chế độ `guided`)

## E3 — Phòng thi Writing đủ 8 câu (P0)

- [x] **E3-1** Phòng thi Part 1 (Q1–5): tả tranh
- [ ] **E3-2** (P0, M) Part 2 (Q6–7): trả lời email
- [ ] **E3-3** (P0, M) Part 3 (Q8): bài luận ý kiến, đếm từ
- [ ] **E3-4** (P1, S) Autosave bài viết (debounce) + khôi phục khi tải lại trang

## E4 — Pipeline chấm điểm (P0)

Cần PRD riêng trước khi làm (`docs/prd/scoring.md`). `score`, `scoring_error` hiện luôn `null`.

- [ ] **E4-1** (P0, S) Viết PRD chấm điểm: tiêu chí (`criterion` enum), thang điểm TOEIC, chi phí AI, SLA
- [ ] **E4-2** (P0, L) Backend/Edge Function: speech-to-text cho Speaking
- [ ] **E4-3** (P0, L) Chấm theo rubric bằng LLM → `score`, nhận xét, `annotations` theo câu
- [ ] **E4-4** (P0, M) Hàng đợi + trạng thái `scoring` → `scored` / lỗi; retry
- [ ] **E4-5** (P1, M) UI chờ chấm (polling hoặc realtime) và trang kết quả
- [ ] **E4-6** (P1, S) Test logic quy đổi điểm

## E5 — Quản trị đề (admin) (P1)

PRD: [`docs/prd/exam-builder.md`](prd/exam-builder.md)

- [x] **E5-1** Chặn quyền admin cho `/setting/exam-management` (phía client)
- [x] **E5-2** `lib/data/content.ts` đọc đề từ Supabase
- [x] **E5-3** Zod schema đề Speaking + test
- [x] **E5-4** UI form tạo đề Speaking (5 Part)
- [x] **E5-5** Nối form với RPC `create_exam`
- [ ] **E5-6** (P1, S) Xoá đề gọi API thật (hiện chỉ gỡ khỏi state — `ExamLibrary.tsx:25`)
- [ ] **E5-7** (P1, L) Form tạo đề Writing (3 Part)
- [ ] **E5-8** (P1, M) Sửa đề + chuyển trạng thái `draft → review → published`
- [ ] **E5-9** (P2, M) Xem trước đề nháp (phòng thi tải đề phía client bằng phiên admin)
- [ ] **E5-10** (P1, S) Phòng thi chặn đề chưa phát hành theo role (`lib/exam-library/room.ts:35`)

Câu hỏi mở cần chốt: RPC/RLS viết ở repo nào · seed đề mock `sp-01`… hay giữ song song · `code` tự sinh hay admin nhập.

## E6 — Lộ trình học & AI insight (P1)

- [ ] **E6-1** (P1, M) `getActivePlan` đọc `study_plans`, `study_plan_weeks`, `plan_tasks` (hiện luôn `null`)
- [ ] **E6-2** (P1, L) Sinh lộ trình từ mục tiêu điểm + ngày thi (AI hoặc rule-based)
- [ ] **E6-3** (P1, S) Ghi `minutes_per_day` khi đổi thời lượng (`SessionDurationSwitch.tsx`)
- [ ] **E6-4** (P2, M) `getLatestInsight` đọc `ai_insights`; sinh insight sau mỗi lượt chấm

## E7 — Thống kê, Lịch sử, Sổ lỗi trên dữ liệu thật (P1)

Phụ thuộc E1 + E4.

- [ ] **E7-1** (P1, S) View `exam_stats` → số lượt làm mỗi đề (`lib/data/content.ts:42`)
- [ ] **E7-2** (P1, S) Lịch sử: query theo một attempt thay vì tải hết (`app/setting/history/_lib/review.ts`)
- [ ] **E7-3** (P1, M) Sổ lỗi sinh pattern từ `annotations` thật
- [ ] **E7-4** (P2, S) Kiểm tra lại Overview/Chart với dữ liệu thật (empty state cho user mới)

## E8 — Auth & bảo mật (P1)

- [x] **E8-1** Đăng ký / đăng nhập email + mật khẩu
- [x] **E8-2** Đăng nhập Google (OAuth)
- [x] **E8-3** Xác thực email bằng OTP
- [x] **E8-4** Đăng xuất (user menu)
- [ ] **E8-5** (P1, M) Chặn route phía server: chuyển phiên sang cookie (`@supabase/ssr`) + middleware
- [ ] **E8-6** (P1, S) Quên mật khẩu / đặt lại mật khẩu
- [ ] **E8-7** (P2, S) Rà RLS toàn bộ bảng trước khi phát hành

## E9 — Chất lượng, test, dọn dẹp (P2–P3)

- [ ] **E9-1** (P2, M) Test cho logic quan trọng: quyền admin, chấm điểm, `user-stats`
- [ ] **E9-2** (P2, S) Thay dữ liệu mock ở footer (`components/layout/footer/footer-data.ts`)
- [ ] **E9-3** (P3, S) Quyết định `lucide-react` trong `components/ui/*` (shadcn sinh) vs quy định chỉ dùng `react-icons/lu`
- [ ] **E9-4** (P3, S) Validate row localStorage bằng zod hoặc xoá hẳn khi E1 xong (`lib/data/local-store.ts`)
- [ ] **E9-5** (P2, M) Audit accessibility (keyboard, contrast) các trang chính
- [ ] **E9-6** (P2, S) Responsive check ở 375px cho phòng thi
- [ ] **E9-7** (P3, S) Chạy `/ponytail-debt` định kỳ, đóng các `shortcut:` đã xử lý

## E10 — Phát hành (P1)

- [ ] **E10-1** (P1, S) Biến môi trường production (Supabase, storage, AI key) + tách project dev/prod
- [ ] **E10-2** (P1, S) Deploy (Vercel) + domain
- [ ] **E10-3** (P1, S) CI: `lint`, `tsc --noEmit`, `test` trên mỗi PR
- [ ] **E10-4** (P2, S) Theo dõi lỗi (Sentry hoặc tương đương) + analytics cơ bản
- [ ] **E10-5** (P2, S) SEO cơ bản: metadata, `sitemap`, `robots`, OG image

---

## Sprint gợi ý

| Sprint | Mục tiêu | Task |
| --- | --- | --- |
| S1 | Dữ liệu thật | E1-1 → E1-4, E5-6, E8-5 |
| S2 | Làm bài thật | E2-1 → E2-4, E3-2 → E3-4 |
| S3 | Có điểm | E4-1 → E4-5 |
| S4 | Khép vòng học | E6-1 → E6-3, E7-1 → E7-3 |
| S5 | Ra mắt | E5-7, E5-8, E8-6, E8-7, E10-* |

## Đã hoàn thành (trước backlog)

- Giao diện các trang: Overview, Speaking, Writing, Schedule, Mistakes, Setting (Profile, History, Device check, Exam management)
- Kiểm tra thiết bị: mic, loa, ghi thử, bàn phím
- Sổ lỗi, thống kê profile/overview/schedule tính từ attempt (localStorage)
- Trang lỗi, design tokens, cấu hình Vitest
