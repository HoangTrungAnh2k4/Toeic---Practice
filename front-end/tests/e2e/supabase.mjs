#!/usr/bin/env node
/**
 * Supabase riêng cho E2E (project "toeic-practice-e2e", cổng 553xx), tách khỏi stack dev (543xx).
 * Lý do: stack dev gửi email OTP qua Gmail thật và chứa dữ liệu dev; stack test gửi mail vào Mailpit
 * (test lấy OTP bằng admin.generateLink) và có thể xoá dữ liệu thoải mái.
 *
 *   node tests/e2e/supabase.mjs start   # chép migrations từ back-end, khởi động, in key cho .env.test
 *   node tests/e2e/supabase.mjs reset   # chạy lại toàn bộ migrations trên stack TEST
 *   node tests/e2e/supabase.mjs stop
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const BACKEND = path.resolve('../back-end');
const WORKDIR = path.resolve('.e2e-supabase');
const SRC = path.join(BACKEND, 'supabase');
const DST = path.join(WORKDIR, 'supabase');

function prepare() {
    rmSync(path.join(DST, 'migrations'), { recursive: true, force: true });
    mkdirSync(DST, { recursive: true });
    cpSync(path.join(SRC, 'migrations'), path.join(DST, 'migrations'), { recursive: true });

    let config = readFileSync(path.join(SRC, 'config.toml'), 'utf8');
    const patches = [
        [/^project_id = "toeic-practice"$/m, 'project_id = "toeic-practice-e2e"'],
        [/^(\s*(?:port|shadow_port) = )543(\d\d)$/gm, '$1553$2'],
        [/^inspector_port = 8083$/m, 'inspector_port = 8183'],
        // Mail vào Mailpit (cổng 55324) thay vì Gmail thật
        [/(\[auth\.email\.smtp\]\n)enabled = true/, '$1enabled = false'],
        [/(\[auth\.external\.google\]\n)enabled = true/, '$1enabled = false'],
        [/(\[db\.seed\]\n(?:#.*\n)*)enabled = true/, '$1enabled = false'],
        [/(\[studio\]\n)enabled = true/, '$1enabled = false'],
        // Docker Desktop không cho mount file template từ thư mục này; test lấy OTP bằng admin.generateLink
        [/^content_path = .*$/gm, '# content_path: dùng template mặc định'],
        // Test chạy nhiều lần liên tiếp từ cùng IP; hạn mức không thuộc phạm vi các case
        [/^email_sent = \d+$/m, 'email_sent = 1000'],
        [/^sign_in_sign_ups = \d+$/m, 'sign_in_sign_ups = 1000'],
        [/^token_verifications = \d+$/m, 'token_verifications = 1000'],
        [/^max_frequency = "60s"$/m, 'max_frequency = "1s"'],
    ];
    for (const [pattern, replacement] of patches) {
        if (!pattern.test(config)) throw new Error(`config.toml đã đổi, không áp được patch ${pattern}`);
        config = config.replace(pattern, replacement);
    }
    writeFileSync(path.join(DST, 'config.toml'), config);
}

function supabase(...args) {
    const res = spawnSync('pnpm', ['exec', 'supabase', ...args, '--workdir', WORKDIR], {
        cwd: BACKEND,
        stdio: 'inherit',
        shell: true,
    });
    if (res.status !== 0) process.exit(res.status ?? 1);
}

const cmd = process.argv[2];
if (cmd === 'start') {
    prepare();
    supabase('start');
    console.log('\nChép NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY ở trên vào .env.test (xem .env.test.example).');
} else if (cmd === 'reset') {
    prepare();
    supabase('db', 'reset', '--local');
} else if (cmd === 'stop') {
    supabase('stop');
} else {
    console.error('Dùng: node tests/e2e/supabase.mjs start|reset|stop');
    process.exit(1);
}
