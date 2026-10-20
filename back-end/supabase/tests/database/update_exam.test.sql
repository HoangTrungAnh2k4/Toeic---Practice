-- update_exam: admins edit drafts fully, exams with attempts only in their general info.
begin;
select plan(7);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'student@test.local'),
  ('00000000-0000-0000-0000-000000000002', 'admin@test.local');
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000002';

insert into public.exams (id, skill, code, title, edition, topic, status) values
  ('10000000-0000-0000-0000-000000000001', 'writing', '', 'Old title', 2025, 'office', 'draft');
insert into public.exam_parts (id, exam_id, part_template_id)
select gen_random_uuid(), '10000000-0000-0000-0000-000000000001', pt.id from public.part_templates pt where pt.skill = 'writing';
insert into public.questions (id, exam_part_id, number, prompt)
select gen_random_uuid(), ep.id, n, 'Old ' || n
from public.exam_parts ep
join public.part_templates pt on pt.id = ep.part_template_id
cross join lateral generate_series(pt.q_from::int, pt.q_to::int) n
where ep.exam_id = '10000000-0000-0000-0000-000000000001';

create temp table q8 as
select q.id from public.questions q join public.exam_parts ep on ep.id = q.exam_part_id
where ep.exam_id = '10000000-0000-0000-0000-000000000001' and q.number = 8;

-- Full payload rebuilt from the template skeleton; tests mutate copies of it.
create temp table fixture as
select jsonb_build_object(
  'title', 'New title', 'edition', 2026, 'topic', 'travel', 'target_level', 5,
  'parts', (
    select jsonb_agg(jsonb_build_object(
      'part_template_id', pt.id,
      'questions', (
        select jsonb_agg(jsonb_build_object('number', n, 'prompt', 'New ' || n, 'stimulus', 'Mail ' || n))
        from generate_series(pt.q_from::int, pt.q_to::int) n
      )
    ) order by pt.id)
    from public.part_templates pt where pt.skill = 'writing'
  )
) as payload;
grant select on fixture, q8 to authenticated;

set local role authenticated;

set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';
select throws_ok(
  $$select public.update_exam('10000000-0000-0000-0000-000000000001', (select payload from fixture))$$,
  '42501', null, 'students cannot edit exams'
);

set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select throws_ok(
  $$select public.update_exam('10000000-0000-0000-0000-000000000001',
    (select jsonb_set(payload, '{parts,2,questions}', '[]') from fixture))$$,
  '22023', null, 'dropping a question is rejected'
);

select lives_ok(
  $$select public.update_exam('10000000-0000-0000-0000-000000000001', (select payload from fixture))$$,
  'admins can edit a draft without attempts'
);

select results_eq(
  $$select e.title, e.topic, q.prompt, q.stimulus, q.id = (select id from q8)
    from public.exams e
    join public.exam_parts ep on ep.exam_id = e.id
    join public.questions q on q.exam_part_id = ep.id
    where e.id = '10000000-0000-0000-0000-000000000001' and q.number = 8$$,
  $$values ('New title', 'travel', 'New 8', 'Mail 8', true)$$,
  'general info and questions are updated in place, keeping question ids'
);

reset role;
insert into public.attempts (user_id, exam_id, part_template_id, mode) values
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 6, 'timed');
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000002", "role": "authenticated"}';

select throws_ok(
  $$select public.update_exam('10000000-0000-0000-0000-000000000001', (select payload from fixture))$$,
  '55006', null, 'questions of an attempted exam cannot change, even when the attempt is someone else''s'
);

select lives_ok(
  $$select public.update_exam('10000000-0000-0000-0000-000000000001', (select payload - 'parts' || '{"title": "Renamed"}' from fixture))$$,
  'general info of an attempted exam can still change'
);

select is(
  (select title from public.exams where id = '10000000-0000-0000-0000-000000000001'),
  'Renamed',
  'the title was updated'
);

select * from finish();
rollback;
