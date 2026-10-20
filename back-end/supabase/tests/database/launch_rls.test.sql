-- Pre-launch RLS audit (E8-7): tables not covered by rls.test.sql / user_data_rls.test.sql.
begin;
select plan(20);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'student@test.local'),
  ('00000000-0000-0000-0000-000000000002', 'other@test.local');

insert into public.exams (id, skill, code, title, topic, status) values
  ('10000000-0000-0000-0000-000000000001', 'speaking', 'PUB', 'Published', 't', 'published');
insert into public.exam_parts (id, exam_id, part_template_id) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1);

-- The other user's data, written as postgres (bypasses RLS).
insert into public.study_plans (id, user_id, minutes_per_day, days_per_week) values
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 30, 5);
insert into public.study_plan_weeks (plan_id, week_no, theme) values
  ('60000000-0000-0000-0000-000000000002', 1, 'theirs');
insert into public.plan_tasks (plan_id, scheduled_date, kind, title, duration_min) values
  ('60000000-0000-0000-0000-000000000002', current_date, 'speaking', 'theirs', 20);
insert into public.ai_insights (user_id, payload) values
  ('00000000-0000-0000-0000-000000000002', '{}');
insert into public.scoring_usage (subject, day) values ('00000000-0000-0000-0000-000000000002', current_date);
-- Student's own submitted attempt, for the "cannot finish scoring yourself" checks.
insert into public.attempts (id, user_id, exam_id, mode, status, submitted_at) values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'cbt', 'submitted', now());

-- ===== Anonymous visitors =====
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select is_empty('select 1 from public.profiles', 'anon cannot read profiles');
select is_empty('select 1 from public.attempts', 'anon cannot read attempts');
select throws_ok(
  $$insert into public.exams (skill, code, title, topic) values ('speaking', 'X', 'x', 't')$$,
  '42501', null, 'anon cannot create exams'
);
select throws_ok(
  $$insert into public.profiles (id, role) values ('00000000-0000-0000-0000-000000000003', 'admin')$$,
  '42501', null, 'anon cannot create an admin profile'
);

-- ===== Signed-in student =====
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

select results_eq(
  'select id from public.profiles',
  $$values ('00000000-0000-0000-0000-000000000001'::uuid)$$,
  'students read only their own profile'
);
select throws_ok(
  $$insert into public.profiles (id, role) values ('00000000-0000-0000-0000-000000000003', 'admin')$$,
  '42501', null, 'students cannot create profiles'
);
select is_empty(
  $$update public.profiles set target_speaking = 200 where id = '00000000-0000-0000-0000-000000000002' returning id$$,
  'students cannot edit others'' profiles'
);

select is_empty('select 1 from public.study_plans', 'students cannot see others'' plans');
select is_empty('select 1 from public.study_plan_weeks', 'students cannot see others'' plan weeks');
select is_empty('select 1 from public.plan_tasks', 'students cannot see others'' plan tasks');
select throws_ok(
  $$insert into public.plan_tasks (plan_id, scheduled_date, kind, title, duration_min)
    values ('60000000-0000-0000-0000-000000000002', current_date, 'review', 'hack', 10)$$,
  '42501', null, 'students cannot add tasks to others'' plans'
);
select lives_ok(
  $$insert into public.study_plans (minutes_per_day, days_per_week) values (45, 6)$$,
  'students can create their own plan'
);

select is_empty('select 1 from public.ai_insights', 'students cannot see others'' insights');
select throws_ok(
  $$insert into public.ai_insights (user_id, payload) values ('00000000-0000-0000-0000-000000000001', '{}')$$,
  '42501', null, 'students cannot write insights'
);

-- No grant at all: only the scoring routes (service role) touch quotas
select throws_ok('select 1 from public.scoring_usage', '42501', null, 'students cannot read scoring quotas');
select throws_ok(
  $$update public.scoring_usage set used = 0$$,
  '42501', null, 'students cannot reset scoring quotas'
);

select is_empty(
  $$update public.attempts set status = 'scored' where id = '40000000-0000-0000-0000-000000000001' returning id$$,
  'students cannot mark their own submitted attempt as scored'
);

select throws_ok(
  $$insert into public.mistake_patterns (skill, title, summary, why, severity, impact, remedy)
    values ('speaking', 'x', 'x', 'x', 'low', 'x', '[]')$$,
  '42501', null, 'students cannot write mistake patterns'
);
select is_empty(
  $$update public.score_levels set level = 8 returning level$$,
  'students cannot change score levels'
);
select is_empty(
  $$update public.part_templates set prep_sec = 999 returning id$$,
  'students cannot change part templates'
);

select * from finish();
rollback;
