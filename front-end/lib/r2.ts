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
export function presignUrl({
    method,
    url,
    headers = {},
    accessKeyId,
    secretAccessKey,
    region,
    expiresSec,
    date,
}: PresignInput) {
    const amzDate = date.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const day = amzDate.slice(0, 8);
    const scope = `${day}/${region}/s3/aws4_request`;
    const signed: Record<string, string> = { host: url.host, ...headers };
    const names = Object.keys(signed).sort();
    const signedHeaders = names.join(';');

    const query = [
        ...url.searchParams,
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

/** URL ký sẵn tới object `key` trong bucket R2 (`key` rỗng: chính bucket), hết hạn sau 5 phút. */
function presignR2(method: 'GET' | 'PUT' | 'DELETE', key: string, headers?: Record<string, string>, query = '') {
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
        throw new Error('R2 env is not configured');
    }
    return presignUrl({
        method,
        url: new URL(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}${key && `/${key}`}?${query}`),
        headers,
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
        region: 'auto',
        expiresSec: 300,
        date: new Date(),
    });
}

/** Tải file lên R2 từ server; ký cả `content-length` để R2 từ chối body khác kích thước đã khai. */
export async function putR2Object(key: string, file: Blob) {
    const response = await fetch(presignR2('PUT', key, { 'content-length': String(file.size) }), {
        method: 'PUT',
        headers: { 'content-type': file.type },
        body: file,
        signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`R2 PUT ${key} failed with ${response.status}`);
}

export async function deleteR2Object(key: string) {
    const response = await fetch(presignR2('DELETE', key), { method: 'DELETE', signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`R2 DELETE ${key} failed with ${response.status}`);
}

/** Text trong thẻ `<name>` đầu tiên của XML từ R2. shortcut: không giải mã entity XML, đủ cho key uuid của ảnh đề */
const xmlTag = (xml: string, name: string) => xml.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1] ?? '';

/** Mọi object có key bắt đầu bằng `prefix` (ListObjectsV2, tự lật trang 1000 object/lượt). */
export async function listR2Objects(prefix: string) {
    const objects: { key: string; lastModified: string; size: number }[] = [];
    let token = '';
    do {
        const query = new URLSearchParams({ 'list-type': '2', prefix, ...(token && { 'continuation-token': token }) });
        const response = await fetch(presignR2('GET', '', undefined, query.toString()), {
            signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) throw new Error(`R2 LIST ${prefix} failed with ${response.status}`);
        const xml = await response.text();
        for (const [, item] of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
            objects.push({
                key: xmlTag(item, 'Key'),
                lastModified: xmlTag(item, 'LastModified'),
                size: Number(xmlTag(item, 'Size')),
            });
        }
        token = xmlTag(xml, 'IsTruncated') === 'true' ? xmlTag(xml, 'NextContinuationToken') : '';
    } while (token);
    return objects;
}
