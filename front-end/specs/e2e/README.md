# Toeco E2E: Playwright Agents không tautology, không reward hacking

## Ý tưởng trong 3 dòng

1. **Người viết đáp án** (`specs/e2e/test-cases.md` + `tests/oracle/*.json`). AI chỉ viết *cách kiểm tra*.
2. **Máy khoá luật chơi**: hook chặn agent sửa đáp án; ESLint và script integrity bắt mọi kiểu gian lận làm test xanh.
3. **Bơm lỗi để chứng minh test có tác dụng**: cố tình làm app sai, test phải đỏ.

## Mở Claude Code ở đâu

Làm việc với test thì **mở Claude Code ở `front-end/`**. Agent (`.claude/agents/playwright-test-*.md`) và `.mcp.json` nằm ở `front-end/`, mở ở root thì agent không được nạp.
Hook bảo vệ có ở cả `.claude/settings.json` của root lẫn của `front-end/`, nên mở ở đâu cũng bị chặn sửa đáp án.

## File nằm ở đâu

```
toeic-practice/
├── .claude/settings.json            ← hook (khi mở Claude Code ở root)
└── front-end/
    ├── .claude/settings.json        ← hook (khi mở Claude Code ở front-end)
    ├── .claude/agents/              ← do `pnpm exec playwright init-agents --loop=claude` sinh, cuối mỗi file có luật Toeco
    ├── .mcp.json                    ← server MCP playwright-test
    ├── playwright.config.ts
    ├── eslint.playwright.mjs        ← đã gộp vào eslint.config.mjs
    ├── .env.test.example
    ├── specs/e2e/
    │   ├── TESTING_RULES.md         ← luật cho agent và người
    │   ├── test-cases.md            ← ĐÁP ÁN: bạn duyệt từng dòng
    │   ├── known-bugs.md
    │   ├── mutations.json           ← danh sách bug sẽ bơm vào
    │   └── agent-addenda/           ← đoạn văn đã dán vào cuối 3 file agent
    ├── tests/
    │   ├── oracle/                  ← ĐÁP ÁN dạng dữ liệu (ETS, Level, quy tắc nghiệp vụ)
    │   ├── assets/                  ← tự thêm fake-speech-16k.wav
    │   └── e2e/                     ← fixtures.ts, auth.setup.ts, seed.spec.ts, và test do AI sinh
    ├── reports/                     ← câu hỏi cho chủ sản phẩm, bug nghi ngờ, case planner đề xuất
    └── scripts/
        ├── guard-oracle.mjs
        ├── check-test-integrity.mjs
        ├── mutate.mjs
        └── seed-e2e.mjs             ← dữ liệu seed là đầu vào của đáp án, cũng được bảo vệ
```

Chạy lại `pnpm exec playwright init-agents --loop=claude` sẽ ghi đè 3 file agent và `.mcp.json`. Khi đó phải dán lại `specs/e2e/agent-addenda/*.md` vào cuối 3 file agent.

## Môi trường local (chạy một lần)

1. Bật Docker Desktop. Trong `back-end/`: `pnpm start`, rồi `pnpm db:reset` nếu muốn DB sạch.
2. Trong `front-end/`: copy `.env.test.example` thành `.env.test`, điền `NEXT_PUBLIC_SUPABASE_ANON_KEY` và `SUPABASE_SERVICE_ROLE_KEY` lấy từ `pnpm status` (chạy trong `back-end/`). Các key Azure/Groq/Gemini/R2 **để trống**: `playwright.config.ts` dừng ngay nếu một key có giá trị.
3. `pnpm seed:e2e`: tạo 2 tài khoản test (student, admin), 3 đề Speaking ở trạng thái `draft` / `review` / `published`, 2 lượt Speaking đã chấm (120 và 130) của student. Chạy lại bao nhiêu lần cũng được: script xoá mọi lượt làm của 2 tài khoản test và các đề seed rồi tạo lại.
4. Ghi âm 5–10 giây giọng đọc tiếng Anh, lưu thành `tests/assets/fake-speech-16k.wav` (WAV PCM 16 kHz mono). Chrome dùng file này làm mic giả.
5. **Tắt `next dev` đang chạy trong `front-end/`** trước khi chạy E2E. Next 16 chỉ cho một dev server mỗi thư mục; config sẽ báo lỗi rõ thay vì treo. E2E tự chạy server riêng ở cổng 3100 với `.env.test`.

## Quy trình mỗi lần làm test

```
① Bạn duyệt test-cases.md: trả lời các ô ❓ (xem reports/questions-for-owner.md), đổi trạng thái sang "Đã duyệt"
② Planner (tuỳ chọn): đề xuất thêm case vào reports/proposed-cases.md
     → bạn đọc, chọn những case đáng giữ, tự chép vào test-cases.md
③ Generator: sinh test cho các case đã duyệt
④ pnpm test:e2e
     ├─ xanh → ⑥
     └─ đỏ  → Healer: chỉ sửa selector hoặc cách chờ
               └─ app sai đáp án → reports/suspected-bugs.md → bạn sửa APP (hoặc sửa spec nếu spec sai)
⑤ pnpm test:e2e:integrity:local   (phải sạch, chạy TRƯỚC KHI commit)
⑥ pnpm test:e2e:mutate            (mọi bug bơm vào phải bị bắt)
```

Câu lệnh mẫu trong Claude Code (mở ở `front-end/`):

> Dùng agent playwright-test-generator, sinh test cho các case Đã duyệt của module SP trong specs/e2e/test-cases.md.

### Làm trên `main`, không có PR

Repo một người và làm thẳng trên `main`, nên không có bước review PR. Lớp chặn cuối cùng là:

- `pnpm test:e2e:integrity:local` **trước mỗi commit**: so working tree (kể cả file chưa track) với `HEAD`. Bắt assertion bị sửa/xoá mà đáp án không đổi, `test.fail` mới, file được bảo vệ bị đổi.
- CI chạy lại integrity trên commit vừa push (xem dưới).

Khi chính bạn cố ý sửa assertion (ví dụ đáp án đổi theo quyết định sản phẩm mới), chạy với `ASSERTION_CHANGE_APPROVED=1` để script cho qua. Agent không được đặt biến này.

## Từng lớp chặn bắt được gì

| Gian lận | Lớp bắt |
|---|---|
| Lấy kết quả app đang chạy làm đáp án | Luật trong agent; planner phải tách cột "App đang làm gì"; chỉ test case "Đã duyệt" (integrity) |
| Import hằng số từ `lib/` để tính expected | ESLint `no-restricted-imports` + integrity |
| Sửa đáp án cho khớp app sai | Hook chặn `specs/e2e`, `tests/oracle`, `scripts/seed-e2e.mjs` |
| Sửa / xoá assertion | Integrity: diff có `expect` bị đổi mà đáp án không đổi → lỗi |
| skip / fixme / only / test.fail tuỳ tiện | ESLint + integrity (test.fail phải có BUG-ID trong known-bugs.md) |
| try/catch, if quanh expect, expect.soft | ESLint + integrity |
| Tăng timeout, thêm retries, force click | Integrity + `retries: 0` trong config |
| `eslint-disable`, `@ts-ignore` | `noInlineConfig` + integrity |
| Sửa chính bộ luật (config, script, agent) | Hook + integrity báo "file được bảo vệ đã đổi" |
| Test xanh nhưng không có tác dụng | `mutate.mjs` |
| Gọi AI / R2 thật, chạy nhầm Supabase production | `playwright.config.ts` dừng nếu URL không phải local hoặc có key dịch vụ ngoài |

**Giới hạn cần biết:** phần hook kiểm tra lệnh Bash là heuristic, agent có thể lách được. Không có PR review nên lớp chặn thật sự là integrity trước khi commit cộng với CI.

## CI (GitHub Actions, phần chính)

Push thẳng lên `main` thì so với commit trước lần push (`github.event.before`):

```yaml
- uses: actions/checkout@v4
  with: { fetch-depth: 0 }          # integrity cần lịch sử để so diff
- uses: pnpm/action-setup@v4
  with: { package_json_file: front-end/package.json }
- run: pnpm install --frozen-lockfile
  working-directory: front-end
- run: pnpm exec eslint tests/e2e && pnpm test:e2e:integrity
  working-directory: front-end
  env:
    INTEGRITY_BASE: ${{ github.event.before }}
```

## Không nhét mọi thứ vào E2E

Logic thuần như quy đổi Level, sinh lộ trình, đếm từ nên kiểm bằng Vitest. Cũng áp dụng cùng nguyên tắc: **test Vitest đọc expected từ `tests/oracle`, không import hằng số từ `lib/domain/score-levels.ts`.** Test nào so sánh code với chính hằng số trong code là test tautological.
