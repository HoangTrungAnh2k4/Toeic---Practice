-- Owner-only access to attempts, responses, annotations, bookmarks.
begin;
select plan(11);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'student@test.local'),
  ('00000000-0000-0000-0000-000000000002', 'other@test.local');

insert into public.exams (id, skill, code, title, edition, topic, status) values
  ('10000000-0000-0000-0000-000000000001', 'writing', 'PUB', 'Published', 2026, 't', 'published');
insert into public.exam_parts (id, exam_id, part_template_id) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 6);
insert into public.questions (id, exam_part_id, number, prompt) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1, 'q');

-- The other user's data, written as postgres (bypasses RLS).
insert into public.attempts (id, user_id, exam_id, part_template_id, mode) values
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 6, 'timed');
insert into public.responses (id, attempt_id, question_id, text_answer) values
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'x');
insert into public.annotations (response_id, start_offset, end_offset, quote, correction, explanation, criterion, severity) values
  ('50000000-0000-0000-0000-000000000002', 0, 1, 'x', 'y', 'z', 'grammar', 'low');
insert into public.bookmarks (user_id, exam_id) values
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001');

select is(
  (select ends_at - started_at from public.attempts where id = '40000000-0000-0000-0000-000000000002'),
  interval '480 seconds',
  'ends_at is derived from the part section time'
);

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

select is_empty('select 1 from public.responses', 'students cannot see others'' responses');
select is_empty('select 1 from public.annotations', 'students cannot see others'' annotations');
select is_empty('select 1 from public.bookmarks', 'students cannot see others'' bookmarks');

select throws_ok(
  $$insert into public.responses (attempt_id, question_id, text_answer)
    values ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'hack')$$,
  '42501', null, 'students cannot answer others'' attempts'
);

select throws_ok(
  $$insert into public.attempts (exam_id, mode, ends_at)
    values ('10000000-0000-0000-0000-000000000001', 'timed', now() + interval '1 day')$$,
  '42501', null, 'students cannot set their own deadline'
);

insert into public.attempts (exam_id, part_template_id, mode) values
  ('10000000-0000-0000-0000-000000000001', 6, 'guided');

select is(
  (select ends_at from public.attempts where mode = 'guided'),
  null,
  'guided attempts have no deadline'
);

select lives_ok(
  $$insert into public.responses (attempt_id, question_id, text_answer)
    select id, '30000000-0000-0000-0000-000000000001', 'mine' from public.attempts$$,
  'students can answer their own attempts'
);

select throws_ok(
  $$update public.attempts set score = 200$$,
  '42501', null, 'students cannot score their own attempts'
);

select throws_ok(
  $$insert into public.annotations (response_id, start_offset, end_offset, quote, correction, explanation, criterion, severity)
    select id, 0, 1, 'a', 'b', 'c', 'grammar', 'low' from public.responses$$,
  '42501', null, 'students cannot write annotations'
);

select lives_ok(
  $$insert into public.bookmarks (exam_id) values ('10000000-0000-0000-0000-000000000001')$$,
  'students can bookmark visible exams'
);

select * from finish();
rollback;
