begin;
select plan(5);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'student@test.local'),
  ('00000000-0000-0000-0000-000000000002', 'other@test.local');

insert into public.exams (id, skill, code, title, edition, topic, status) values
  ('10000000-0000-0000-0000-000000000001', 'speaking', 'PUB', 'Published', 2026, 't', 'published'),
  ('10000000-0000-0000-0000-000000000002', 'speaking', 'DRAFT', 'Draft', 2026, 't', 'draft');

insert into public.attempts (user_id, exam_id, mode) values
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'cbt');

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

select results_eq(
  $$select title from public.exams where title in ('Published', 'Draft')$$,
  array['Published'],
  'students see only published exams'
);

select is_empty('select 1 from public.attempts', 'students cannot see others'' attempts');

select throws_ok(
  $$update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000001'$$,
  '42501',
  null,
  'students cannot change their role'
);

select throws_ok(
  $$insert into public.attempts (exam_id, mode) values ('10000000-0000-0000-0000-000000000002', 'cbt')$$,
  '42501',
  null,
  'students cannot attempt draft exams'
);

select lives_ok(
  $$insert into public.attempts (exam_id, mode) values ('10000000-0000-0000-0000-000000000001', 'cbt')$$,
  'students can attempt published exams'
);

select * from finish();
rollback;
