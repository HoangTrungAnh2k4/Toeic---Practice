# Bug đã biết

> Chỉ người được sửa file này.
> Một test chỉ được dùng `test.fail(true, 'BUG-xx: …')` khi `BUG-xx` có trong bảng dưới đây (script integrity sẽ kiểm tra).
> Test đó vẫn assert hành vi **ĐÚNG**. Khi bug được sửa, Playwright báo "expected to fail but passed". Lúc đó xoá `test.fail` và chuyển bug sang "Đã sửa".

| ID | Mô tả | Case liên quan | Mã backlog | Trạng thái |
|---|---|---|---|---|
| BUG-01 | FAQ ở landing ghi "đăng nhập bằng OTP", trong khi thực tế đăng nhập email dùng mật khẩu | LD-C01 | — | Mở |
| BUG-02 | Speaking Part 1 đọc sai đoạn văn vẫn được điểm | (API test) | E4-7 | Mở |
| BUG-03 | Xem trước đề Writing nháp vẫn tạo lượt làm thật cho admin | WR-C04 | E5-11 | Mở |
| BUG-04 | Task thi thử Writing trong lộ trình được đánh dấu xong ngay khi mới nộp Part 1 | PL-C02 | — | Mở |

## Bug do agent phát hiện

Agent không ghi vào file này. Agent ghi vào `reports/suspected-bugs.md`. Bạn xem xét từng mục, rồi mới chuyển những bug thật vào bảng trên.
