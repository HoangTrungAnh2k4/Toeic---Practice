import { createHash, createHmac } from 'node:crypto';

/** Chỉ dùng phía server: đọc secret R2 từ env (không có tiền tố NEXT_PUBLIC_ nên không lọt vào bundle client). */

const hmac = (key: string | Buffer, data: string) => createHmac('sha256', key).update(data).digest();
const sha256Hex = (data: string) => createHash('sha256').update(data).digest('hex');
/** Encode theo RFC 3986 như SigV4 yêu cầu (encodeURIComponent chừa lại !'()*). */
const encode = (value: string) =>
    encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

export interface PresignInput {
    method: string;
    /** Path phải là ký tự an toàn (không cần encode lại), vd. key chỉ gồm uuid và `/`. */
    url: URL;
    /** Header phải gửi đúng giá trị khi gọi URL (tên viết thường), ngoài `host`. */
    headers?: Record<string, string>;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    expiresSec: number;
    date: Date;
}

/** URL ký sẵn kiểu S3 SigV4 (query string), payload không ký. */
export function presignUrl({ method, url, headers = {}, accessKeyId, secretAccessKey, region, expiresSec, date }: PresignInput) {
    const amzDate = date.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const day = amzDate.slice(0, 8);
    const scope = `${day}/${region}/s3/aws4_request`;
    const signed: Record<string, string> = { host: url.host, ...headers };
    const names = Object.keys(signed).sort();
    const signedHeaders = names.join(';');

    const query = [
        ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
        ['X-Amz-Credential', `${accessKeyId}/${scope}`],
        ['X-Amz-Date', amzDate],
        ['X-Amz-Expires', String(expiresSec)],
        ['X-Amz-SignedHeaders', signedHeaders],
    ]
        .map(([key, value]) => `${encode(key)}=${encode(value)}`)
        .sort()
        .join('&');

    const canonicalRequest = [
        method,
        url.pathname,
        query,
        names.map((name) => `${name}:${signed[name]}\n`).join(''),
        signedHeaders,
        'UNSIGNED-PAYLOAD',
    ].join('\n');
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n');
    const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretAccessKey}`, day), region), 's3'), 'aws4_request');
    const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    return `${url.origin}${url.pathname}?${query}&X-Amz-Signature=${signature}`;
}

/** URL PUT lên bucket R2, hết hạn sau 5 phút; ký cả `content-length` để client không upload quá kích thước đã khai. */
export function presignR2Put(key: string, contentLength: number) {
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
        throw new Error('R2 env is not configured');
    }
    return presignUrl({
        method: 'PUT',
        url: new URL(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`),
        headers: { 'content-length': String(contentLength) },
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
        region: 'auto',
        expiresSec: 300,
        date: new Date(),
    });
}
