#!/usr/bin/env node
/**
 * Kiểm tra tính toàn vẹn của bộ E2E: chống reward hacking và tautological testing.
 * Chạy từ thư mục front-end:  node scripts/check-test-integrity.mjs [ref]
 *
 * Biến môi trường:
 *   INTEGRITY_BASE              ref để so diff khi không truyền [ref] (mặc định origin/main).
 *                               HEAD = so working tree với commit gần nhất (chạy trước khi commit).
 *   ASSERTION_CHANGE_APPROVED=1 người đã duyệt việc sửa assertion. Chỉ đặt trong CI, ví dụ khi PR có label.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const E2E_DIR = 'tests/e2e';
const CASES_FILE = 'specs/e2e/test-cases.md';
const BUGS_FILE = 'specs/e2e/known-bugs.md';
const APPROVED = 'Đã duyệt';
const MAX_TIMEOUT_MS = 15_000;
const ID_RE = /^([A-Z]{2}-[HECXS]\d{2})\b/;

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (msg) => warnings.push(msg);

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p.split(path.sep).join('/')];
  });
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

// ---------- 1. Đọc đáp án ----------
if (!existsSync(CASES_FILE)) {
  console.error(`Không tìm thấy ${CASES_FILE}. Hãy chạy script từ thư mục front-end.`);
  process.exit(1);
}
const caseStatus = new Map();
for (const line of readFileSync(CASES_FILE, 'utf8').split('\n')) {
  if (!line.trim().startsWith('|')) continue;
  const cells = line.split('|').map((s) => s.trim());
  const id = cells[1];
  if (!/^[A-Z]{2}-[HECXS]\d{2}$/.test(id ?? '')) continue;
  caseStatus.set(id, cells[cells.length - 2]);
}

const knownBugs = new Set();
if (existsSync(BUGS_FILE)) {
  for (const m of readFileSync(BUGS_FILE, 'utf8').matchAll(/^\|\s*(BUG-\d{2})\s*\|/gm)) {
    knownBugs.add(m[1]);
  }
}

// ---------- 2. Quét tĩnh các file test ----------
const allTs = walk(E2E_DIR).filter((f) => f.endsWith('.ts'));
const scanned = allTs.filter((f) => path.basename(f) !== 'fixtures.ts'); // fixtures.ts do người sở hữu
const specFiles = scanned.filter((f) => f.endsWith('.spec.ts') && path.basename(f) !== 'seed.spec.ts');

const BANNED = [
  [/\bwaitForTimeout\s*\(/g, 'waitForTimeout: hãy dùng page.clock hoặc web-first assertion'],
  [/\bforce\s*:\s*true/g, '{ force: true } bỏ qua kiểm tra tương tác được'],
  [/\bexpect\.soft\s*\(/g, 'expect.soft không làm test fail ngay'],
  [/eslint-disable/g, 'eslint-disable trong test'],
  [/@ts-(ignore|nocheck|expect-error)/g, 'tắt kiểm tra TypeScript'],
  [/\btry\s*\{/g, 'try/catch có thể nuốt lỗi assertion; đưa helper vào fixtures.ts'],
  [/\.catch\s*\(/g, '.catch() có thể nuốt lỗi; đưa helper vào fixtures.ts'],
  [/\bretries\s*:/g, 'retries che giấu test chập chờn'],
  [/\btest\.(skip|fixme|only)\s*\(/g, 'test.skip / fixme / only'],
  [/\bdescribe\.(skip|fixme|only)\b/g, 'describe.skip / fixme / only'],
  [/from\s+['"](@\/|(\.\.\/)+(app|lib|components|hooks|src)\/)/g, 'import code của app vào test (nguy cơ tautological)'],
];

const seenIds = new Map();

for (const file of scanned) {
  const src = readFileSync(file, 'utf8');

  for (const [re, msg] of BANNED) {
    for (const m of src.matchAll(re)) err(`${file}:${lineOf(src, m.index)}`, msg);
  }

  for (const m of src.matchAll(/\btimeout\s*:\s*([\d_]+)/g)) {
    const ms = Number(m[1].replace(/_/g, ''));
    if (ms > MAX_TIMEOUT_MS) err(`${file}:${lineOf(src, m.index)}`, `timeout ${ms}ms > ${MAX_TIMEOUT_MS}ms`);
  }
  for (const m of src.matchAll(/\btest\.setTimeout\s*\(/g)) {
    err(`${file}:${lineOf(src, m.index)}`, 'test.setTimeout: không được tự nới thời gian chờ');
  }

  // test.fail chỉ ở dạng gọi trong thân test: test.fail(true, 'BUG-xx: ...')
  for (const m of src.matchAll(/\btest\.fail\s*\(/g)) {
    const after = src.slice(m.index + m[0].length, m.index + m[0].length + 120);
    const ok = after.match(/^\s*true\s*,\s*(['"`])(BUG-\d{2})\b/);
    const where = `${file}:${lineOf(src, m.index)}`;
    if (!ok) err(where, "test.fail phải viết là test.fail(true, 'BUG-xx: mô tả') bên trong thân test");
    else if (!knownBugs.has(ok[2])) err(where, `${ok[2]} không có trong ${BUGS_FILE}`);
  }
}

// Tên test phải gắn với case đã duyệt
const TEST_CALL = /\btest(?:\.(only|skip|fixme|fail|slow))?\s*\(\s*(['"`])((?:\\.|(?!\2)[\s\S])*?)\2/g;
for (const file of specFiles) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(TEST_CALL)) {
    const where = `${file}:${lineOf(src, m.index)}`;
    if (m[1]) continue; // các modifier đã bị báo ở trên
    const title = m[3];
    const idm = title.match(ID_RE);
    if (!idm) {
      err(where, `tên test phải bắt đầu bằng ID case: "${title}"`);
      continue;
    }
    const id = idm[1];
    if (!caseStatus.has(id)) err(where, `${id} không có trong ${CASES_FILE}`);
    else if (caseStatus.get(id) !== APPROVED) err(where, `${id} chưa được duyệt (trạng thái: ${caseStatus.get(id)})`);
    if (seenIds.has(id)) warn(`${id} có nhiều hơn một test (${seenIds.get(id)} và ${where})`);
    else seenIds.set(id, where);
  }
}

// ---------- 3. So diff với nhánh gốc ----------
function git(args) {
  return execSync(`git ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

// Tham số dòng lệnh trước, vì đặt biến môi trường trong script npm không chạy được trên cmd của Windows
const baseRef = process.argv[2] ?? process.env.INTEGRITY_BASE ?? 'origin/main';
let base = '';
try {
  base = git(`merge-base ${baseRef} HEAD`).trim();
} catch {
  warn(`Không tìm được merge-base với ${baseRef}; bỏ qua phần kiểm tra diff. (Trong CI nhớ checkout với fetch-depth: 0)`);
}

if (base) {
  const changed = git(`diff --relative --name-only ${base}`).split('\n').filter(Boolean);
  const untracked = git('ls-files --others --exclude-standard').split('\n').filter(Boolean);
  const touched = [...new Set([...changed, ...untracked])];
  const oracleTouched = touched.some((f) => f.startsWith('specs/e2e/') || f.startsWith('tests/oracle/'));

  const PROTECTED = [
    /^specs\/e2e\//,
    /^tests\/oracle\//,
    /^tests\/e2e\/fixtures\.ts$/,
    /^scripts\/(guard-oracle|check-test-integrity|mutate|seed-e2e)\.mjs$/,
    /^eslint\.playwright\.mjs$/,
    /^playwright\.config\.ts$/,
  ];
  const protectedTouched = touched.filter((f) => PROTECTED.some((re) => re.test(f)));
  if (protectedTouched.length) {
    warn(`Có thay đổi ở file được bảo vệ, cần người review:\n    ${protectedTouched.join('\n    ')}`);
  }

  const diff = git(`diff --relative -U0 ${base} -- ${E2E_DIR}`);
  const lines = diff.split('\n');
  const removedExpect = lines.filter((l) => l.startsWith('-') && !l.startsWith('---') && /\bexpect\s*\(/.test(l));
  const addedExpect = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++') && /\bexpect\s*\(/.test(l));
  const addedFail = lines.filter((l) => l.startsWith('+') && /\btest\.fail\s*\(/.test(l));

  const approved = process.env.ASSERTION_CHANGE_APPROVED === '1';
  if (removedExpect.length && !approved) {
    const msg =
      `${removedExpect.length} dòng expect có sẵn bị sửa/xoá (thêm mới: ${addedExpect.length}).\n    ` +
      removedExpect.slice(0, 10).join('\n    ');
    if (oracleTouched) {
      warn(`${msg}\n  → spec/oracle cũng thay đổi trong cùng diff: kiểm tra lại hai thay đổi có khớp nhau không.`);
    } else {
      err('diff', `${msg}\n  → assertion đổi mà đáp án KHÔNG đổi. Đây là dấu hiệu reward hacking. Cần người duyệt (ASSERTION_CHANGE_APPROVED=1).`);
    }
  }
  if (addedFail.length && !approved) {
    err('diff', `Có test.fail mới, cần người duyệt:\n    ${addedFail.join('\n    ')}`);
  }
}

// ---------- 4. Kết quả ----------
for (const w of warnings) console.warn(`⚠  ${w}`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} lỗi toàn vẹn:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ Toàn vẹn OK: ${specFiles.length} file spec, ${seenIds.size} case đã có test, ${caseStatus.size} case trong ma trận.`);
