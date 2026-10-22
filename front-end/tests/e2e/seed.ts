/**
 * Dữ liệu mẫu cho E2E trên Supabase TEST (không phải production, không phải stack dev).
 * Chạy tự động ở project `seed` của Playwright; chạy tay: `pnpm test:e2e:seed`.
 *
 * Xoá sạch dữ liệu của lần chạy trước (tài khoản *@e2e.test, mọi lượt làm, mọi đề) rồi tạo:
 * - 2 tài khoản cố định: học viên + admin (email/mật khẩu trong .env.test)
 * - Speaking: đúng 6 đề published + 1 draft + 1 review (đủ 11 câu)
 * - Writing: 2 đề published + 1 draft (đủ 8 câu)
 * Test cần dữ liệu riêng (lượt làm, lộ trình, đề để sửa/xoá...) tự tạo bằng các helper bên dưới, với tài khoản riêng.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export type Db = SupabaseClient<Database>;
type Skill = 'speaking' | 'writing';
type ExamStatus = 'draft' | 'review' | 'published';

export const E2E_DOMAIN = 'e2e.test';

export const IDS = {
    student: 'e2e00000-0000-4000-8000-000000000001',
    admin: 'e2e00000-0000-4000-8000-000000000002',
    speaking: {
        published: [1, 2, 3, 4, 5, 6].map((n) => `e2e00000-0000-4000-8001-00000000000${n}`),
        draft: 'e2e00000-0000-4000-8001-000000000011',
        review: 'e2e00000-0000-4000-8001-000000000012',
    },
    writing: {
        published: ['e2e00000-0000-4000-8002-000000000001', 'e2e00000-0000-4000-8002-000000000002'],
        draft: 'e2e00000-0000-4000-8002-000000000011',
    },
};

/** Chủ đề của 6 đề Speaking published, theo thứ tự IDS.speaking.published. */
export const SPEAKING_TOPICS = ['office', 'customer', 'retail', 'travel', 'tech', 'logistics'] as const;

export function env(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Thiếu ${name} trong .env.test`);
    return value;
}

/** Client service_role, chỉ cho Supabase test local. */
export function adminDb(): Db {
    const url = new URL(env('NEXT_PUBLIC_SUPABASE_URL'));
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.port === '54321') {
        throw new Error(`Seed chỉ chạy với Supabase test local, không phải ${url.origin}`);
    }
    return createClient<Database>(url.origin, env('SUPABASE_SERVICE_ROLE_KEY'), {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

/** Client mang phiên đăng nhập của một tài khoản (đi qua RLS như người dùng thật). */
export async function sessionDb(email: string, password: string): Promise<Db> {
    const client = createClient<Database>(env('NEXT_PUBLIC_SUPABASE_URL'), env('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return client;
}

/** Phiên của admin test: tạo đề phải đi qua phiên admin vì trigger sinh mã đề dùng sequence trong schema `private`. */
export const adminSessionDb = () => sessionDb(env('E2E_ADMIN_EMAIL'), env('E2E_ADMIN_PASSWORD'));

/** Kết quả của truy vấn Supabase, ném lỗi nếu có. */
export async function must<T>(query: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
    const { data, error } = await query;
    if (error) throw error;
    // Truy vấn không `.select()` (vd. delete) trả `null`; chỗ gọi không dùng kết quả đó
    return data as T;
}

export interface TestUser {
    id: string;
    email: string;
    password: string;
    name: string;
}

/** Tài khoản đã xác thực email (hoặc chưa, với `confirmed: false`). Profile do trigger tạo. */
export async function createUser(
    db: Db,
    {
        id,
        role = 'student',
        name = 'Học Viên E2E',
        email = `u-${crypto.randomUUID().slice(0, 12)}@${E2E_DOMAIN}`,
        password = `E2e-${crypto.randomUUID().slice(0, 10)}1`,
        confirmed = true,
    }: { id?: string; role?: 'student' | 'admin'; name?: string; email?: string; password?: string; confirmed?: boolean } = {},
): Promise<TestUser> {
    const { data, error } = await db.auth.admin.createUser({
        ...(id && { id }),
        email,
        password,
        email_confirm: confirmed,
        user_metadata: { full_name: name },
    });
    if (error) throw error;
    if (role === 'admin') await must(db.from('profiles').update({ role }).eq('id', data.user.id));
    return { id: data.user.id, email, password, name };
}

const SPEAKING_PARTS = [
    {
        template: 1,
        questions: [
            { number: 1, prompt: 'Thank you for calling Greenfield Bank. Our offices are open from nine to five, Monday through Friday.' },
            { number: 2, prompt: 'Welcome to the city museum. Today we will visit the history hall, the art gallery, and the garden.' },
        ],
    },
    {
        template: 2,
        questions: [
            { number: 3, prompt: 'Describe the picture in as much detail as you can.', image_path: '/img/banner.png', image_alt: 'Four people are talking in a meeting room.' },
            { number: 4, prompt: 'Describe the picture in as much detail as you can.', image_path: '/img/banner.png', image_alt: 'A woman is working on a laptop at her desk.' },
        ],
    },
    {
        template: 3,
        context: 'Imagine that a marketing firm is doing research in your country. You have agreed to a telephone interview about coffee shops.',
        questions: [
            { number: 5, prompt: 'How often do you go to a coffee shop?' },
            { number: 6, prompt: 'What do you usually order?' },
            { number: 7, prompt: 'Would you prefer a coffee shop near your home or near your workplace? Why?' },
        ],
    },
    {
        template: 4,
        context: 'Annual Sales Conference, Grand Hotel\n9:00 Welcome speech\n10:00 Market trends\n12:00 Lunch\n14:00 Workshop: Online sales',
        questions: [
            { number: 8, prompt: 'What time does the conference start, and where is it held?' },
            { number: 9, prompt: 'I heard there is a workshop in the morning. Is that right?' },
            { number: 10, prompt: 'Can you tell me about the sessions before lunch?' },
        ],
    },
    {
        template: 5,
        questions: [{ number: 11, prompt: 'Do you agree that employees should be allowed to work from home? Give reasons and examples.' }],
    },
];

const keywords = (a: string, b: string) => [
    { word: a, forms: [] },
    { word: b, forms: [] },
];

const WRITING_PARTS = [
    {
        template: 6,
        questions: [
            ['go', 'office'],
            ['desk', 'computer'],
            ['woman', 'carry'],
            ['meeting', 'table'],
            ['bus', 'wait'],
        ].map(([a, b], index) => ({
            number: index + 1,
            prompt: 'Write ONE sentence based on the picture. Use the TWO words or phrases under the picture.',
            image_path: '/img/banner.png',
            image_alt: 'People are working in an office.',
            keywords: keywords(a, b),
        })),
    },
    {
        template: 7,
        questions: [6, 7].map((number) => ({
            number,
            prompt: null,
            stimulus: `From: Office Supplies Co.\nTo: Office manager\nSubject: Your order\n\nTwo items from your recent order are out of stock. Please reply to this email.\n\nDirections: Respond to the e-mail. Ask TWO questions and make ONE suggestion. (Q${number})`,
        })),
    },
    {
        template: 8,
        questions: [{ number: 8, prompt: 'Do you agree or disagree: it is better to work for a large company than a small one? Give reasons or examples.' }],
    },
];

export interface SeededExam {
    id: string;
    code: string;
    title: string;
    /** id câu hỏi theo số câu. */
    questions: Record<number, string>;
}

/**
 * Đề đủ Part/câu theo format ETS. `omit` bỏ một trường của một câu (vd. ảnh câu 4) để tạo đề thiếu dữ liệu.
 * `code` do trigger sinh, không truyền được. `db` phải là phiên admin (`adminSessionDb`).
 */
export async function createExam(
    db: Db,
    {
        id,
        skill,
        status,
        title,
        topic = 'office',
        createdBy = IDS.admin,
        omit,
    }: {
        id?: string;
        skill: Skill;
        status: ExamStatus;
        title: string;
        topic?: string;
        createdBy?: string;
        omit?: { number: number; field: 'image_path' | 'image_alt' | 'prompt' };
    },
): Promise<SeededExam> {
    const [exam] = await must(
        db
            .from('exams')
            .insert({
                ...(id && { id }),
                skill,
                code: 'E2E',
                title,
                topic,
                status,
                created_by: createdBy,
                published_at: status === 'published' ? new Date().toISOString() : null,
            })
            .select('id, code'),
    );
    const questions: Record<number, string> = {};
    for (const part of skill === 'speaking' ? SPEAKING_PARTS : WRITING_PARTS) {
        const [row] = await must(
            db
                .from('exam_parts')
                .insert({ exam_id: exam.id, part_template_id: part.template, context: (part as { context?: string }).context ?? null })
                .select('id'),
        );
        const rows = part.questions.map((question) => {
            const copy: Record<string, unknown> = { exam_part_id: row.id, ...question };
            if (omit?.number === question.number) copy[omit.field] = null;
            return copy as Database['public']['Tables']['questions']['Insert'];
        });
        for (const inserted of await must(db.from('questions').insert(rows).select('id, number'))) {
            questions[inserted.number] = inserted.id;
        }
    }
    return { id: exam.id, code: exam.code, title, questions };
}

/** Xoá dữ liệu của các lần chạy trước. Chỉ an toàn vì đây là Supabase test riêng. */
async function wipe(db: Db) {
    const ids: string[] = [];
    for (let page = 1; ; page++) {
        const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        ids.push(...data.users.filter((user) => user.email?.endsWith(`@${E2E_DOMAIN}`)).map((user) => user.id));
        if (data.users.length < 1000) break;
    }
    // Xoá user kéo theo profile, lượt làm, bookmark, lộ trình (on delete cascade)
    for (let i = 0; i < ids.length; i += 20) {
        await Promise.all(
            ids.slice(i, i + 20).map(async (id) => {
                const { error } = await db.auth.admin.deleteUser(id);
                if (error) throw error;
            }),
        );
    }
    // attempts → exams là on delete restrict
    await must(db.from('attempts').delete().not('id', 'is', null));
    await must(db.from('exams').delete().not('id', 'is', null));
    await must(db.from('scoring_usage').delete().not('subject', 'is', null));
}

export async function seed(db = adminDb()) {
    await wipe(db);
    await createUser(db, { id: IDS.student, email: env('E2E_STUDENT_EMAIL'), password: env('E2E_STUDENT_PASSWORD'), name: 'Học Viên E2E' });
    await createUser(db, { id: IDS.admin, role: 'admin', email: env('E2E_ADMIN_EMAIL'), password: env('E2E_ADMIN_PASSWORD'), name: 'Quản Trị E2E' });
    const admin = await adminSessionDb();

    for (const [index, id] of IDS.speaking.published.entries()) {
        await createExam(admin, { id, skill: 'speaking', status: 'published', title: `E2E Speaking ${index + 1}`, topic: SPEAKING_TOPICS[index] });
    }
    await createExam(admin, { id: IDS.speaking.draft, skill: 'speaking', status: 'draft', title: 'E2E Speaking Nháp' });
    await createExam(admin, { id: IDS.speaking.review, skill: 'speaking', status: 'review', title: 'E2E Speaking Chờ duyệt' });
    for (const [index, id] of IDS.writing.published.entries()) {
        await createExam(admin, { id, skill: 'writing', status: 'published', title: `E2E Writing ${index + 1}` });
    }
    await createExam(admin, { id: IDS.writing.draft, skill: 'writing', status: 'draft', title: 'E2E Writing Nháp' });
}

// `node --experimental-strip-types tests/e2e/seed.ts`
if (process.argv[1]?.replace(/\\/g, '/').endsWith('tests/e2e/seed.ts')) {
    process.loadEnvFile('.env.test');
    seed().then(
        () => console.log('Seed E2E xong.'),
        (error: unknown) => {
            console.error(error);
            process.exit(1);
        },
    );
}
