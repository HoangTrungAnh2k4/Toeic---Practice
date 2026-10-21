#!/usr/bin/env node
/**
 * Bơm bug có chủ đích để chứng minh test "có răng".
 * Với mỗi mục trong specs/e2e/mutations.json:
 *   1. Chạy cmd trên code GỐC → phải xanh (baseline). Nếu đỏ thì bỏ qua, vì kết quả sẽ không có nghĩa.
 *   2. Thay find → replace, chạy lại cmd → phải ĐỎ (bug bị bắt).
 *   3. Luôn trả file về nguyên trạng.
 * Chạy từ front-end:  node scripts/mutate.mjs [--check] [M01 M04 ...]
 *   --check  chỉ kiểm mỗi chuỗi find khớp đúng 1 lần, không chạy test, không sửa file.
 *
 * Lưu ý: script sửa file thật trong máy bạn. Hãy commit trước khi chạy.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const { mutations } = JSON.parse(readFileSync('specs/e2e/mutations.json', 'utf8'));
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const only = new Set(args.filter((a) => a !== '--check'));

/**
 * find/replace viết bằng LF. File CRLF (core.autocrlf=true) thì thử thêm bản CRLF.
 * Trả về cặp find/replace khớp được, cùng số lần khớp.
 */
function locate(text, find, replace) {
  const lf = (s) => String(s).replace(/\r\n/g, '\n');
  const variants = [[lf(find), lf(replace)]];
  if (text.includes('\r\n') && lf(find).includes('\n')) {
    variants.push([lf(find).replace(/\n/g, '\r\n'), lf(replace).replace(/\n/g, '\r\n')]);
  }
  const counted = variants.map(([f, r]) => ({ find: f, replace: r, count: text.split(f).length - 1 }));
  return counted.find((v) => v.count > 0) ?? counted[0];
}

const run = (cmd) => spawnSync(cmd, { shell: true, stdio: 'inherit' }).status === 0;

let survived = 0;
let invalid = 0;
let killed = 0;

for (const m of mutations) {
  if (only.size && !only.has(m.id)) continue;
  if (String(m.find).startsWith('TODO') || String(m.file).startsWith('TODO')) {
    console.log(`·  ${m.id}: bỏ qua (chưa điền file/find)`);
    continue;
  }
  if (!existsSync(m.file)) {
    console.error(`!  ${m.id}: không có file ${m.file}`);
    invalid++;
    continue;
  }
  const original = readFileSync(m.file, 'utf8');
  const { find, replace, count } = locate(original, m.find, m.replace);
  if (count !== 1) {
    console.error(`!  ${m.id}: chuỗi find xuất hiện ${count} lần trong ${m.file} (cần đúng 1)`);
    invalid++;
    continue;
  }
  if (checkOnly) {
    console.log(`✓  ${m.id}: find khớp đúng 1 lần trong ${m.file}`);
    continue;
  }

  console.log(`\n▶ ${m.id} baseline: ${m.cmd}`);
  if (!run(m.cmd)) {
    console.error(`!  ${m.id}: test đã đỏ ngay trên code gốc, nên kết quả bơm lỗi không có nghĩa`);
    invalid++;
    continue;
  }

  // Hàm thay thế: replace chứa `$` thì String.replace không hiểu nhầm thành $&, $1...
  writeFileSync(m.file, original.replace(find, () => replace));
  try {
    console.log(`▶ ${m.id} sau khi bơm lỗi vào ${m.file}`);
    if (run(m.cmd)) {
      console.error(`✗  ${m.id} SỐNG SÓT: test ${m.kills} vẫn xanh dù app đã sai. Test này không bắt được bug.`);
      survived++;
    } else {
      console.log(`✓  ${m.id} bị bắt bởi ${m.kills}`);
      killed++;
    }
  } finally {
    writeFileSync(m.file, original);
  }
}

console.log(`\nKết quả: ${killed} bị bắt, ${survived} sống sót, ${invalid} không hợp lệ.`);
process.exit(survived || invalid ? 1 : 0);
