-- exam_stats aggregates every user's attempts, visible to admins only.
begin;
select plan(3);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'student@test.local'),
  ('00000000-0000-0000-0000-000000000002', 'admin@test.local');
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000002';

insert into public.exams (id, skill, code, title, topic, status) values
  ('10000000-0000-0000-0000-000000000001', 'writing', 'PUB', 'Published', 't', 'published');
insert into public.attempts (user_id, exam_id, part_template_id, mode, status) values
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 6, 'timed', 'scored'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 7, 'timed', 'in_progress'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 8, 'timed', 'interrupted');

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';
select is_empty('select 1 from public.exam_stats', 'students cannot read exam stats');

set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select results_eq(
  $$select attempt_count, completion_rate from public.exam_stats where exam_id = '10000000-0000-0000-0000-000000000001'$$,
  $$values (3, 33)$$,
  'admins see every user''s attempts and the completion rate'
);

set local role anon;
select throws_ok('select 1 from public.exam_stats', '42501', null, 'anon cannot read exam stats');

select * from finish();
rollback;
