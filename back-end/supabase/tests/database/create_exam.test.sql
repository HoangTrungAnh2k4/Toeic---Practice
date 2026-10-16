begin;
select plan(5);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'student@test.local'),
  ('00000000-0000-0000-0000-000000000002', 'admin@test.local');

update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000002';

-- A complete speaking exam built from the part templates; tests mutate copies of it.
create temp table fixture as
select jsonb_build_object(
  'skill', 'speaking', 'code', 'SP-T', 'title', 'Test', 'edition', 2026, 'topic', 'office', 'tags', '[]'::jsonb,
  'parts', (
    select jsonb_agg(jsonb_build_object(
      'part_template_id', pt.id,
      'context', 'Shared context',
      'questions', (
        select jsonb_agg(jsonb_build_object('number', n, 'prompt', 'Question ' || n))
        from generate_series(pt.q_from::int, pt.q_to::int) n
      )
    ) order by pt.id)
    from public.part_templates pt
    where pt.skill = 'speaking'
  )
) as payload;
grant select on fixture to authenticated;

set local role authenticated;

set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';
select throws_ok(
  $$select public.create_exam((select payload from fixture))$$,
  '42501',
  null,
  'students cannot create exams'
);

set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select throws_ok(
  $$select public.create_exam((select jsonb_set(payload, '{parts,2,questions}', (payload #> '{parts,2,questions}') - 0) from fixture))$$,
  '22023',
  null,
  'a part with a missing question is rejected'
);

select is_empty($$select 1 from public.exams where code = 'SP-T'$$, 'a rejected exam leaves no rows behind');

select lives_ok(
  $$select public.create_exam((select payload from fixture))$$,
  'admins can create a complete exam'
);

select results_eq(
  $$select e.status::text, e.created_by, count(q.id)
    from public.exams e
    join public.exam_parts ep on ep.exam_id = e.id
    join public.questions q on q.exam_part_id = ep.id
    where e.code = 'SP-T'
    group by e.status, e.created_by$$,
  $$values ('draft', '00000000-0000-0000-0000-000000000002'::uuid, 11::bigint)$$,
  'the exam is a draft owned by the admin with all 11 questions'
);

select * from finish();
rollback;
