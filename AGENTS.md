<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Rules & Skills Context

Dưới đây là các quy tắc bắt buộc phải tuân theo. Áp dụng cho Codex, Antigravity và mọi AI agent làm việc trong dự án frontend này.

---

## 1. Quy tắc phản hồi

### Câu xác nhận đầu phản hồi (BẮT BUỘC)

- **Mọi phản hồi** phải bắt đầu bằng đúng một dòng: `✅ Đã áp dụng rules.`
- Dòng này đứng đầu tiên, trước mọi nội dung khác, không thay đổi chữ, không bỏ qua trong bất kỳ trường hợp nào (kể cả câu trả lời rất ngắn hoặc chỉ gọi tool).
- Đây là ngoại lệ duy nhất của quy tắc "không câu dẫn dắt" bên dưới. Sau dòng này, vào thẳng nội dung.

### Tối ưu hóa độ dài (Tiết kiệm Quota)

- **Khi sửa code hoặc fix bug:** Chỉ giải thích nguyên nhân và cách khắc phục một cách ngắn gọn nhất. **TUYỆT ĐỐI KHÔNG** viết code minh họa.
- **Khi giải thích vấn đề:** Đi thẳng vào trọng tâm, trình bày ngắn gọn, súc tích. **KHÔNG** đưa ra các ví dụ minh họa.

### Ngôn ngữ sử dụng

- Luôn trả lời bằng tiếng Việt, kể cả khi tôi hỏi bằng tiếng Anh.
- Chỉ dùng tiếng Anh cho thuật ngữ chuyên ngành hoặc đoạn code (khi thực sự cần output code).

### Tối ưu hóa Token mở rộng

- **Không từ ngữ dư thừa:** Bỏ qua mọi câu chào hỏi, cảm ơn, xin lỗi, câu dẫn dắt (trừ câu xác nhận bắt buộc ở trên).
- **Không lặp lại context:** Không in lại câu hỏi hay đoạn code lỗi của tôi. Chỉ ghi rõ tên hàm/dòng lỗi và cách khắc phục.

---

## 2. Codebase Access Strategy

- **Minimal Context:** Chỉ đọc các file được chỉ định trực tiếp hoặc các file liên quan mật thiết (imports/exports) đến module đang sửa.
- **Ignore Unrelated:** Tuyệt đối không tự ý quét toàn bộ codebase hoặc đọc folder không liên quan đến tác vụ (ví dụ: không đọc `assets`, `docs` khi đang sửa logic API).
- **Targeted Scope:** Khi sửa một Component cụ thể, chỉ tập trung vào file đó cùng file types hoặc hooks đi kèm.
- **Verification:** Trước khi đọc file mới, xác nhận file đó thực sự cần thiết cho bug/tính năng hiện tại.

---

## 3. UI Stack bắt buộc

Khi tạo hoặc sửa giao diện, **chỉ** dùng các công cụ sau:

| Mục đích      | Công cụ      |
| ------------- | ------------ |
| Styling       | Tailwind CSS |
| UI components | shadcn/ui    |
| Icons         | react-icons  |

### Tailwind CSS

- Chỉ style bằng utility class của Tailwind. **KHÔNG** viết CSS thuần, CSS module, styled-components hay inline `style` (trừ giá trị động không thể biểu diễn bằng class).
- Dùng design token của shadcn (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`...) thay vì hard-code màu (`bg-[#fff]`, `text-gray-500`).
- Hạn chế arbitrary value (`w-[137px]`); ưu tiên thang spacing/size có sẵn.
- Responsive theo hướng mobile-first (`sm:`, `md:`, `lg:`). Hỗ trợ dark mode qua token, không dùng `dark:` lặp lại khi token đã xử lý.
- Gộp class có điều kiện bằng helper `cn()` (`@/lib/utils`). Không nối chuỗi class thủ công.
- Giữ thứ tự class nhất quán (layout → spacing → typography → color → state). Dùng `prettier-plugin-tailwindcss` nếu đã cài.

### shadcn/ui

- **Ưu tiên component shadcn có sẵn** (Button, Input, Dialog, Card, Select, Table, Form, Tabs, Sheet, Dropdown Menu, Toast/Sonner...) trước khi tự viết component mới.
- Thêm component bằng CLI: `npx shadcn@latest add <component>`. **KHÔNG** copy/viết tay lại component shadcn.
- Component shadcn nằm ở `components/ui/`. **Không sửa trực tiếp** trừ khi bắt buộc; ưu tiên tùy biến qua `className`, `variant` (cva) hoặc bọc lại ở component riêng.
- Form dùng `Form` của shadcn kết hợp `react-hook-form` + `zod`.
- Giữ nguyên các thuộc tính accessibility mà Radix/shadcn cung cấp (aria, focus, keyboard).

### react-icons

- Chỉ dùng `react-icons` cho mọi icon. **KHÔNG** dùng emoji, SVG tự chèn, hay thư viện icon khác (lucide-react, heroicons...).
- Import theo từng bộ, đúng đường dẫn con: `react-icons/fi`, `react-icons/lu`, `react-icons/md`...
- Chỉ import đúng icon cần dùng. **KHÔNG** `import *`.
- Trong cùng một dự án, ưu tiên **một bộ icon chủ đạo** để giao diện đồng nhất (mặc định: `react-icons/lu`; đổi sang bộ khác chỉ khi bộ chính không có icon cần thiết).
- Chỉnh kích thước/màu bằng class Tailwind (`size-4`, `text-muted-foreground`), không dùng prop `size`/`color`.
- Icon thuần trang trí thêm `aria-hidden="true"`. Nút chỉ có icon phải có `aria-label`.

---

## 4. Quy tắc code frontend

- Dùng function component + hooks, TypeScript, khai báo type rõ ràng cho props.
- Mỗi component một trách nhiệm; tách component khi file quá dài hoặc lặp lại UI.
- Đặt tên component PascalCase, file theo quy ước hiện có của dự án.
- Dùng import alias `@/` thay cho đường dẫn tương đối dài.
- Luôn xử lý đủ trạng thái UI: loading, empty, error.
- Đảm bảo giao diện responsive và hỗ trợ bàn phím/screen reader.
- **KHÔNG** tự cài thêm thư viện UI/CSS/icon ngoài stack ở mục 3 khi chưa được tôi cho phép.
