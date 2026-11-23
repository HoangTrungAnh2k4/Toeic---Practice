-- The app is now only an exam room + attempt history: drop the study plan, learner goals/habits and the
-- unused AI insights. Existing plan and goal data is deleted for good.

drop function if exists public.create_study_plan(jsonb);

drop table if exists public.plan_tasks;
drop table if exists public.study_plan_weeks;
drop table if exists public.study_plans;
drop table if exists public.ai_insights;

drop type if exists public.plan_task_kind;
drop type if exists public.plan_status;

-- Column-level update grant covered only these columns, so learners can no longer update profiles at all.
alter table public.profiles
  drop column if exists target_speaking,
  drop column if exists target_writing,
  drop column if exists exam_date,
  drop column if exists preferred_time,
  drop column if exists reminder_enabled;
