# Câu hỏi cho chủ sản phẩm

Gom từ các ô ❓ trong `specs/e2e/test-cases.md` (2026-10-21). Trả lời ngắn (có/không, hoặc một giá trị), rồi ghi câu trả lời vào đúng ô trong `test-cases.md`, xoá ❓ và tự đổi trạng thái sang `Đã duyệt`.

"Code đang làm X" chỉ là hiện trạng để bạn dễ trả lời, **không phải đáp án**.

## AU — Xác thực

Chưa có PRD cho xác thực.

1. **AU-E01, AU-E03**: Mật khẩu tối thiểu 8 ký tự? (có/không, hoặc số khác)
2. **AU-E02**: Mật khẩu bắt buộc có cả chữ và số? (có/không)
3. **AU-E04**: Mật khẩu có khoảng trắng hoặc chữ có dấu (`mật khẩu1`) là hợp lệ? (có/không)
4. **AU-H02**: Đăng nhập xong vào trang nào? (code đang vào `/overview`)
5. **AU-E06**: OTP 5 số hoặc có chữ: nút xác nhận bị khoá, hay báo lỗi khi bấm? (khoá/báo lỗi)
6. **AU-S02**: Khách mở `/setting/exam-management`: chuyển về `/login`, hay trang 403? (code đang chuyển về `/login`; PRD nói "người không phải admin thấy trang 403")
7. **AU-S04**: Học viên gọi `POST /api/exams`: bắt buộc trả 401/403? (có/không). Code đang trả 400 khi body sai và 500 khi chưa cấu hình R2, trước khi tới RLS.
8. **AU-S05**: Đăng ký bằng email đã có tài khoản được phép báo "Email này đã được đăng ký"? (có = chấp nhận lộ email vì UX / không = phải hiển thị giống email mới, như quên mật khẩu)
9. **AU-E07**: Họ tên tối đa 50 ký tự? (có/không, hoặc số khác)
10. **AU-E08**: Bắt buộc tích đồng ý điều khoản mới được đăng ký? (có/không)
11. **AU-X02**: Đăng nhập khi chưa nhập OTP thì tự gửi lại mã và chuyển sang `/verify-email`? (có/không)
12. **AU-E09**: Chặn đặt lại mật khẩu trùng mật khẩu cũ? (có/không)
13. **AU-S07**: Học viên gọi API đổi trạng thái/xoá đề: mã HTTP mong đợi? (403 / 404 / chỉ cần DB không đổi)

## GU — Chế độ khách

14. **GU-C01**: Dữ liệu khách KHÔNG chuyển sang tài khoản khi đăng nhập là chủ ý? (chủ ý/hạn chế tạm thời)
15. **GU-E01**: Đóng banner nhắc dữ liệu khách rồi tải lại trang: banner vẫn ẩn? (ẩn/hiện lại)

## LB — Thư viện đề

16. **LB-E01**: 6 đề mỗi trang? (có/không, hoặc số khác)
17. **LB-X01**: Đánh dấu đề bị lỗi mạng: biểu tượng quay về trạng thái cũ và có báo lỗi? (có/không)
18. **LB-E04**: Tham số lọc lạ trên URL thì bỏ qua và dùng mặc định? (có/không)

## SP — Phòng thi Speaking

19. **SP-X02**: Khi nộp, câu chấm lỗi được tự thử lại mấy lần? (PRD: "thử lại khi nộp", không nói số lần)
20. **SP-E01**: `mode` lạ hoặc không có thì dùng `cbt`? (có/không)
21. **SP-E02**: `id` đề không tồn tại: trang 404 chung là đủ? (có/không, hoặc nội dung thông báo)

## WR — Phòng thi Writing

22. **WR-X01**: Mất mạng khi autosave có hiện cảnh báo "chưa lưu lên máy chủ"? (có/không)
23. **WR-C02**: Cảnh báo thời gian ở mốc 60s? (có/không, hoặc số giây khác)
24. **WR-C03**: Part 1 hết 8 phút: tự nộp, hay chỉ khoá ô soạn thảo? (tự nộp/khoá). Code đang khoá.
25. **WR-E01**: Mỗi trường hợp sau có tính là đã dùng từ khoá `go` không? (có/không cho từng dòng)
    - `went` (bất quy tắc)
    - `Go` (viết hoa)
    - `go,` (dính dấu câu)
26. **WR-E02**: Số từ đúng của từng chuỗi (một số cho mỗi dòng):
    - `Hello,  world!`
    - `e-mail`
    - chuỗi rỗng
    - chỉ có khoảng trắng
27. **WR-E04**: Câu 8 với 299 từ và 300 từ hiển thị khác nhau thế nào? (một câu mô tả)
28. **WR-C04**: Admin xem trước đề Writing nháp KHÔNG được tạo lượt làm thật? (có = BUG-03 là bug thật / không)

## SC — Điểm và Level

29. **SC-E01**: Trang xem bài tự tải lại mỗi 4s và dừng sau 2 phút? (có/không, hoặc giá trị khác)

## HI — Lịch sử

30. **HI-E02**: Ranh giới "Tháng này" tính theo giờ VN? (có/không)
31. **HI-E03**: Đề bị trả về nháp thì lượt làm cũ vẫn phải hiện trong Lịch sử? (có/không). PRD exam-edit ghi việc lượt làm biến mất là rủi ro.
32. **HI-E04**: `size` lạ trên URL thì dùng 10 dòng/trang? (có/không)

## MI — Sổ lỗi

33. **MI-C01, MI-E01**: Cần 3 bài độc lập liên tiếp không lặp lại để thành "Đã khắc phục"? (có/không, hoặc số khác)
34. **MI-E02**: Bài có xem bài mẫu (`sample_viewed`) KHÔNG tính là bài độc lập? (có/không)

## PL — Lộ trình học

35. **PL-E02**: Ngày thi là ngày mai: lộ trình 1 ngày gồm những task nào? (một câu)
36. **PL-C02**: Task thi thử Writing xong ngay khi nộp Part 1: PRD gọi là giới hạn chấp nhận, `known-bugs.md` gọi là BUG-04. Bên nào đúng? (PRD/bug)
37. **PL-H02**: Bấm "Đánh dấu xong" task ôn lỗi thì tiến độ tuần tăng? (có/không)
38. **PL-E06**: Chặn lưu khi để trống cả hai điểm mục tiêu? (có/không)

## AD — Quản trị đề

39. **AD-E01**: File GIF bị từ chối khi tải ảnh đề? (có/không). PRD không nói loại file; code nhận JPEG/PNG/WebP.
40. **AD-H02**: Có hỏi xác nhận trước khi xoá đề? (có/không)
41. **AD-E08**: Chặn xoá đề đã có lượt làm? (có/không, và UI báo gì). Code đang trả 409.

## LD — Landing

42. **LD-H01**: Nút "Thi thử" ở hero chuyển tới trang nào? (đường dẫn)
43. **LD-C01**: FAQ nói đăng nhập bằng OTP, thực tế dùng mật khẩu. Sửa FAQ hay sửa luồng đăng nhập? (FAQ/luồng)

## Oracle (`tests/oracle/*.json`)

44. `business-rules.json`: bản nháp lấy từ code. Mỗi giá trị đã khớp ý đồ sản phẩm chưa? Đặc biệt `quota`, `library.pageSize`, `history.polling`, `mistakes`, `upload`, `writing.timerWarningSec`, `writing.minWordsQ8`, `writing.wordHintQ1to5`. Điền `_verifiedBy` / `_verifiedAt` khi xong.
45. `ets-format.json`, `levels.json`: đã đối chiếu với tài liệu ETS chính thức chưa? Điền `_verifiedBy` / `_verifiedAt` khi xong.
