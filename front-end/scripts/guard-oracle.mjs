#!/usr/bin/env node
/**
 * Hook PreToolUse của Claude Code: chặn agent sửa đáp án và các "luật chơi".
 * Exit 2 = chặn tool call; nội dung stderr được gửi lại cho agent.
 *
 * Giới hạn: phần kiểm tra lệnh Bash chỉ là heuristic, có thể lách được.
 * Lớp chặn cuối cùng là check-test-integrity.mjs trong CI và việc người review PR.
 */
import { readFileSync } from 'node:fs';

const PROTECTED = [
  /(^|[\/\\])specs[\/\\]e2e[\/\\]/,
  /(^|[\/\\])tests[\/\\]oracle[\/\\]/,
  /(^|[\/\\])tests[\/\\]e2e[\/\\]fixtures\.ts$/,
  /(^|[\/\\])scripts[\/\\](guard-oracle|check-test-integrity|mutate|seed-e2e)\.mjs$/,
  /(^|[\/\\])eslint\.playwright\.mjs$/,
  /(^|[\/\\])playwright\.config\.ts$/,
  /(^|[\/\\])\.claude[\/\\]/,
];

// Chuỗi nhận diện các file trên khi chúng xuất hiện trong một lệnh shell
const PROTECTED_IN_CMD =
  /specs[\/\\]e2e|tests[\/\\]oracle|fixtures\.ts|guard-oracle|check-test-integrity|mutate\.mjs|seed-e2e|eslint\.playwright|playwright\.config|\.claude[\/\\]/;

// Các thao tác ghi / xoá / di chuyển file hay gặp
const WRITE_OPS =
  /(^|[^0-9&>])>{1,2}(?!&)|\btee\b|\bsed\b[^|;&]*\s-i|\bperl\b[^|;&]*\s-i|\brm\b|\bmv\b|\bcp\b|\btruncate\b|\bgit\s+(checkout|restore|rm|mv|stash|reset)\b|writeFile|\bpython3?\s+-c|\bnode\s+-e/;

function block(reason) {
  process.stderr.write(
    `${reason}\n` +
      'File này là đáp án hoặc luật kiểm thử, chỉ người được sửa (xem specs/e2e/TESTING_RULES.md).\n' +
      'Nếu bạn cho rằng đáp án sai: ghi lý do vào reports/suspected-bugs.md rồi dừng lại.\n',
  );
  process.exit(2);
}

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0); // không đọc được input → không can thiệp
}

const tool = input.tool_name ?? '';
const ti = input.tool_input ?? {};

if (tool === 'Bash') {
  const cmd = String(ti.command ?? '');
  if (PROTECTED_IN_CMD.test(cmd) && WRITE_OPS.test(cmd)) {
    block(`Lệnh shell có vẻ ghi vào file được bảo vệ: ${cmd.slice(0, 200)}`);
  }
  process.exit(0);
}

const target = String(ti.file_path ?? ti.notebook_path ?? ti.path ?? '');
if (target && PROTECTED.some((re) => re.test(target))) {
  block(`Không được sửa: ${target}`);
}
process.exit(0);
