import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'Toeco - Luyện TOEIC Speaking & Writing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// next/og chỉ nhận inline style và hex (không có Tailwind); màu khớp token main / sub1 / sub3.
// Chữ tiếng Anh vì font mặc định của next/og không đủ dấu tiếng Việt.
export default async function Image() {
    const logo = await readFile(join(process.cwd(), 'public/img/logo.png'));
    const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 48,
                    background: '#3C3454',
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element -- next/og chỉ render thẻ img */}
                <img src={logoSrc} width={560} height={156} alt="" />
                <div
                    style={{
                        display: 'flex',
                        fontSize: 44,
                        fontWeight: 700,
                        color: '#000',
                        background: '#F5B841',
                        border: '4px solid #000',
                        boxShadow: '8px 8px 0 0 #000',
                        borderRadius: 16,
                        padding: '16px 36px',
                    }}
                >
                    TOEIC Speaking & Writing practice
                </div>
                <div style={{ display: 'flex', fontSize: 30, color: '#E8E5F5' }}>
                    ETS format · AI scoring · instant feedback
                </div>
            </div>
        ),
        size,
    );
}
