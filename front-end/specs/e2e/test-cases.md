# Ma trận test case E2E — Toeco

> **File này là ĐÁP ÁN (oracle).** Chỉ người được sửa. Agent không ghi được vào `specs/e2e/` vì có hook chặn.
> Agent chỉ được viết test cho các dòng có Trạng thái = `Đã duyệt`. Script `check-test-integrity` sẽ báo lỗi nếu có test ứng với dòng chưa duyệt.

## ⚠️ Đọc trước khi duyệt

Bản nháp đầu được dựng từ `features.md`. File đó **quét từ code**, nên nó mô tả việc code *đang làm*, chưa chắc là việc sản phẩm *phải làm*. Nếu duyệt nguyên văn, bạn đang biến code hiện tại thành đáp án, tức là tautological testing ở cấp tài liệu.

Bản này đã đối chiếu với `docs/prd/*` (2026-10-21): dòng nào PRD có câu trả lời thì cột Nguồn ghi `PRD: <file>#<mục>`; quy tắc chỉ thấy trong code được ghi thành câu hỏi ❓. Toàn bộ câu hỏi gom ở `reports/questions-for-owner.md`, chỗ PRD và code mâu thuẫn ở `reports/suspected-bugs.md`.

Khi duyệt một dòng:

1. Tự hỏi: *"Đây là điều sản phẩm PHẢI làm, hay chỉ là điều code ĐANG làm?"*
2. Đối chiếu nguồn:
   - **ETS**: tài liệu ETS chính thức (định dạng đề, thang điểm, Level).
   - **PRD**: `docs/prd/*`.
   - **HT**: chỉ là hiện trạng lấy từ features.md. Bạn phải tự quyết là đúng hay sai.
   - **ATTT**: nguyên tắc bảo mật chung.
3. Ô có ❓ là câu hỏi. Ghi câu trả lời vào ô đó rồi xoá ❓.
4. Đổi `CẦN XÁC NHẬN` thành `Đã duyệt`.

**Loại:** `H` happy · `E` edge (giá trị biên) · `C` critical (mất dữ liệu, sai điểm, sai thời gian thi) · `X` exception (lỗi từ bên ngoài: mạng, API, thiết bị) · `S` security / phân quyền

**Quy ước ID:** `<MODULE>-<Loại><2 số>`. Tên test bắt buộc bắt đầu bằng ID, ví dụ `test('SP-C02: Part 3 trả lời 15/15/30s', …)`.

`oracle: x.y` nghĩa là giá trị đúng nằm trong `tests/oracle/*.json`. Test phải import từ đó, không gõ lại con số.

**Môi trường E2E:** key Azure/Groq/Gemini/R2 luôn để trống (`playwright.config.ts` chặn). API chấm được mock bằng fixture `scoring`; case cần trạng thái đặc biệt thì seed Supabase local (`scripts/seed-e2e.mjs`, hoặc `adminDb()` trong test). Mock `/api/writing/score` ở trình duyệt KHÔNG ghi DB, nên với người đăng nhập, trạng thái "lỗi chấm" phải seed.

---

## AU — Xác thực

Chưa có PRD cho xác thực. Các ràng buộc mật khẩu hiện chỉ có trong code (`config.toml`, zod schema).

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| AU-H01 | H | Khách | Đăng ký với họ tên, email chưa dùng, mật khẩu `abcd1234` | Chuyển sang `/verify-email` | HT | CẦN XÁC NHẬN |
| AU-E01 | E | Khách | Đăng ký với mật khẩu 7 ký tự `abc1234` | Báo lỗi ngay dưới ô mật khẩu, không gửi form (`oracle: business.password`) | HT (❓ chưa có PRD: tối thiểu 8 ký tự có phải ý đồ sản phẩm?) | CẦN XÁC NHẬN |
| AU-E02 | E | Khách | Mật khẩu 8 ký tự toàn chữ `abcdefgh`, rồi toàn số `12345678` | Cả hai đều báo lỗi | HT (❓ chưa có PRD: bắt buộc có cả chữ và số?) | CẦN XÁC NHẬN |
| AU-E03 | E | Khách | Mật khẩu đúng 8 ký tự có cả chữ và số `abcdefg1` | Hợp lệ (biên dưới) | HT (❓ như AU-E01) | CẦN XÁC NHẬN |
| AU-E04 | E | Khách | Mật khẩu có khoảng trắng hoặc chữ có dấu, ví dụ `mật khẩu1` | ❓ Hợp lệ hay không? | — | CẦN XÁC NHẬN |
| AU-H02 | H | Học viên | Đăng nhập đúng email và mật khẩu | ❓ Vào trang nào (`/overview`?). Menu tài khoản hiện đúng tên | HT | CẦN XÁC NHẬN |
| AU-X01 | X | Khách | Đăng nhập sai mật khẩu | Thông báo tiếng Việt, ở lại `/login`, không lộ thông báo gốc tiếng Anh của Supabase | HT | CẦN XÁC NHẬN |
| AU-C01 | C | Học viên | Đăng nhập với "Ghi nhớ đăng nhập" TẮT | Cookie phiên là session cookie (không có `expires`) | HT | CẦN XÁC NHẬN |
| AU-C02 | C | Học viên | Đăng nhập với "Ghi nhớ đăng nhập" BẬT | Cookie phiên có `expires` ở tương lai | HT | CẦN XÁC NHẬN |
| AU-S01 | S | Khách | Quên mật khẩu: lần lượt nhập email KHÔNG tồn tại và email có tồn tại | Hai trường hợp hiển thị giống hệt nhau, không lộ email nào có tài khoản | ATTT | CẦN XÁC NHẬN |
| AU-E05 | E | Khách | Nhập sai mã OTP (đủ 6 số) ở `/verify-email` | Báo lỗi, vẫn ở trang này | HT | CẦN XÁC NHẬN |
| AU-E06 | E | Khách | Nhập mã OTP 5 số, hoặc có chữ cái | ❓ Nút xác nhận bị khoá hay báo lỗi khi bấm? | — | CẦN XÁC NHẬN |
| AU-H03 | H | Học viên | Đăng xuất từ menu sidebar | Sidebar hiện nút Đăng nhập/Đăng ký thay cho menu tài khoản | HT | CẦN XÁC NHẬN |
| AU-S02 | S | Khách | Mở thẳng `/setting/exam-management` | ❓ Bị chuyển về `/login`, hay hiện trang 403? (PRD nói "người không phải admin thấy trang 403", không tách riêng khách). Dù thế nào cũng không bao giờ thấy danh sách đề | PRD: exam-builder.md#Trạng thái UI + ATTT | CẦN XÁC NHẬN |
| AU-S03 | S | Học viên | Mở `/setting/exam-management` | Trang 403 (không có quyền truy cập), không lộ danh sách đề | PRD: exam-builder.md#Trạng thái UI | CẦN XÁC NHẬN |
| AU-S04 | S | Học viên | Gọi thẳng `POST /api/exams` bằng `request` (đã có cookie học viên), body hợp lệ | Không có đề mới trong DB. ❓ Mã HTTP phải là 401/403? (Code đang trả 400 khi body sai và 500 khi chưa cấu hình R2, trước khi tới bước RLS) | PRD: exam-builder.md#Kiểm thử + ATTT | CẦN XÁC NHẬN |
| AU-S05 | S | Khách | Đăng ký bằng email đã có tài khoản | ❓ Code đang báo "Email này đã được đăng ký, hãy đăng nhập", tức là lộ email nào có tài khoản (khác AU-S01). Đây có phải ý đồ sản phẩm? | ATTT | CẦN XÁC NHẬN |
| AU-E07 | E | Khách | Đăng ký với họ tên 50 ký tự, rồi 51 ký tự | ❓ Code đang chặn họ tên quá 50 ký tự. Đây có phải ý đồ sản phẩm? | — | CẦN XÁC NHẬN |
| AU-E08 | E | Khách | Đăng ký nhưng không tích đồng ý điều khoản | ❓ Code đang chặn gửi form. Đây có phải ý đồ sản phẩm? | — | CẦN XÁC NHẬN |
| AU-X02 | X | Khách | Đăng nhập bằng tài khoản đã đăng ký nhưng chưa nhập OTP | ❓ Code đang gửi lại mã và chuyển sang `/verify-email`. Đây có phải ý đồ sản phẩm? | — | CẦN XÁC NHẬN |
| AU-E09 | E | Học viên | Đặt lại mật khẩu bằng chính mật khẩu cũ | ❓ Code đang báo lỗi "mật khẩu mới phải khác mật khẩu cũ". Đây có phải ý đồ sản phẩm? | — | CẦN XÁC NHẬN |
| AU-S06 | S | Học viên | Mở `/setting/exam-management/<id đề>/edit` và `/setting/exam-management/new` | Trang 403, không lộ nội dung đề hay form tạo đề | PRD: exam-builder.md#Trạng thái UI | CẦN XÁC NHẬN |
| AU-S07 | S | Học viên | Gọi thẳng `POST /api/exams/<id draft>/status` `{status:'review'}` và `DELETE /api/exams/<id>` | Trạng thái đề trong DB không đổi, đề không bị xoá. ❓ Mã HTTP mong đợi? (Code không kiểm vai trò trong route, dựa vào RLS) | PRD: exam-edit.md#Thiết kế kỹ thuật + ATTT | CẦN XÁC NHẬN |

## GU — Chế độ khách

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| GU-H01 | H | Khách | Làm xong Part 1 Writing, mở `/setting/history` | Lượt làm xuất hiện. Không có request nào ghi lên Supabase | HT | CẦN XÁC NHẬN |
| GU-C01 | C | Khách | Làm bài, sau đó đăng nhập | ❓ Hiện trạng là dữ liệu khách KHÔNG được chuyển sang tài khoản. Đây là chủ ý của sản phẩm hay hạn chế tạm thời? | HT | CẦN XÁC NHẬN |
| GU-E01 | E | Khách | Đóng banner nhắc dữ liệu khách rồi tải lại trang | ❓ Banner vẫn ẩn hay hiện lại? | — | CẦN XÁC NHẬN |
| GU-H02 | H | Khách | Mở `/schedule` | Thấy thẻ "Đăng ký để nhận lộ trình học riêng", không có lộ trình | PRD: study-plan.md#Trong phạm vi | CẦN XÁC NHẬN |
| GU-H03 | H | Khách | Làm và nộp bài Speaking (API chấm mock thành công) | Kết quả chấm lưu ở trình duyệt; không có request nào ghi lượt làm lên Supabase | PRD: scoring.md#Thiết kế kỹ thuật | CẦN XÁC NHẬN |

## LB — Thư viện đề

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| LB-C01 | C | Khách và Học viên | Seed 3 đề Speaking: 1 `draft`, 1 `review`, 1 `published`. Mở `/speaking` | Chỉ thấy đề `published` | PRD: exam-edit.md#Vấn đề, writing-exam-builder.md#Trong phạm vi | CẦN XÁC NHẬN |
| LB-E01 | E | Khách | Seed đúng 6 đề published, sau đó thêm đề thứ 7 | Với 6 đề: không có trang 2. Với 7 đề: trang 2 có đúng 1 đề (`oracle: business.library.pageSize`) | HT (❓ chưa có PRD: 6 đề/trang có phải ý đồ sản phẩm?) | CẦN XÁC NHẬN |
| LB-E02 | E | Khách | Chọn chủ đề và trạng thái, rồi tải lại trang | URL chứa bộ lọc. Sau khi tải lại, bộ lọc và kết quả giữ nguyên | HT | CẦN XÁC NHẬN |
| LB-E03 | E | Khách | Tìm một mã đề không tồn tại | Hiện trạng thái rỗng, không lỗi | HT | CẦN XÁC NHẬN |
| LB-H01 | H | Khách | Đánh dấu 1 đề, mở tab "Đã đánh dấu", tải lại trang | Đề có trong tab và vẫn còn sau khi tải lại | HT | CẦN XÁC NHẬN |
| LB-X01 | X | Học viên | Đánh dấu đề trong lúc request ghi bị lỗi mạng | ❓ Biểu tượng đánh dấu quay về trạng thái cũ và có báo lỗi? | — | CẦN XÁC NHẬN |
| LB-H02 | H | Học viên | Có một đề đang làm dở | Thẻ đề hiện nút làm tiếp. Bấm vào mở đúng lượt đang dở | HT | CẦN XÁC NHẬN |
| LB-E04 | E | Khách | Mở `/speaking?topic=khong-co&status=abc&page=999` | ❓ Code đang bỏ qua giá trị lạ và dùng mặc định. Đây có phải ý đồ sản phẩm? Dù thế nào cũng không vỡ trang | — | CẦN XÁC NHẬN |

## SP — Phòng thi Speaking

Đồng hồ phải được điều khiển bằng `page.clock`. Không chờ thời gian thật.

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| SP-H01 | H | Khách | CBT, câu 1: để hết thời gian chuẩn bị, rồi hết thời gian trả lời | Chuẩn bị đúng 45s, trả lời đúng 45s, sau đó ở trạng thái "Đã chốt" (`oracle: ets.speaking.parts[0]`) | ETS | CẦN XÁC NHẬN |
| SP-C01 | C | Khách | CBT: thử chuyển câu khi đang chuẩn bị và khi đang trả lời | Không chuyển được ở cả hai lúc | ETS | CẦN XÁC NHẬN |
| SP-C02 | C | Khách | CBT, Part 3 (câu 5, 6, 7) | Chuẩn bị 3s; trả lời lần lượt 15s, 15s, 30s (`oracle: ets.speaking.parts[2]`) | ETS | CẦN XÁC NHẬN |
| SP-C03 | C | Khách | CBT, Part 4 | Có 45s đọc thông tin trước câu 8; câu 8–10 trả lời 15s, 15s, 30s (`oracle: ets.speaking.parts[3]`) | ETS | CẦN XÁC NHẬN |
| SP-C04 | C | Khách | CBT, Part 2 và Part 5 | Part 2: chuẩn bị 45s, trả lời 30s. Part 5: chuẩn bị 45s, trả lời 60s (`oracle: ets.speaking.parts[1]`, `parts[4]`) | ETS | CẦN XÁC NHẬN |
| SP-H02 | H | Khách | `mode=guided` | Bỏ qua được phần chuẩn bị; chuyển câu lúc nào cũng được | HT | CẦN XÁC NHẬN |
| SP-C05 | C | Học viên | Làm tới câu 4, bấm "Thoát bài thi", xác nhận, sau đó mở lại đề | Hộp thoại có tên đề và câu hiện tại. Lượt chuyển sang `interrupted`. Mở lại thì làm tiếp, không phải làm lại các câu đã có điểm | HT | CẦN XÁC NHẬN |
| SP-X01 | X | Khách | Mic bị từ chối quyền (`mic.deny('NotAllowedError')`) | Đồng hồ dừng, có hướng dẫn cấp quyền mic | HT | CẦN XÁC NHẬN |
| SP-X02 | X | Khách | API chấm trả 500 cho một câu, các câu khác bình thường; bấm Kết thúc | Khi bấm Kết thúc, câu lỗi được gửi chấm lại. Vẫn lỗi thì báo lỗi và cho bấm thử lại. ❓ Tự thử lại khi nộp mấy lần (1?) | PRD: scoring.md#Trạng thái UI | CẦN XÁC NHẬN |
| SP-X03 | X | Khách | API chấm trả 429 giữa bài | Vẫn nộp được bài. Câu chưa chấm tính 0 và có ghi lỗi. Hiện thông báo "Hết lượt chấm hôm nay" | PRD: scoring.md#Trạng thái UI, scoring.md#Thiết kế kỹ thuật | CẦN XÁC NHẬN |
| SP-S01 | S | Khách | Mở phòng thi | Hiện thông báo quyền riêng tư: Part 1 gửi Azure, Part 2–5 gửi Groq để chuyển thành chữ; hệ thống không lưu bản ghi | PRD: scoring.md#Thiết kế kỹ thuật (Quyền riêng tư) | CẦN XÁC NHẬN |
| SP-S02 | S | Học viên | Mở `/speaking/test?id=<id đề draft>` | Nhận 404, không hiện nội dung đề | PRD: writing-exam-builder.md#Trong phạm vi, exam-builder.md#Giả định & câu hỏi mở | CẦN XÁC NHẬN |
| SP-H03 | H | Admin | Mở đề draft bằng nút xem trước | Xem được nội dung đề | PRD: exam-builder.md#Mục tiêu & chỉ số thành công | CẦN XÁC NHẬN |
| SP-E01 | E | Khách | `mode=abc`, hoặc không có tham số `mode` | ❓ Code đang tự dùng `cbt`. Đây có phải ý đồ sản phẩm? | — | CẦN XÁC NHẬN |
| SP-E02 | E | Khách | `id` không tồn tại | ❓ Code đang trả trang 404 chung. Có cần trang thông báo riêng không? | — | CẦN XÁC NHẬN |
| SP-H04 | H | Khách | Chốt câu cuối, bấm Kết thúc trong lúc API chấm còn đang xử lý | Nút chuyển sang "Đang chấm bài…" và bị khoá | PRD: scoring.md#Trạng thái UI | CẦN XÁC NHẬN |
| SP-H05 | H | Khách | Chốt một câu khi API chấm chưa trả về | Vẫn làm tiếp câu sau được, việc chấm không chặn làm bài | PRD: scoring.md#Trạng thái UI | CẦN XÁC NHẬN |
| SP-S03 | S | Khách | Làm đủ 11 câu và nộp | Không có request nào upload audio lên storage (Supabase Storage, R2); audio chỉ gửi tới `/api/speaking/score` | PRD: scoring.md#Mục tiêu & chỉ số thành công | CẦN XÁC NHẬN |

## WR — Phòng thi Writing

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| WR-H01 | H | Khách | Nộp lần lượt Part 1, Part 2, Part 3 | Nộp Part 1 → `?part=2`; nộp Part 2 → `?part=3`; nộp Part 3 → trang kết quả | HT | CẦN XÁC NHẬN |
| WR-C01 | C | Học viên | Gõ bài Part 3 rồi tải lại trang ngay, trước khi hết debounce | Nội dung được khôi phục đầy đủ, không mất ký tự nào | HT | CẦN XÁC NHẬN |
| WR-X01 | X | Học viên | Mất mạng khi autosave (chặn request Supabase), gõ tiếp, rồi tải lại | Nội dung vẫn được khôi phục từ bản nháp. ❓ Có hiện cảnh báo "chưa lưu lên máy chủ" không? | HT | CẦN XÁC NHẬN |
| WR-C02 | C | Khách | CBT: tua đồng hồ tới lúc còn 60s | Có cảnh báo thời gian, không chỉ bằng màu: đồng hồ có `data-state="warning"` và vùng `role="status"` có thông báo cho trình đọc màn hình (`oracle: business.writing.timerWarningSec`) | HT (❓ chưa có PRD: cảnh báo ở mốc 60s có phải ý đồ sản phẩm?) | CẦN XÁC NHẬN |
| WR-C03 | C | Khách | CBT: Part 1 hết 8 phút | ❓ Tự nộp, hay chỉ khoá ô soạn thảo? (Code đang khoá, hiện "Đã hết giờ — bài làm bị khóa") | ETS | CẦN XÁC NHẬN |
| WR-H02 | H | Khách | `mode=guided` | Không có giới hạn thời gian | HT | CẦN XÁC NHẬN |
| WR-E01 | E | Khách | Part 1: dùng từ khoá ở dạng biến đổi (`go` → `went`), viết hoa, hoặc dính dấu câu | ❓ Mỗi trường hợp có được tính là đã dùng từ khoá không? (Bạn tự quyết, không lấy theo code). PRD có ghi gợi ý trong phòng thi chỉ khớp từ gốc + hậu tố, dạng bất quy tắc chỉ AI nhận khi chấm | ETS + PRD: writing-exam-builder.md#Giả định & câu hỏi mở | CẦN XÁC NHẬN |
| WR-E02 | E | Khách | Bộ đếm từ với các chuỗi: `Hello,  world!`, `e-mail`, chuỗi rỗng, chỉ có khoảng trắng | ❓ Điền số từ đúng cho từng chuỗi vào `oracle: business.writing.wordCountSamples` | — | CẦN XÁC NHẬN |
| WR-E03 | E | Khách | Gõ chữ, bấm Ctrl+Z, rồi Ctrl+Y | Undo rồi redo trả lại đúng nội dung | HT | CẦN XÁC NHẬN |
| WR-E04 | E | Khách | Câu 8 với 299 từ và với 300 từ | ❓ Hai trường hợp hiển thị khác nhau thế nào? | — | CẦN XÁC NHẬN |
| WR-X02 | X | Khách | Chấm Part 1: mock trả điểm cho câu 1–4, câu 5 lỗi `scoring_failed`. Mở trang xem bài, bấm "Chấm lại" | Trang xem bài báo lỗi chấm và có nút "Chấm lại". Request chấm lại chỉ gửi câu 5 (câu đã có điểm giữ nguyên) | PRD: writing-scoring.md#Trạng thái UI, writing-scoring.md#Thiết kế kỹ thuật | CẦN XÁC NHẬN |
| WR-C04 | C | Admin | Xem trước một đề Writing đang ở trạng thái draft | ❓ Không tạo lượt làm thật trong lịch sử? PRD chỉ nói admin "xem trước được", không nói về lượt làm. Nếu đúng: dùng `test.fail(true, 'BUG-03: …')` | — (BUG-03) | CẦN XÁC NHẬN |
| WR-H03 | H | Khách | Nộp Part 1 trong lúc API chấm còn đang xử lý | Chuyển ngay sang `?part=2`, không chờ chấm xong | PRD: writing-scoring.md#Mục tiêu & chỉ số thành công | CẦN XÁC NHẬN |
| WR-E05 | E | Học viên | Seed một lượt Writing `scoring`, bắt đầu chấm 3 phút trước; và một lượt bắt đầu chấm 1 phút trước | Lượt 3 phút: có nút "Chấm lại". Lượt 1 phút: hiện "Đang chấm", không có nút "Chấm lại" | PRD: writing-scoring.md#Thiết kế kỹ thuật (Chấm lại), writing-scoring.md#Mục tiêu & chỉ số thành công | CẦN XÁC NHẬN |
| WR-X03 | X | Học viên | Seed một lượt Writing `submitted` có `scoring_error`. Mở trang xem bài | Báo lỗi chấm và có nút "Chấm lại" | PRD: writing-scoring.md#Trạng thái UI | CẦN XÁC NHẬN |
| WR-S01 | S | Học viên | Mở `/writing/test?id=<id đề draft>` | Nhận 404, không hiện nội dung đề | PRD: writing-exam-builder.md#Trong phạm vi | CẦN XÁC NHẬN |

## SC — Điểm và Level

Các case này dùng dữ liệu seed (lượt đã chấm sẵn) hoặc mock API chấm, không gọi AI.

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| SC-C01 | C | Học viên | Seed 2 lượt Speaking đã chấm: điểm 120 và 130 | Trang xem lại hiện Level 5 và Level 6 (`oracle: levels.speaking`) | ETS | CẦN XÁC NHẬN |
| SC-C02 | C | Học viên | Seed 3 lượt Writing: điểm 40, 50 và 200 | Hiện Level 2, Level 3, Level 9 (`oracle: levels.writing`) | ETS | CẦN XÁC NHẬN |
| SC-C03 | C | Học viên | Writing: một bài đủ 3 Part, một bài chỉ có 2 Part | Bài đủ 3 Part hiện tổng điểm cả bài (0–200). Bài thiếu Part không hiện tổng cả bài | PRD: writing-scoring.md#User stories, writing-scoring.md#Trong phạm vi | CẦN XÁC NHẬN |
| SC-E01 | E | Học viên | Seed một lượt đang chấm, tua đồng hồ | Trang hiện "Đang chấm". ❓ Tự tải lại mỗi 4s và dừng sau 2 phút (`oracle: business.history.polling`) có phải ý đồ sản phẩm? | PRD: writing-scoring.md#Trạng thái UI + HT | CẦN XÁC NHẬN |
| SC-C04 | C | Khách | Làm đủ 11 câu Speaking; mock điểm từng câu sao cho tổng thô là 21/35 | Tổng 120/200 và Level 5. Tổng thô quy tuyến tính về 0–200, làm tròn bội số 10 | PRD: scoring.md#Thiết kế kỹ thuật (Thang điểm) + ETS | CẦN XÁC NHẬN |
| SC-C05 | C | Khách | Writing: mock Part 1 tổng thô 15/15; Part 2 tổng thô 4/8 | Part 1: 200/200. Part 2: 100/200 | PRD: writing-scoring.md#Thiết kế kỹ thuật (Thang điểm) | CẦN XÁC NHẬN |

## HI — Lịch sử

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| HI-H01 | H | Học viên | Có một lượt đã chấm | Nút "Xem lại chi tiết" mở đúng bài đó | HT | CẦN XÁC NHẬN |
| HI-H02 | H | Học viên | Seed 2 lượt cùng đề và cùng Part: lần 1 được 60, lần 2 được 80 | Dòng lần 2 hiện "lần 2" và chênh lệch +20 | HT | CẦN XÁC NHẬN |
| HI-E01 | E | Học viên | Seed một bài 6 ngày trước và một bài 8 ngày trước, lọc "7 ngày" | Chỉ hiện bài 6 ngày trước | HT | CẦN XÁC NHẬN |
| HI-E02 | E | Học viên | Bài làm lúc 23:30 ngày 30/9 theo giờ VN; hôm nay là 1/10; lọc "Tháng này" | ❓ Không hiện (ranh giới tháng tính theo giờ VN)? | — | CẦN XÁC NHẬN |
| HI-X01 | X | Học viên | Mở `/setting/history/<id không tồn tại>` | Hiện thông báo không tìm thấy lượt làm | HT | CẦN XÁC NHẬN |
| HI-S01 | S | Học viên A | Mở `/setting/history/<id bài của học viên B>` | Không thấy bất kỳ nội dung nào trong bài của B | ATTT | CẦN XÁC NHẬN |
| HI-E03 | E | Học viên | Có lượt làm của một đề; admin trả đề đó về nháp | ❓ Lượt làm cũ có còn hiện trong Lịch sử không? PRD ghi việc lượt làm biến mất là một rủi ro, chưa nói là đúng hay sai | PRD: exam-edit.md#Giả định & câu hỏi mở | CẦN XÁC NHẬN |
| HI-E04 | E | Học viên | Mở `/setting/history?size=7` | ❓ Code đang bỏ qua giá trị lạ, dùng 10 dòng/trang (chỉ cho 10/25/50). Đây có phải ý đồ sản phẩm? | — | CẦN XÁC NHẬN |

## MI — Sổ lỗi

PRD sổ lỗi chỉ nói "giữ logic hiện tại (cửa sổ 5 bài, chuỗi sạch, độ ưu tiên)", tức là chưa chốt các ngưỡng. Ngưỡng đang lấy từ code nên được ghi thành câu hỏi.

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| MI-C01 | C | Học viên | Seed: mẫu lỗi X xuất hiện, sau đó 3 bài độc lập liên tiếp không lặp lại X | X ở trạng thái "Đã khắc phục" (`oracle: business.mistakes`). ❓ Ngưỡng 3 bài có phải ý đồ sản phẩm? | PRD: mistake-patterns.md#User stories (trạng thái đi theo bài mới) + HT (ngưỡng) | CẦN XÁC NHẬN |
| MI-E01 | E | Học viên | Giống MI-C01 nhưng chỉ có 2 bài sau đó | X chưa "Đã khắc phục" (❓ như MI-C01) | HT | CẦN XÁC NHẬN |
| MI-E02 | E | Học viên | Có 3 bài không lặp X, nhưng 1 trong 3 bài có xem bài mẫu (seed `sample_viewed = true`) | ❓ X chưa "Đã khắc phục" (bài có xem mẫu không tính là bài độc lập)? PRD không định nghĩa "độc lập" | — | CẦN XÁC NHẬN |
| MI-H01 | H | Học viên | Mở `/mistakes` | Bộ lọc mặc định là "Cần khắc phục" | HT | CẦN XÁC NHẬN |
| MI-E03 | E | Học viên | Seed một annotation Writing có `mistake_pattern_id = null` | Annotation hiện trên trang xem bài, nhưng không vào Sổ lỗi | PRD: mistake-patterns.md#Trạng thái UI | CẦN XÁC NHẬN |
| MI-H02 | H | Học viên | Chưa có lỗi nào được gắn mẫu | Sổ lỗi hiện trạng thái trống | PRD: mistake-patterns.md#Trạng thái UI | CẦN XÁC NHẬN |
| MI-H03 | H | Học viên | Có một mẫu lỗi có bằng chứng, mở trang chi tiết | Có phần "Vì sao" và "Cách khắc phục"; bằng chứng (câu trích) trỏ về đúng bài làm | PRD: mistake-patterns.md#User stories, mistake-patterns.md#Mục tiêu & chỉ số thành công | CẦN XÁC NHẬN |

## PL — Lộ trình học

Các quy tắc sinh lộ trình nên kiểm bằng Vitest (xem cuối file). E2E chỉ kiểm tra luồng giao diện.

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| PL-H01 | H | Học viên (chưa có điểm cả đề) | Đặt mục tiêu: Speaking 150, Writing 150, thi sau 8 tuần, học 5 ngày/tuần, mỗi buổi 45 phút | Lộ trình được tạo ngay. Tuần 1 có buổi thi thử cho mỗi kỹ năng | PRD: study-plan.md#Trong phạm vi, study-plan.md#Mục tiêu & chỉ số thành công | CẦN XÁC NHẬN |
| PL-E01 | E | Học viên | Ngày thi là hôm nay | Không lưu được, có báo lỗi | PRD: study-plan.md#Trong phạm vi (ngày thi phải sau hôm nay) | CẦN XÁC NHẬN |
| PL-E02 | E | Học viên | Ngày thi là ngày mai | Lộ trình chỉ có task ở hôm nay, không có task nào từ ngày thi trở đi. ❓ Lộ trình 1 ngày thì gồm những task nào? | PRD: study-plan.md#Trong phạm vi (từ hôm nay đến hết ngày trước ngày thi) | CẦN XÁC NHẬN |
| PL-E03 | E | Học viên | Ngày thi sau 6 tháng | Lộ trình dài tối đa 12 tuần (`oracle: business.schedule.maxWeeks`) | PRD: study-plan.md#Trong phạm vi | CẦN XÁC NHẬN |
| PL-E04 | E | Học viên | Mở ô điểm mục tiêu | Chọn được 0–200 theo bước 10 và "để trống"; không có giá trị nào khác (vd. 205, 155) | PRD: study-plan.md#Trong phạm vi, study-plan.md#Giả định & câu hỏi mở | CẦN XÁC NHẬN |
| PL-C01 | C | Học viên | Bấm "Tạo lại lộ trình" và xác nhận | Có hộp thoại xác nhận. Lộ trình mới thay lộ trình cũ. Task đã làm vẫn còn trong lịch sử | PRD: study-plan.md#Trong phạm vi | CẦN XÁC NHẬN |
| PL-C02 | C | Học viên | Có task thi thử Writing; nộp xong Part 1 | ❓ PRD ghi task được đánh dấu xong ngay khi nộp Part đầu là **giới hạn chấp nhận**, còn `known-bugs.md` coi đây là BUG-04. Bên nào đúng? Nếu là bug: task CHƯA xong cho tới khi nộp đủ 3 Part, dùng `test.fail(true, 'BUG-04: …')` | PRD: study-plan.md#Giả định & câu hỏi mở (mâu thuẫn) | CẦN XÁC NHẬN |
| PL-H02 | H | Học viên | Task ôn lỗi: bấm "Đánh dấu xong" | Task chuyển sang trạng thái xong. ❓ Tiến độ tuần tăng? | PRD: study-plan.md#Trong phạm vi + HT | CẦN XÁC NHẬN |
| PL-E05 | E | Học viên | Mở form "Mục tiêu & Lịch thi" lần đầu | Số ngày học/tuần chọn được 3–7, mặc định 5; thời lượng/buổi 30/45/60, mặc định 45 (`oracle: business.schedule`) | PRD: study-plan.md#Trong phạm vi | CẦN XÁC NHẬN |
| PL-X01 | X | Học viên | Lưu form khi request tạo lộ trình lỗi (chặn RPC `create_study_plan`) | Báo lỗi trong hộp thoại, giữ nguyên dữ liệu đã nhập, lộ trình cũ không đổi | PRD: study-plan.md#Trạng thái UI | CẦN XÁC NHẬN |
| PL-H03 | H | Học viên | Có task thi thử Speaking gắn một đề; làm và nộp đề đó | Task tự chuyển sang xong | PRD: study-plan.md#Trong phạm vi (Tự đánh dấu xong) | CẦN XÁC NHẬN |
| PL-H04 | H | Học viên | Không còn đề `published` nào, rồi lưu mục tiêu | Lộ trình vẫn được tạo; task hiện "Chọn đề" | PRD: study-plan.md#Trạng thái UI | CẦN XÁC NHẬN |
| PL-E06 | E | Học viên | Để trống cả hai điểm mục tiêu rồi lưu | ❓ Code đang chặn ("Đặt mục tiêu cho ít nhất một kỹ năng"). PRD chỉ nói được để trống từng kỹ năng. Đây có phải ý đồ sản phẩm? | PRD: study-plan.md#Giả định & câu hỏi mở | CẦN XÁC NHẬN |
| PL-C03 | C | Học viên | Đã có lộ trình; mở form mục tiêu, đổi điểm và lưu | Form có cảnh báo trước khi lưu; lưu xong thì lộ trình được sinh lại theo mục tiêu mới | PRD: study-plan.md#Giả định & câu hỏi mở (Đổi khi làm) | CẦN XÁC NHẬN |

## AD — Quản trị đề

E2E để trống env R2, nên route tạo đề và thay ảnh trả lỗi ngay. Case cần lưu ảnh thật đánh dấu ⚠ (xem đề xuất `R2_ENDPOINT` trong báo cáo).

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| AD-H01 | H | Admin | ⚠ Tạo đề Speaking đủ dữ liệu rồi lưu | Đề có trạng thái Nháp trong kho đề, có nút xem trước, và không xuất hiện ở `/speaking` | PRD: exam-builder.md#Mục tiêu & chỉ số thành công | CẦN XÁC NHẬN |
| AD-C01 | C | Admin | Seed đề `review` thiếu ảnh ở câu 4 (Part 2), bấm phát hành | Bị chặn; hộp thoại liệt kê đúng câu đang thiếu (dạng "Câu 4: thiếu …") | PRD: exam-edit.md#Trong phạm vi, exam-edit.md#Trạng thái UI | CẦN XÁC NHẬN |
| AD-C02 | C | Admin | Trả đề về Nháp mà không nhập lý do | Không cho xác nhận. Khi có lý do thì lý do hiện ngay dưới tên đề | PRD: exam-edit.md#Trong phạm vi | CẦN XÁC NHẬN |
| AD-C03 | C | Admin | Sửa một đề đã có lượt làm | Chỉ sửa được thông tin chung; phần các Part bị khoá kèm lời giải thích | PRD: exam-edit.md#Trong phạm vi | CẦN XÁC NHẬN |
| AD-E01 | E | Admin | Chọn ảnh ở form tạo đề: PNG đúng 10 MB, PNG 10 MB + 1 byte, và file GIF. Chặn request lưu, chỉ kiểm phần nén ở trình duyệt | PNG 10 MB được nhận; file trong form data gửi đi là WebP ≤ 1,5 MB, cạnh dài ≤ 1600px. PNG 10 MB + 1 byte bị từ chối. ❓ GIF bị từ chối? (PRD không nói loại file) (`oracle: business.upload`). Không kiểm việc lưu thật lên R2 | PRD: writing-exam-builder.md#Thiết kế kỹ thuật (Nén ảnh) | CẦN XÁC NHẬN |
| AD-E02 | E | Admin | Writing câu 1: nhập 1 từ khoá, rồi 3 từ khoá | Cả hai đều báo lỗi (phải đúng 2 từ khoá) | ETS + PRD: writing-exam-builder.md#Trong phạm vi | CẦN XÁC NHẬN |
| AD-X01 | X | Admin | Lưu đề khi R2 không khả dụng (E2E để trống env R2) | Báo lỗi phía trên form, giữ nguyên dữ liệu đã nhập, không có đề ghi dở trong DB | PRD: writing-exam-builder.md#Trạng thái UI, writing-exam-builder.md#Mục tiêu & chỉ số thành công | CẦN XÁC NHẬN |
| AD-H02 | H | Admin | Xoá một đề chưa có lượt làm | Đề biến mất khỏi kho đề. ❓ Có hỏi xác nhận trước khi xoá không? | HT | CẦN XÁC NHẬN |
| AD-C04 | C | Admin | Đề đang Nháp: tìm thao tác phát hành; gọi thẳng `POST /api/exams/<id>/status` `{status:'published'}` | Menu không có "Phát hành" cho đề Nháp; API từ chối và trạng thái vẫn là Nháp | PRD: exam-edit.md#Trong phạm vi (không nhảy thẳng Nháp → Đang khả dụng) | CẦN XÁC NHẬN |
| AD-E03 | E | Admin | Đề bị trả về nháp có lý do; gửi thẩm định lại | Lý do cũ không còn hiện dưới tên đề | PRD: exam-edit.md#Trong phạm vi | CẦN XÁC NHẬN |
| AD-E04 | E | Admin | Mở `/setting/exam-management/<id không tồn tại>/edit` | Hiện "Không tìm thấy đề" kèm link về kho đề | PRD: exam-edit.md#Trạng thái UI | CẦN XÁC NHẬN |
| AD-C05 | C | Admin | Trả một đề Đang khả dụng (đã có lượt làm) về nháp | Hộp thoại cảnh báo số lượt làm bị ảnh hưởng | PRD: exam-edit.md#Giả định & câu hỏi mở | CẦN XÁC NHẬN |
| AD-E05 | E | Admin | Writing câu 1: mô tả ảnh 1.000 ký tự, rồi 1.001 ký tự | 1.000 hợp lệ; 1.001 báo lỗi dưới ô | PRD: writing-exam-builder.md#Trong phạm vi | CẦN XÁC NHẬN |
| AD-E06 | E | Admin | Writing câu 6: bỏ trống email | Báo lỗi, không lưu được | PRD: writing-exam-builder.md#Trong phạm vi, writing-exam-builder.md#Kiểm thử | CẦN XÁC NHẬN |
| AD-H03 | H | Admin | Kho đề: bấm "Tạo đề Writing" | Mở `/setting/exam-management/new?skill=writing`, form có đủ 8 câu rỗng theo 3 Part | PRD: writing-exam-builder.md#Thiết kế kỹ thuật, writing-exam-builder.md#Trạng thái UI | CẦN XÁC NHẬN |
| AD-E07 | E | Admin | Bấm lưu khi Part 2 có 2 ô lỗi, Part 4 có 1 ô lỗi | Lỗi hiện dưới từng ô; badge của Part 2 là 2, Part 4 là 1 | PRD: exam-builder.md#Trạng thái UI | CẦN XÁC NHẬN |
| AD-E08 | E | Admin | Xoá đề đã có lượt làm | ❓ Code đang chặn xoá (409). Đây có phải ý đồ sản phẩm, và UI phải báo gì? | — | CẦN XÁC NHẬN |

## DV — Kiểm tra thiết bị

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| DV-H01 | H | Khách | Đi hết 5 bước với mic giả | Bước 5 báo sẵn sàng cho cả Speaking và Writing | HT | CẦN XÁC NHẬN |
| DV-X01 | X | Khách | Mic trả về lỗi `NotAllowedError` | Thông báo cụ thể là quyền mic đang bị chặn | HT | CẦN XÁC NHẬN |
| DV-X02 | X | Khách | Mic trả về lỗi `NotFoundError` | Thông báo không tìm thấy mic | HT | CẦN XÁC NHẬN |
| DV-X03 | X | Khách | Mic trả về lỗi `NotReadableError` | Thông báo mic đang bị ứng dụng khác dùng | HT | CẦN XÁC NHẬN |

## LD — Landing

| ID | Loại | Vai trò | Tình huống | Kết quả mong đợi | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| LD-E01 | E | Khách | FAQ: mở câu 1, sau đó mở câu 2 | Chỉ câu 2 đang mở | HT | CẦN XÁC NHẬN |
| LD-H01 | H | Khách | Bấm nút "Thi thử" ở hero | ❓ Chuyển tới trang nào? | — | CẦN XÁC NHẬN |
| LD-C01 | C | Khách | Đọc câu FAQ về cách đăng nhập | ❓ BUG-01: FAQ nói đăng nhập bằng OTP, thực tế dùng mật khẩu. Bên nào đúng? Sửa FAQ hay sửa luồng đăng nhập? | — | CẦN XÁC NHẬN |

---

## Kiểm ở tầng khác, KHÔNG viết E2E

| Quy tắc | Tầng nên test | Lý do |
|---|---|---|
| Hạn mức chấm 33/55 câu mỗi ngày, reset theo giờ VN, hoàn lượt khi chấm lỗi, dùng chung Speaking/Writing (PRD: scoring.md#Thiết kế kỹ thuật, writing-scoring.md#Thiết kế kỹ thuật) | API test: gọi Route Handler với AI giả | E2E phải chấm thật 34 câu: chậm và tốn quota thật |
| Quy đổi điểm thô → 0–200 và → Level | Vitest, dùng bảng trong `tests/oracle/levels.json` | Logic thuần. Test phải đọc từ oracle, **không** import hằng số từ `lib/domain/score-levels.ts` |
| Sinh lộ trình (`generate-plan.ts`): 12 tuần, chia kỹ năng, tuần cuối… (PRD: study-plan.md#Kiểm thử) | Vitest | Hàm thuần, có nhiều tổ hợp đầu vào |
| Câu Speaking im lặng được 0 điểm, nhận xét "Chưa ghi nhận câu trả lời"; câu Writing bỏ trống 0 điểm "Chưa có câu trả lời", không trừ lượt (PRD: scoring.md#Trạng thái UI, writing-scoring.md#Thiết kế kỹ thuật) | API test với AI giả | Logic phía server, E2E mock route thì không chạm tới |
| Server không tin text đề do client gửi; route chấm: attempt người khác hoặc sai trạng thái → 404/409, đề chưa `published` → 404, audio quá lớn / bài quá dài → 400, vượt hạn mức → 429, chấm trùng song song chỉ một lượt chạy (PRD: scoring.md#Kiểm thử, writing-scoring.md#Kiểm thử) | API test với AI giả | Đây là logic phía server |
| Speaking Part 1 đọc sai đoạn văn vẫn có điểm (**BUG-02**) | API test với Azure giả | Cần điều khiển kết quả Pronunciation Assessment |
| Vị trí annotation, parse `pattern` của mẫu lỗi (PRD: writing-scoring.md#Kiểm thử, mistake-patterns.md#Kiểm thử) | Vitest | Hàm thuần |
| RLS; cột điểm chỉ `service_role` ghi được; đề `draft` không đọc được bởi người học | pgTAP (đã có) | Lọc `published` của thư viện nằm ở RLS, nên không có mutation E2E cho LB-C01 |
| OTP hết hạn sau 10 phút | Kiểm tra cấu hình Supabase bằng tay | Không điều khiển được đồng hồ của Supabase |
| Không lưu audio | Review code, cộng API test kiểm tra không có lệnh ghi Storage (E2E chỉ kiểm phía trình duyệt: SP-S03) | — |

## Ngoài phạm vi (chưa có chức năng nên chưa viết test)

Nút "Dời bài hôm nay sang Thứ 7", nút "Bổ sung đề tự chọn", phần AI insight của lộ trình, nút vào mode `timed`, nghe lại bản ghi trước khi nộp, annotations cho Speaking. Khi có spec cho các phần này thì thêm case mới.
