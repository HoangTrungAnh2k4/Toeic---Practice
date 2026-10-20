begin;
select plan(10);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'student@test.local'),
  ('00000000-0000-0000-0000-000000000002', 'admin@test.local');

update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000002';

-- A complete speaking exam built from the part templates; tests mutate copies of it.
create temp table fixture as
select jsonb_build_object(
  'skill', 'speaking', 'title', 'Test', 'topic', 'office',
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

select is_empty($$select 1 from public.exams where title = 'Test'$$, 'a rejected exam leaves no rows behind');

select lives_ok(
  $$select public.create_exam((select payload from fixture))$$,
  'admins can create a complete exam'
);

select results_eq(
  $$select e.status::text, e.created_by, count(q.id), e.code ~ '^SP-\d{4}$'
    from public.exams e
    join public.exam_parts ep on ep.exam_id = e.id
    join public.questions q on q.exam_part_id = ep.id
    where e.title = 'Test'
    group by e.status, e.created_by, e.code$$,
  $$values ('draft', '00000000-0000-0000-0000-000000000002'::uuid, 11::bigint, true)$$,
  'the exam is a draft owned by the admin with all 11 questions and a generated code'
);

-- Codes stay generated even when an admin writes the table directly.
insert into public.exams (skill, code, title, topic) values ('speaking', 'SP-T', 'Direct', 'office');
select ok(
  (select code ~ '^SP-\d{4}$' and code <> (select code from public.exams where title = 'Test') from public.exams where title = 'Direct'),
  'a code sent on insert is replaced by a new generated one'
);

update public.exams set code = 'SP-T' where title = 'Direct';
select isnt((select code from public.exams where title = 'Direct'), 'SP-T', 'the code cannot be changed by an update');

-- Writing: per-question e-mail and required keywords are stored.
select lives_ok(
  $$select public.create_exam(jsonb_build_object(
    'skill', 'writing', 'title', 'Writing Test', 'topic', 'office',
    'parts', (
      select jsonb_agg(jsonb_build_object(
        'part_template_id', pt.id,
        'questions', (
          select jsonb_agg(jsonb_build_object(
            'number', n, 'prompt', 'Question ' || n, 'stimulus', 'E-mail ' || n,
            'keywords', jsonb_build_array(jsonb_build_object('word', 'desk', 'forms', '[]'::jsonb))
          ))
          from generate_series(pt.q_from::int, pt.q_to::int) n
        )
      ) order by pt.id)
      from public.part_templates pt
      where pt.skill = 'writing'
    )
  ))$$,
  'admins can create a complete writing exam'
);

select results_eq(
  $$select q.stimulus, q.keywords->0->>'word'
    from public.exams e
    join public.exam_parts ep on ep.exam_id = e.id
    join public.questions q on q.exam_part_id = ep.id
    where e.title = 'Writing Test' and q.number = 6$$,
  $$values ('E-mail 6', 'desk')$$,
  'stimulus and keywords are written for each question'
);

set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';
select is_empty($$select 1 from public.exams where title = 'Writing Test'$$, 'students cannot see draft exams');

select * from finish();
rollback;
