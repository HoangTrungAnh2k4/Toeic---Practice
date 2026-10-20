-- Save the caller's goals and replace their active study plan in one transaction (E6-2).
-- The plan itself is generated client-side by rules; security invoker so every write goes through the
-- existing profiles grants and study_plans / study_plan_weeks / plan_tasks RLS.
create function public.create_study_plan(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_plan_id uuid;
begin
  update public.profiles
  set target_speaking = (payload->>'target_speaking')::smallint,
      target_writing = (payload->>'target_writing')::smallint,
      exam_date = (payload->>'exam_date')::date
  where id = (select auth.uid());
  if not found then
    raise exception 'profile not found' using errcode = '42501';
  end if;

  -- Old plans keep their tasks for history.
  update public.study_plans
  set status = 'archived'
  where user_id = (select auth.uid()) and status = 'active';

  insert into public.study_plans (minutes_per_day, days_per_week, ai_rationale)
  values (
    (payload->>'minutes_per_day')::smallint,
    (payload->>'days_per_week')::smallint,
    payload->>'ai_rationale'
  )
  returning id into new_plan_id;

  insert into public.study_plan_weeks (plan_id, week_no, theme)
  select new_plan_id, w.week_no, w.theme
  from jsonb_to_recordset(coalesce(payload->'weeks', '[]')) as w(week_no smallint, theme text);

  insert into public.plan_tasks (
    plan_id, scheduled_date, sort_order, kind, title, description, goal, duration_min,
    exam_id, part_template_id, mistake_pattern_id
  )
  select new_plan_id, t.scheduled_date, t.sort_order, t.kind, t.title, t.description, t.goal, t.duration_min,
    t.exam_id, t.part_template_id, t.mistake_pattern_id
  from jsonb_to_recordset(coalesce(payload->'tasks', '[]')) as t(
    scheduled_date date, sort_order smallint, kind public.plan_task_kind, title text, description text,
    goal text, duration_min smallint, exam_id uuid, part_template_id smallint, mistake_pattern_id uuid
  );

  return new_plan_id;
end;
$$;

revoke execute on function public.create_study_plan(jsonb) from public, anon;
grant execute on function public.create_study_plan(jsonb) to authenticated;
