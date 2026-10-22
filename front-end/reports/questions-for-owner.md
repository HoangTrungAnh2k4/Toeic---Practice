# Câu hỏi cho chủ sản phẩm

Gom từ các ô ❓ trong `specs/e2e/test-cases.md` (2026-10-21). Trả lời ngắn (có/không, hoặc một giá trị), rồi ghi câu trả lời vào đúng ô trong `test-cases.md`, xoá ❓ và tự đổi trạng thái sang `Đã duyệt`.

"Code đang làm X" chỉ là hiện trạng để bạn dễ trả lời, **không phải đáp án**.

## AU — Xác thực

Chưa có PRD cho xác thực.

1. **AU-E01, AU-E03**: Mật khẩu tối thiểu 8 ký tự? (có/không, hoặc số khác)
   Trả lời 1: có.
2. **AU-E02**: Mật khẩu bắt buộc có cả chữ và số? (có/không)
   Trả lời 2: không.
3. **AU-E04**: Mật khẩu có khoảng trắng hoặc chữ có dấu (`mật khẩu1`) là hợp lệ? (có/không)
   Trả lời 3: không được có khoảng trắng và dấu.
4. **AU-H02**: Đăng nhập xong vào trang nào? (code đang vào `/overview`)
   Trả lời 4: vào /overview.
5. **AU-E06**: OTP 5 số hoặc có chữ: nút xác nhận bị khoá, hay báo lỗi khi bấm? (khoá/báo lỗi)
   Trả lời 5: khóa nút bấm khi otp không đúng định dạng.
6. **AU-S02**: Khách mở `/setting/exam-management`: chuyển về `/login`, hay trang 403? (code
   đang chuyển về `/login`; PRD nói "người không phải admin thấy trang 403")
   Trả lời 6: trang 403.
7. **AU-S04**: Học viên gọi `POST /api/exams`: bắt buộc trả 401/403? (có/không). Code đang trả 400 khi body sai và 500 khi chưa cấu hình R2, trước khi tới RLS.
   Trả lời 7:có
8. **AU-S05**: Đăng ký bằng email đã có tài khoản được phép báo "Email này đã được đăng ký"? (có = chấp nhận lộ email vì UX / không = phải hiển thị giống email mới, như quên mật khẩu)
   Trả lời 8: có
9. **AU-E07**: Họ tên tối đa 50 ký tự? (có/không, hoặc số khác)
   Trả lời 9: tối đa 25 ký tự.
10. **AU-E08**: Bắt buộc tích đồng ý điều khoản mới được đăng ký? (có/không)
    Trả lời 10: có.
11. **AU-X02**: Đăng nhập khi chưa nhập OTP thì tự gửi lại mã và chuyển sang `/verify-email`? (có/không)
    Trả lời 11: có.
12. **AU-E09**: Chặn đặt lại mật khẩu trùng mật khẩu cũ? (có/không)
    Trả lời 12: không.
13. **AU-S07**: Học viên gọi API đổi trạng thái/xoá đề: mã HTTP mong đợi? (403 / 404 / chỉ cần DB không đổi)
    Trả lời 12: 403.

## GU — Chế độ khách

14. **GU-C01**: Dữ liệu khách KHÔNG chuyển sang tài khoản khi đăng nhập là chủ ý? (chủ ý/hạn chế tạm thời)
    Trả lời 14: chủ ý.
15. **GU-E01**: Đóng banner nhắc dữ liệu khách rồi tải lại trang: banner vẫn ẩn? (ẩn/hiện lại)
    Trả lời 15: ẩn.

## LB — Thư viện đề

16. **LB-E01**: 6 đề mỗi trang? (có/không, hoặc số khác)
    Trả lời 16: có.
17. **LB-X01**: Đánh dấu đề bị lỗi mạng: biểu tượng quay về trạng thái cũ và có báo lỗi? (có/không)
    Trả lời 17: có
18. **LB-E04**: Tham số lọc lạ trên URL thì bỏ qua và dùng mặc định? (có/không)
    Trả lời 18: có

## SP — Phòng thi Speaking

19. **SP-X02**: Khi nộp, câu chấm lỗi được tự thử lại mấy lần? (PRD: "thử lại khi nộp", không nói số lần)
    Trả lời 19: 2 lần.
20. **SP-E01**: `mode` lạ hoặc không có thì dùng `cbt`? (có/không)
    Trả lời 20: có.
21. **SP-E02**: `id` đề không tồn tại: trang 404 chung là đủ? (có/không, hoặc nội dung thông báo)
    Trả lời 21: có.

## WR — Phòng thi Writing

22. **WR-X01**: Mất mạng khi autosave có hiện cảnh báo "chưa lưu lên máy chủ"? (có/không)
    Trả lời 22: có
23. **WR-C02**: Cảnh báo thời gian ở mốc 60s? (có/không, hoặc số giây khác)
    Trả lời 23: có
24. **WR-C03**: Part 1 hết 8 phút: tự nộp, hay chỉ khoá ô soạn thảo? (tự nộp/khoá). Code đang khoá.
    Trả lời 24: tự nộp
25. **WR-E01**: Mỗi trường hợp sau có tính là đã dùng từ khoá `go` không? (có/không cho từng dòng) - `went` (bất quy tắc) - `Go` (viết hoa) - `go,` (dính dấu câu)
    Trả lời 25: đừng quan tâm "word" của user nhập, cứ đưa cho AI tự chấm.
26. **WR-E02**: Số từ đúng của từng chuỗi (một số cho mỗi dòng): - `Hello,  world!` - `e-mail` - chuỗi rỗng - chỉ có khoảng trắng
    Trả lời 26: tương ứng: 2,1,0,0
27. **WR-E04**: Câu 8 với 299 từ và 300 từ hiển thị khác nhau thế nào? (một câu mô tả)
    Trả lời 27: giống nhau.
28. **WR-C04**: Admin xem trước đề Writing nháp KHÔNG được tạo lượt làm thật? (có = BUG-03 là bug thật / không)
    Trả lời 28: có

## SC — Điểm và Level

29. **SC-E01**: Trang xem bài tự tải lại mỗi 4s và dừng sau 2 phút? (có/không, hoặc giá trị khác)
    Trả lời 29: tải lại mỗi 4s và dừng sau 3 phút.

## HI — Lịch sử

30. **HI-E02**: Ranh giới "Tháng này" tính theo giờ VN? (có/không)
    Trả lời 30: có
31. **HI-E03**: Đề bị trả về nháp thì lượt làm cũ vẫn phải hiện trong Lịch sử? (có/không). PRD exam-edit ghi việc lượt làm biến mất là rủi ro.
    Trả lời 31: trả về nháp thì xóa luôn lịch sử làm của đề đó.
32. **HI-E04**: `size` lạ trên URL thì dùng 10 dòng/trang? (có/không)
    Trả lời 32: có

## MI — Sổ lỗi

33. **MI-C01, MI-E01**: Cần 3 bài độc lập liên tiếp không lặp lại để thành "Đã khắc phục"? (có/không, hoặc số khác)
    Trả lời 33: có
34. **MI-E02**: Bài có xem bài mẫu (`sample_viewed`) KHÔNG tính là bài độc lập? (có/không)
    Trả lời 34: có

## PL — Lộ trình học

35. **PL-E02**: Ngày thi là ngày mai: lộ trình 1 ngày gồm những task nào? (một câu)
    Trả lời 35: Thi thử cả hai kỹ năng nếu học viên luyện cả hai.
36. **PL-C02**: Task thi thử Writing xong ngay khi nộp Part 1: PRD gọi là giới hạn chấp nhận, `known-bugs.md` gọi là BUG-04. Bên nào đúng? (PRD/bug)
    Trả lời 36: bug: task chỉ xong khi đã nộp đủ 3 Part. Test sẽ được đánh dấu “đang lỗi đã biết” cho tới khi code được sửa, và sau đó cần sửa code cùng PRD.
37. **PL-H02**: Bấm "Đánh dấu xong" task ôn lỗi thì tiến độ tuần tăng? (có/không)
    Trả lời 37: có
38. **PL-E06**: Chặn lưu khi để trống cả hai điểm mục tiêu? (có/không)
    Trả lời 38: có

## AD — Quản trị đề

39. **AD-E01**: File GIF bị từ chối khi tải ảnh đề? (có/không). PRD không nói loại file; code nhận JPEG/PNG/WebP.
    Trả lời 39: nhỉ nhận các định dạng của ảnh (jpg,jpeg,png,webp)
40. **AD-H02**: Có hỏi xác nhận trước khi xoá đề? (có/không)
    Trả lời 40: có
41. **AD-E08**: Chặn xoá đề đã có lượt làm? (có/không, và UI báo gì). Code đang trả 409.
    Trả lời 41: không chặn xóa đề đã có lượt làm, khi xóa thì show cảnh báo là được.

## LD — Landing

42. **LD-H01**: Nút "Thi thử" ở hero chuyển tới trang nào? (đường dẫn)
    Trả lời 42: xóa nút thi thử
43. **LD-C01**: FAQ nói đăng nhập bằng OTP, thực tế dùng mật khẩu. Sửa FAQ hay sửa luồng đăng nhập? (FAQ/luồng)
    Trả lời 43: sửa FAQ

## Oracle (`tests/oracle/*.json`)

44. `business-rules.json`: bản nháp lấy từ code. Mỗi giá trị đã khớp ý đồ sản phẩm chưa? Đặc biệt `quota`, `library.pageSize`, `history.polling`, `mistakes`, `upload`, `writing.timerWarningSec`, `writing.minWordsQ8`, `writing.wordHintQ1to5`. Điền `_verifiedBy` / `_verifiedAt` khi xong.
    Trả lời 44: chuẩn
45. `ets-format.json`, `levels.json`: đã đối chiếu với tài liệu ETS chính thức chưa? Điền `_verifiedBy` / `_verifiedAt` khi xong.
    Trả lời 45: chuẩn.
