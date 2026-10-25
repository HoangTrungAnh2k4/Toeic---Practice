import { NextResponse } from 'next/server';

/**
 * Log phía server. Production: mỗi dòng một JSON (`time`, `level`, `msg`, ngữ cảnh) để nền tảng host lọc/tìm được;
 * dev: in thẳng ra console cho dễ đọc. Không ghi cookie, token hay nội dung bài làm vào ngữ cảnh.
 */

type Level = 'info' | 'warn' | 'error';
type Context = Record<string, unknown>;

/** `JSON.stringify(error)` ra `{}`: tách message/stack, giữ field riêng như `code`/`details` của lỗi Postgres. */
function plain(value: unknown): unknown {
    if (!(value instanceof Error)) return value;
    return { ...value, name: value.name, message: value.message, stack: value.stack, cause: plain(value.cause) };
}

function write(level: Level, msg: string, context: Context = {}) {
    if (process.env.NODE_ENV !== 'production') return console[level](`[${level}] ${msg}`, context);
    const fields = Object.fromEntries(Object.entries(context).map(([key, value]) => [key, plain(value)]));
    try {
        console[level](JSON.stringify({ time: new Date().toISOString(), level, msg, ...fields }));
    } catch {
        // Ngữ cảnh có vòng tham chiếu/BigInt: vẫn phải ra log
        console[level](msg, context);
    }
}

export const logger = {
    info: (msg: string, context?: Context) => write('info', msg, context),
    warn: (msg: string, context?: Context) => write('warn', msg, context),
    error: (msg: string, context?: Context) => write('error', msg, context),
};

/** Ghi lỗi rồi trả 500 `{ error: 'server_error' }`, cùng dạng với `fail` của các route API. */
export function serverError(msg: string, error: unknown, context?: Context) {
    logger.error(msg, { ...context, error });
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
}
