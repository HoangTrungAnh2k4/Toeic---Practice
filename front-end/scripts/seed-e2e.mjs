#!/usr/bin/env node
/**
 * Seed dữ liệu nền cho E2E trên Supabase LOCAL. Không đụng tới back-end/supabase/seed.sql.
 * Chạy từ front-end:  pnpm seed:e2e   (cần .env.test và `pnpm start` trong back-end; xem specs/e2e/README.md)
 *
 * Tạo: 2 tài khoản (student, admin), 3 đề Speaking ở trạng thái draft / review / published,
 * 2 lượt Speaking đã chấm 120 và 130 của student. Chạy lại được: xoá mọi lượt làm của 2 tài khoản test
 * và các đề seed rồi tạo lại.
 *
 * Dữ liệu seed là đầu vào của đáp án nên file này được bảo vệ như oracle (hook + integrity).
 * Test có thể `import { adminDb, IDS } from '../../scripts/seed-e2e.mjs'` để seed thêm dữ liệu riêng cho từng case.
 */
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

export const IDS = {
  student: 'e2e00000-0000-4000-8000-000000000001',
  admin: 'e2e00000-0000-4000-8000-000000000002',
  exams: {
    draft: 'e2e00000-0000-4000-8001-000000000001',
    review: 'e2e00000-0000-4000-8001-000000000002',
    published: 'e2e00000-0000-4000-8001-000000000003',
  },
  attempts: {
    speaking120: 'e2e00000-0000-4000-8002-000000000001',
    speaking130: 'e2e00000-0000-4000-8002-000000000002',
  },
};

/** Client service_role, chỉ cho Supabase local. */
export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url)) {
    throw new Error(`Seed E2E chỉ chạy với Supabase local. NEXT_PUBLIC_SUPABASE_URL hiện là "${url}".`);
  }
  if (!key) throw new Error('Thiếu SUPABASE_SERVICE_ROLE_KEY trong .env.test (lấy bằng `pnpm status` trong back-end).');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function must(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function ensureUser(db, { id, email, password, fullName, role }) {
  if (!email || !password) throw new Error(`Thiếu email/mật khẩu của tài khoản ${role} trong .env.test`);
  const attrs = { email, password, email_confirm: true, user_metadata: { full_name: fullName } };
  const { data } = await db.auth.admin.getUserById(id);
  const { error } = data?.user
    ? await db.auth.admin.updateUserById(id, attrs)
    : await db.auth.admin.createUser({ id, ...attrs });
  if (error) throw error;
  // Trigger on_auth_user_created đã tạo profile với role mặc định
  await must(db.from('profiles').update({ role }).eq('id', id));
}

/** Đủ 5 Part, 11 câu, để phòng thi mở được ở mọi trạng thái đề. Nội dung chỉ là dữ liệu mẫu. */
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
      { number: 3, prompt: 'Describe the picture.', image_path: '/img/banner.png', image_alt: 'Một nhóm người đang họp trong văn phòng' },
      { number: 4, prompt: 'Describe the picture.', image_path: '/img/banner.png', image_alt: 'Một người đang làm việc với máy tính' },
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
    context: 'Annual Sales Conference, Grand Hotel. 9:00 Welcome speech. 10:00 Market trends. 12:00 Lunch. 14:00 Workshop: Online sales.',
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

async function insertSpeakingExam(db, id, status) {
  await must(
    db.from('exams').insert({
      id,
      skill: 'speaking',
      code: 'E2E', // trigger exams_set_code sinh mã thật
      title: `E2E Speaking ${status}`,
      topic: 'office',
      status,
      created_by: IDS.admin,
      published_at: status === 'published' ? new Date().toISOString() : null,
    }),
  );
  for (const part of SPEAKING_PARTS) {
    const [row] = await must(
      db
        .from('exam_parts')
        .insert({ exam_id: id, part_template_id: part.template, context: part.context ?? null })
        .select('id'),
    );
    await must(db.from('questions').insert(part.questions.map((q) => ({ exam_part_id: row.id, ...q }))));
  }
}

export async function seed(db = adminDb()) {
  await ensureUser(db, {
    id: IDS.student,
    email: process.env.E2E_STUDENT_EMAIL,
    password: process.env.E2E_STUDENT_PASSWORD,
    fullName: 'E2E Student',
    role: 'student',
  });
  await ensureUser(db, {
    id: IDS.admin,
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
    fullName: 'E2E Admin',
    role: 'admin',
  });

  // attempts → exams là on delete restrict: xoá lượt làm trước, rồi mới xoá đề (Part, câu hỏi xoá theo cascade)
  const examIds = Object.values(IDS.exams);
  await must(db.from('attempts').delete().in('user_id', [IDS.student, IDS.admin]));
  await must(db.from('attempts').delete().in('exam_id', examIds));
  await must(db.from('exams').delete().in('id', examIds));

  for (const [status, id] of Object.entries(IDS.exams)) await insertSpeakingExam(db, id, status);

  // Lượt đã chấm: chỉ ghi điểm tổng 0–200 lên attempt, không seed điểm từng câu
  const day = 24 * 60 * 60 * 1000;
  const scored = (id, score, daysAgo) => {
    const at = new Date(Date.now() - daysAgo * day).toISOString();
    return {
      id,
      user_id: IDS.student,
      exam_id: IDS.exams.published,
      part_template_id: null,
      mode: 'cbt',
      status: 'scored',
      started_at: at,
      submitted_at: at,
      scored_at: at,
      score,
    };
  };
  await must(
    db.from('attempts').insert([scored(IDS.attempts.speaking120, 120, 2), scored(IDS.attempts.speaking130, 130, 1)]),
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  if (existsSync('.env.test')) process.loadEnvFile('.env.test');
  await seed();
  console.log('✓ Seed E2E xong: 2 tài khoản, 3 đề Speaking (draft/review/published), 2 lượt Speaking đã chấm (120, 130).');
}
