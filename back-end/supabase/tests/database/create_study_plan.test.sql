begin;
select plan(8);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'student@test.local'),
  ('00000000-0000-0000-0000-000000000002', 'other@test.local');

-- Existing active plans: the student's (to be archived) and another user's (must stay untouched).
insert into public.study_plans (id, user_id, minutes_per_day, days_per_week) values
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 30, 5),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 30, 5);
insert into public.plan_tasks (plan_id, scheduled_date, kind, title, duration_min) values
  ('60000000-0000-0000-0000-000000000001', current_date, 'speaking', 'old', 20);

create temp table fixture as
select jsonb_build_object(
  'target_speaking', 160, 'target_writing', 150, 'exam_date', current_date + 30,
  'minutes_per_day', 45, 'days_per_week', 5, 'ai_rationale', 'Why',
  'weeks', jsonb_build_array(jsonb_build_object('week_no', 1, 'theme', 'Week 1')),
  'tasks', jsonb_build_array(
    jsonb_build_object('scheduled_date', current_date, 'sort_order', 0, 'kind', 'writing', 'title', 'Essay',
      'duration_min', 35, 'part_template_id', 8),
    jsonb_build_object('scheduled_date', current_date, 'sort_order', 1, 'kind', 'summary', 'title', 'Summary',
      'duration_min', 10)
  )
) as payload;
grant select on fixture to authenticated;

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

select lives_ok('select public.create_study_plan(payload) from fixture', 'students create their own plan');
select results_eq(
  'select target_speaking::int, target_writing::int, exam_date from public.profiles',
  $$values (160, 150, current_date + 30)$$,
  'goals are saved on the caller''s profile'
);
select results_eq(
  $$select count(*)::int from public.study_plans where status = 'active'$$,
  $$values (1)$$,
  'only the new plan stays active'
);
select results_eq(
  $$select status::text from public.study_plans where id = '60000000-0000-0000-0000-000000000001'$$,
  $$values ('archived')$$,
  'the previous plan is archived'
);
select results_eq(
  $$select count(*)::int from public.plan_tasks where plan_id = '60000000-0000-0000-0000-000000000001'$$,
  $$values (1)$$,
  'tasks of the archived plan are kept'
);
select results_eq(
  $$select array_agg(t.kind::text order by t.sort_order) from public.plan_tasks t
    join public.study_plans p on p.id = t.plan_id where p.status = 'active'$$,
  $$values (array['writing', 'summary'])$$,
  'weeks and tasks are inserted into the new plan'
);
select throws_ok(
  $$select public.create_study_plan(payload || '{"tasks": [{"scheduled_date": "2026-01-01", "sort_order": 0, "kind": "speaking", "title": "x", "duration_min": 0}]}') from fixture$$,
  '23514', null, 'an invalid task rolls the whole plan back'
);

reset role;
select results_eq(
  $$select status::text from public.study_plans where id = '60000000-0000-0000-0000-000000000002'$$,
  $$values ('active')$$,
  'other users'' plans are never archived'
);

select * from finish();
rollback;
