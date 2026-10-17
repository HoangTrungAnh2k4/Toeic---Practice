# Product Backlog — Toeco (TOEIC Speaking & Writing)

> Cập nhật lần cuối: 2026-10-16 · Branch: `main` · Sprint 2 tuần, bắt đầu từ thứ Hai 2026-10-19
>
> **Cách dùng**
> - Task nằm ở **đúng một chỗ**: trong sprint được xếp, hoặc ở mục *Backlog chưa xếp sprint*. Đổi `[ ]` → `[x]` khi xong.
> - Cuối sprint: cập nhật cột **Tiến độ** ở bảng Epic + **Trạng thái** ở bảng Sprint, task chưa xong thì chuyển sang sprint sau.
> - Task mới: đặt ID tiếp theo trong Epic (vd. `E2-7`), thêm vào *Backlog chưa xếp sprint* rồi mới kéo vào sprint.

## Quy ước

| Ký hiệu | Ý nghĩa |
| --- | --- |
| **P0** | Chặn ra mắt (không có thì sản phẩm không dùng thật được) |
| **P1** | Cần cho bản phát hành đầu tiên |
| **P2** | Nên có, làm sau MVP |
| **P3** | Dọn dẹp / nice-to-have |
| **Size** | S ≤ ½ ngày · M ≈ 1–2 ngày · L ≈ 3–5 ngày · XL > 1 tuần (nên tách nhỏ) |
| **Trạng thái** | `Todo` · `In progress` · `Review` · `Done` · `Blocked` |

**Định nghĩa "xong"** (áp cho mọi task): `npm run lint`, `npx tsc --noEmit`, `npm test` sạch · có loading/empty/error state · đã thử trên app (`npm run dev` + Supabase local) · `shortcut:` mới (nếu có) ghi rõ giới hạn.

---

## Tổng quan Epic

| ID | Epic | Ưu tiên | Trạng thái | Tiến độ | Sprint |
| --- | --- | --- | --- | --- | --- |
| E1 | Lưu dữ liệu người dùng trên Supabase | P0 | Done | 6/6 | S0 |
| E2 | Phòng thi Speaking thật (ghi âm, attempt) | P0 | In progress | 3/6 | S1, S2 |
| E3 | Phòng thi Writing đủ 8 câu | P0 | In progress | 1/4 | S2 |
| E4 | Pipeline chấm điểm (AI) | P0 | In progress | 2/6 | S2 – S4 |
| E5 | Quản trị đề (admin) | P1 | In progress | 8/11 | S1, S5 |
| E6 | Lộ trình học & AI insight | P1 | Todo | 0/4 | S4, S6 |
| E7 | Thống kê, Lịch sử, Sổ lỗi trên dữ liệu thật | P1 | Todo | 0/4 | S4, S6 |
| E8 | Auth & bảo mật | P1 | In progress | 5/8 | S1, S5, S6 |
| E9 | Chất lượng, nợ kỹ thuật, dọn dẹp | P2–P3 | Todo | 0/12 | rải rác |
| E10 | Phát hành | P1 | In progress | 1/5 | S1, S6 |

## Lịch Sprint

| Sprint | Thời gian | Mục tiêu | Tải ước tính | Trạng thái |
| --- | --- | --- | --- | --- |
| S0 | → 2026-10-16 | Dữ liệu người dùng lên Supabase | — | Done |
| S1 | 19/10 – 30/10 | Chặn route phía server + Speaking ghi âm được | ~7 ngày | Todo |
| S2 | 02/11 – 13/11 | Làm bài đủ 2 kỹ năng, chốt PRD chấm điểm | ~6,5 ngày | Todo |
| S3 | 16/11 – 27/11 | Có điểm (STT + chấm rubric + hàng đợi) | ~9,5 ngày ⚠️ | Todo |
| S4 | 30/11 – 11/12 | Trang kết quả + khép vòng học trên dữ liệu thật | ~6,5 ngày | Todo |
| S5 | 14/12 – 25/12 | Quản trị đề đủ Speaking + Writing | ~6,5 ngày | Todo |
| S6 | 28/12 – 08/01/2027 | Sinh lộ trình + ra mắt | ~8 ngày | Todo |

> Tải tính theo S = ½ ngày, M = 1,5 ngày, L = 4 ngày; mỗi sprint ~10 ngày làm việc, chừa ~30% cho bug/review.

---

## Sprint 1 — Chặn route phía server + Speaking ghi âm (19/10 – 30/10)

Mục tiêu: không còn trang nào chỉ chặn phía client; phòng thi Speaking ghi âm, upload và lưu attempt thật.

- [x] **E8-5** (P1, M) Chặn route phía server: chuyển phiên từ `sessionStore` (`lib/supabase.ts`) sang cookie (`@supabase/ssr`) + `proxy.ts` (Next 16 đổi tên `middleware` → `proxy`, xem `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`)
- [x] **E5-10** (P1, S) Phòng thi chặn đề chưa phát hành theo role (`lib/exam-library/room.ts:35`) — *cần E8-5*
- [x] **E5-6** (P1, S) Xoá đề gọi API thật (hiện chỉ gỡ khỏi state — `app/setting/exam-management/_components/ExamLibrary.tsx:25`)
- [x] **E10-3** (P1, S) CI: `lint`, `tsc --noEmit`, `test` trên mỗi PR (chưa có `.github/workflows`)
- [x] **E2-1** (P0, M) Ghi âm từng câu bằng `MediaRecorder` (tái dùng `useMicrophone`, `useTestRecorder` trong `app/setting/device-check/_lib`)
- [x] **E2-2** (P0, M) ~~Upload audio lên storage~~ — *đổi hướng: không lưu audio, gửi thẳng đi chấm từ RAM (xem `docs/prd/scoring.md`); env R2 + `lib/r2.ts` giữ cho sau này*
- [x] **E2-3** (P0, S) Tạo attempt khi vào phòng (`startAttempt`), cập nhật `submitted` khi nộp — bỏ `shortcut:` ở `SpeakingExamRoom.tsx:38`
- [ ] **E2-6** (P1, S) Hộp thoại thoát phòng Speaking đang hard-code "TOEIC Speaking Mock Test 04 (Câu 3/11)" (`ExitConfirmDialog.tsx:38`) → lấy tên đề + câu hiện tại

## Sprint 2 — Làm bài đủ 2 kỹ năng (02/11 – 13/11)

Mục tiêu: thí sinh làm trọn đề Speaking (11 câu) và Writing (8 câu), bài không mất khi gián đoạn. PRD chấm điểm được duyệt để S3 bắt tay ngay.

- [ ] **E3-2** (P0, M) Writing Part 2 (Q6–7): trả lời email (`WritingExamRoom` hiện chỉ nhận một `RoomPart` Q1–5)
- [ ] **E3-3** (P0, M) Writing Part 3 (Q8): bài luận ý kiến, đếm từ (`countWords` có sẵn trong `app/writing/test/utils.ts`)
- [ ] **E3-4** (P1, S) Autosave bài viết (debounce) + khôi phục khi tải lại trang
- [ ] **E2-4** (P1, M) Xử lý gián đoạn Speaking: mất mạng, đóng tab, từ chối mic → `interrupted`, cho làm tiếp
- [ ] **E9-9** (P2, S) Lưu Writing lúc đóng tab có thể bị huỷ, mất ~600ms gõ cuối (`shortcut:` ở `useWritingAttempt.ts:103`) — gộp khi làm E3-4
- [ ] **E9-8** (P2, S) Khách đang trong phòng thi mà đăng nhập ở tab khác → lượt lưu kế tiếp gửi attempt id cục bộ lên Supabase và báo lỗi (nợ từ E1-5)
- [x] **E4-1** (P0, S) Viết PRD `docs/prd/scoring.md`: tiêu chí (`criterion` enum), thang điểm TOEIC, nhà cung cấp STT/LLM, chi phí mỗi bài, SLA

## Sprint 3 — Có điểm (16/11 – 27/11)

Mục tiêu: bài nộp được chấm tự động, `score`/`scoring_error` không còn luôn `null`. *Cần E2-2, E3-2/3, E4-1.*

> ⚠️ Sprint nặng nhất (2 task L). Nếu trễ: đẩy E4-4 sang S4, tạm chấm đồng bộ.

- [x] **E4-2** (P0, L) Backend/Edge Function: speech-to-text cho Speaking — *Route Handler `app/api/speaking/score`: Azure (Part 1), Groq Whisper (Part 2–5)*
- [ ] **E4-3** (P0, L) Chấm theo rubric bằng LLM → `score`, nhận xét, `annotations` theo câu — *Speaking đã chấm điểm + nhận xét bằng Gemma; còn `annotations` và Writing*
- [ ] **E4-4** (P0, M) Hàng đợi + trạng thái `scoring` → `scored` / lỗi; retry

## Sprint 4 — Kết quả + khép vòng học (30/11 – 11/12)

Mục tiêu: xem điểm ngay sau khi nộp; Lịch sử, Sổ lỗi, Lộ trình đọc dữ liệu thật thay vì mock/tính tạm.

- [ ] **E4-5** (P1, M) UI chờ chấm (polling hoặc realtime) + trang kết quả (`ReviewScoringState`, `ReviewScoreSummary` có sẵn)
- [ ] **E4-6** (P1, S) Test logic quy đổi điểm (`lib/domain/score-levels.ts`)
- [ ] **E7-1** (P1, S) View `exam_stats` → số lượt làm mỗi đề (`lib/data/content.ts:42`)
- [ ] **E7-2** (P1, S) Lịch sử: query một attempt thay vì tải hết (`app/setting/history/_lib/review.ts:14`)
- [ ] **E7-3** (P1, M) Sổ lỗi sinh pattern từ `annotations` thật (`lib/data/mistake-patterns.ts`) — *cần E4-3*
- [ ] **E6-1** (P1, M) `getActivePlan` đọc `study_plans`, `study_plan_weeks`, `plan_tasks` (hiện luôn `null` — `lib/data/user-data.ts:52`)
- [ ] **E6-3** (P1, S) Ghi `minutes_per_day` khi đổi thời lượng (`SessionDurationSwitch.tsx:12`)

## Sprint 5 — Quản trị đề đủ (14/12 – 25/12)

Mục tiêu: admin tự tạo, sửa, phát hành đề cả hai kỹ năng, không cần sửa DB tay. PRD: [`docs/prd/exam-builder.md`](prd/exam-builder.md)

- [ ] **E5-7** (P1, L) Form tạo đề Writing (3 Part) — tái dùng `ExamBuilderForm`, `PartSection`, `examSchema`
- [ ] **E5-8** (P1, M) Sửa đề + chuyển trạng thái `draft → review → published`
- [ ] **E8-6** (P1, S) Quên mật khẩu / đặt lại mật khẩu (chưa có route nào)
- [ ] **E9-10** (P2, S) supabase-js tự retry GET 3 lần nên báo lỗi hiện sau ~15 giây → giảm retry hoặc timeout cho trang đọc dữ liệu (nợ từ E1-6)

## Sprint 6 — Sinh lộ trình + ra mắt (28/12 – 08/01/2027)

Mục tiêu: người dùng mới vào là có lộ trình; deploy production.

- [ ] **E6-2** (P1, L) Sinh lộ trình từ mục tiêu điểm + ngày thi (AI hoặc rule-based)
- [ ] **E7-4** (P2, S) Kiểm tra Overview/Chart với dữ liệu thật, empty state cho user mới
- [ ] **E8-7** (P1, S) Rà RLS toàn bộ bảng trước khi phát hành (bổ sung pgTAP trong `back-end/supabase/tests`)
- [ ] **E9-2** (P2, S) Thay dữ liệu mock ở footer (`components/layout/footer/footer-data.ts`)
- [ ] **E9-6** (P2, S) Responsive check ở 375px cho 2 phòng thi
- [ ] **E10-1** (P1, S) Biến môi trường production (Supabase, storage, AI key) + tách project dev/prod
- [ ] **E10-2** (P1, S) Deploy (Vercel) + domain — *cần E10-1*
- [ ] **E10-4** (P2, S) Theo dõi lỗi (Sentry hoặc tương đương) + analytics cơ bản
- [ ] **E10-5** (P2, S) SEO cơ bản: metadata cho mọi trang (hiện mới 9 trang có), `sitemap`, `robots`, OG image

---

## Backlog chưa xếp sprint

Sau ra mắt, hoặc kéo vào sprint nào còn dư chỗ.

- [ ] **E2-5** (P2, S) Nghe lại bản ghi trước khi nộp (chế độ `guided`)
- [x] **E5-9** (P2, M) Xem trước đề nháp — xong cùng E5-10: phòng thi đọc đề bằng phiên của người dùng phía server, admin bấm nút xem trước ở kho đề là vào được đề `draft`/`review`
- [ ] **E5-11** (P2, S) Chế độ xem trước không lưu attempt: admin mở đề `draft`/`review` từ kho đề thì phòng thi Writing vẫn gọi `startAttempt` (`app/writing/test/_lib/useWritingAttempt.ts:33`), tạo attempt thật hiện trong lịch sử. Speaking sẽ dính khi làm E2-3 — *gộp khi làm E2-3*
- [ ] **E8-8** (P1, S) `proxy.ts` gọi `supabase.auth.getClaims()` ở mọi request trang: chỉ xác thực JWT tại chỗ (JWKS cache) khi project ký bằng khoá bất đối xứng (local đang ES256). Project production còn dùng JWT secret cũ (HS256) thì mỗi request gọi Supabase Auth → bật JWT Signing Keys (ES256/RS256) trước khi ra mắt, hoặc thu hẹp `matcher`
- [ ] **E6-4** (P2, M) `getLatestInsight` đọc `ai_insights` (`lib/data/user-data.ts:58`); sinh insight sau mỗi lượt chấm — *cần E4*
- [ ] **E9-1** (P2, M) Test cho logic quan trọng: quyền admin, `user-stats` (hiện mới có 3 file test)
- [ ] **E9-3** (P3, S) Quyết định `lucide-react` trong `components/ui/*` (shadcn sinh) vs quy định chỉ dùng `react-icons/lu`
- [ ] **E9-4** (P3, S) Validate row localStorage bằng zod (`lib/data/local-store.ts:6`; vẫn cần vì giữ chế độ khách)
- [ ] **E9-5** (P2, M) Audit accessibility (keyboard, contrast) các trang chính
- [ ] **E9-7** (P3, S) Chạy `/ponytail-debt` định kỳ, đóng các `shortcut:` đã xử lý
- [ ] **E9-11** (P2, S) Thử trên app nhánh lỗi của `/mistakes/[id]`, `/setting/history/[id]`, phòng thi (khi API sập, server không lấy được đề nên rơi vào `app/error.tsx`)
- [ ] **E9-12** (P3, S) Xoá SVG mẫu của Next không dùng: `public/{file,globe,next,window}.svg`

---

## Ghi chú theo Epic

- **E2** — `SpeakingExamRoom.tsx`: đồng hồ chỉ mô phỏng, chưa ghi âm, chưa tạo attempt.
- **E4** — Không code trước khi PRD (E4-1) được duyệt. Cần quyết: nhà cung cấp STT/LLM, ngân sách/bài, chấm đồng bộ hay hàng đợi.
- **E5** — Câu hỏi mở: RPC/RLS viết ở repo nào · seed đề mock `sp-01`… hay giữ song song · `code` tự sinh hay admin nhập.
- **E7** — Phụ thuộc E1 (xong) + E4.
- **Chế độ khách** (chốt ở E1-5) — dữ liệu khách ở lại localStorage, **không** chuyển sang tài khoản khi đăng nhập; ai dùng chung trình duyệt ở chế độ khách đều thấy.

---

## Sprint 0 — Đã hoàn thành (→ 2026-10-16)

**E1 — Lưu dữ liệu người dùng trên Supabase** (người đăng nhập dùng `lib/data/user-data.ts`, khách dùng `lib/data/local-store.ts`)

- [x] **E1-1** Migration + RLS cho `attempts`, `responses`, `annotations`, `bookmarks`; trigger `ends_at` phía server (`20261016130000_attempt_ends_at.sql`) + pgTAP `user_data_rls.test.sql`
- [x] **E1-2** `startAttempt`, `updateAttempt`, `getAttempt`, `listAttempts` sang Supabase; `AttemptPatch` thu hẹp về cột được grant
- [x] **E1-3** `saveResponse`, `listResponses`, `listAnnotations` sang Supabase; phòng Writing chờ lưu xong mới nộp
- [x] **E1-4** Bookmark trên Supabase; toggle xoá-trước-thêm-sau, trùng khoá `23505` coi như đã lưu
- [x] **E1-5** Chốt không chuyển dữ liệu khách sang tài khoản; banner `GuestDataNotice`; `useCurrentUser` trả `undefined` khi chưa đọc xong phiên (hết nháy UI khách); lint bỏ qua `.claude/**`
- [x] **E1-6** Loading/error cho mọi chỗ đọc dữ liệu: `hooks/use-async.ts` + `components/load-error.tsx`; thư viện đề dùng `UserExamStatesProvider`, đánh dấu đề cập nhật lạc quan

**Các Epic khác**

- [x] **E3-1** Phòng thi Writing Part 1 (Q1–5): tả tranh
- [x] **E5-1 → E5-5** Chặn quyền admin (client) · `lib/data/content.ts` đọc đề từ Supabase · Zod schema đề Speaking + test · form tạo đề Speaking (5 Part) · nối RPC `create_exam`
- [x] **E8-1 → E8-4** Đăng ký/đăng nhập email · Google OAuth · xác thực email OTP · đăng xuất

**Trước khi có backlog**

- Giao diện: Overview, Speaking, Writing, Schedule, Mistakes, Setting (Profile, History, Device check, Exam management)
- Kiểm tra thiết bị: mic, loa, ghi thử, bàn phím
- Sổ lỗi, thống kê profile/overview/schedule tính từ attempt
- Trang lỗi, design tokens, cấu hình Vitest
