-- Full schema (squashed from the 2026-10-14..2026-10-20 migrations). Tables follow front-end/docs/erd.md;
-- enum values mirror front-end/lib/domain/types.ts.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.skill as enum ('speaking', 'writing');
create type public.user_role as enum ('student', 'admin');
create type public.exam_source as enum ('ets', 'internal');
create type public.exam_status as enum ('draft', 'review', 'published');
create type public.attempt_mode as enum ('cbt', 'timed', 'guided');
create type public.attempt_status as enum ('in_progress', 'submitted', 'scoring', 'scored', 'interrupted');
create type public.criterion as enum (
  'pronunciation', 'intonation', 'grammar', 'vocabulary', 'cohesion',
  'relevance', 'completeness', 'organization', 'support', 'fluency', 'task_response'
);
create type public.severity as enum ('high', 'medium', 'low');
create type public.plan_status as enum ('active', 'archived');
create type public.plan_task_kind as enum ('speaking', 'writing', 'review', 'mock', 'summary');

-- ---------------------------------------------------------------------------
-- Private schema: security definer helpers, not exposed through the API.
-- ---------------------------------------------------------------------------

create schema private;
grant usage on schema private to authenticated;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: app data per auth user (role, goals, exam date). Name and avatar live only in
-- auth.users.raw_user_meta_data (kept current by Supabase when identities are linked).
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'student',
  target_speaking smallint check (target_speaking between 0 and 200),
  target_writing smallint check (target_writing between 0 and 200),
  exam_date date,
  preferred_time text,
  reminder_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Users edit their own profile but never their role.
revoke update on public.profiles from anon, authenticated;
grant update (target_speaking, target_writing, exam_date, preferred_time, reminder_enabled)
  on public.profiles to authenticated;

-- Profile auto-created on sign up.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Security definer so policies on other tables can read the caller's role without profiles RLS recursion.
create function private.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Static reference data (seeded here, edited only via migrations)
-- ---------------------------------------------------------------------------

create table public.part_templates (
  id smallint primary key,
  skill public.skill not null,
  part_no smallint not null check (part_no > 0),
  q_from smallint not null check (q_from > 0),
  q_to smallint not null,
  task text not null,
  context_sec smallint check (context_sec > 0),
  prep_sec smallint check (prep_sec > 0),
  -- One entry per question, q_from..q_to; null when the whole part shares section_sec.
  response_sec smallint[] check (cardinality(response_sec) = q_to - q_from + 1),
  section_sec smallint check (section_sec > 0),
  unique (skill, part_no),
  check (q_to >= q_from)
);

alter table public.part_templates enable row level security;

create policy "Anyone can read part templates"
  on public.part_templates for select to anon, authenticated
  using (true);

insert into public.part_templates (id, skill, part_no, q_from, q_to, task, context_sec, prep_sec, response_sec, section_sec) values
  (1, 'speaking', 1, 1, 2, 'Read a text aloud', null, 45, '{45,45}', null),
  (2, 'speaking', 2, 3, 4, 'Describe a picture', null, 45, '{30,30}', null),
  (3, 'speaking', 3, 5, 7, 'Respond to questions', null, 3, '{15,15,30}', null),
  (4, 'speaking', 4, 8, 10, 'Respond to questions using information provided', 45, 3, '{15,15,30}', null),
  (5, 'speaking', 5, 11, 11, 'Express an opinion', null, 45, '{60}', null),
  (6, 'writing', 1, 1, 5, 'Write a sentence based on a picture', null, null, null, 480),
  (7, 'writing', 2, 6, 7, 'Respond to a written request', null, null, '{600,600}', null),
  (8, 'writing', 3, 8, 8, 'Write an opinion essay', null, null, '{1800}', null);

create table public.score_levels (
  skill public.skill not null,
  min_score smallint not null check (min_score between 0 and 200),
  level smallint not null check (level > 0),
  primary key (skill, min_score)
);

alter table public.score_levels enable row level security;

create policy "Anyone can read score levels"
  on public.score_levels for select to anon, authenticated
  using (true);

insert into public.score_levels (skill, min_score, level) values
  ('speaking', 0, 1), ('speaking', 40, 2), ('speaking', 60, 3), ('speaking', 80, 4),
  ('speaking', 110, 5), ('speaking', 130, 6), ('speaking', 160, 7), ('speaking', 190, 8),
  ('writing', 0, 1), ('writing', 40, 2), ('writing', 50, 3), ('writing', 70, 4), ('writing', 90, 5),
  ('writing', 110, 6), ('writing', 140, 7), ('writing', 170, 8), ('writing', 200, 9);

-- ---------------------------------------------------------------------------
-- Exam bank: students read published exams, admins write.
-- ---------------------------------------------------------------------------

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  skill public.skill not null,
  code text not null unique,
  title text not null,
  source public.exam_source not null default 'internal',
  status public.exam_status not null default 'draft',
  is_verified boolean not null default false,
  topic text not null,
  review_note text,
  created_by uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exams_skill_status_idx on public.exams (skill, status);
create index exams_created_by_idx on public.exams (created_by);

create trigger exams_set_updated_at
  before update on public.exams
  for each row execute function public.set_updated_at();

-- Exam codes (SP-0001, WR-0002...) come from one sequence shared by both skills, so two exams can never get the same code.
create sequence private.exam_code_seq;

-- Triggers run as the inserting admin, whose role needs nextval.
grant usage on sequence private.exam_code_seq to authenticated;

-- Every insert gets a generated code and updates keep the old one, whatever the client sends.
create function private.set_exam_code()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.code := case new.skill when 'speaking' then 'SP' else 'WR' end
      || '-' || lpad(nextval('private.exam_code_seq')::text, 4, '0');
  else
    new.code := old.code;
  end if;
  return new;
end;
$$;

create trigger exams_set_code
  before insert or update of code on public.exams
  for each row execute function private.set_exam_code();

alter table public.exams enable row level security;

create policy "Anon can read published exams"
  on public.exams for select to anon
  using (status = 'published');

create policy "Users can read published exams, admins all"
  on public.exams for select to authenticated
  using (status = 'published' or (select private.is_admin()));

create policy "Admins can insert exams"
  on public.exams for insert to authenticated
  with check ((select private.is_admin()));

create policy "Admins can update exams"
  on public.exams for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete exams"
  on public.exams for delete to authenticated
  using ((select private.is_admin()));

create table public.exam_parts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  part_template_id smallint not null references public.part_templates (id) on delete restrict,
  description text,
  context text,
  context_media_path text,
  unique (exam_id, part_template_id)
);

create index exam_parts_part_template_id_idx on public.exam_parts (part_template_id);

alter table public.exam_parts enable row level security;

-- Visibility follows the parent exam's RLS.
create policy "Read parts of visible exams"
  on public.exam_parts for select to anon, authenticated
  using (exists (select 1 from public.exams e where e.id = exam_id));

create policy "Admins can insert exam parts"
  on public.exam_parts for insert to authenticated
  with check ((select private.is_admin()));

create policy "Admins can update exam parts"
  on public.exam_parts for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete exam parts"
  on public.exam_parts for delete to authenticated
  using ((select private.is_admin()));

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_part_id uuid not null references public.exam_parts (id) on delete cascade,
  number smallint not null check (number > 0),
  -- Null for Writing Q6–7 (part template 7): their directions live inside the e-mail (stimulus).
  prompt text,
  stimulus text,
  image_path text,
  image_alt text,
  audio_path text,
  keywords jsonb,
  sample_answer text,
  unique (exam_part_id, number)
);

alter table public.questions enable row level security;

-- Visibility follows exam_parts -> exams RLS.
create policy "Read questions of visible exams"
  on public.questions for select to anon, authenticated
  using (exists (select 1 from public.exam_parts ep where ep.id = exam_part_id));

create policy "Admins can insert questions"
  on public.questions for insert to authenticated
  with check ((select private.is_admin()));

create policy "Admins can update questions"
  on public.questions for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete questions"
  on public.questions for delete to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Mistake book content (catalog rows seeded at the end of this file)
-- ---------------------------------------------------------------------------

create table public.mistake_patterns (
  id uuid primary key default gen_random_uuid(),
  skill public.skill not null,
  part_template_id smallint references public.part_templates (id) on delete restrict,
  title text not null,
  summary text not null,
  why text not null,
  criteria public.criterion[] not null default '{}',
  severity public.severity not null,
  impact text not null,
  remedy jsonb not null
);

create index mistake_patterns_part_template_id_idx on public.mistake_patterns (part_template_id);

alter table public.mistake_patterns enable row level security;

create policy "Anyone can read mistake patterns"
  on public.mistake_patterns for select to anon, authenticated
  using (true);

create policy "Admins can insert mistake patterns"
  on public.mistake_patterns for insert to authenticated
  with check ((select private.is_admin()));

create policy "Admins can update mistake patterns"
  on public.mistake_patterns for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete mistake patterns"
  on public.mistake_patterns for delete to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Attempts: owner starts/submits, scoring columns are written by service role only.
-- ---------------------------------------------------------------------------

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  exam_id uuid not null references public.exams (id) on delete restrict,
  part_template_id smallint references public.part_templates (id) on delete restrict,
  mode public.attempt_mode not null,
  status public.attempt_status not null default 'in_progress',
  sample_viewed boolean not null default false,
  started_at timestamptz not null default now(),
  ends_at timestamptz,
  submitted_at timestamptz,
  -- When the current scoring run started: the Writing scoring route claims an attempt (submitted -> scoring) and may
  -- reclaim it only when a run is stale (crashed or timed out), so two runs never score the same attempt at once.
  scoring_started_at timestamptz,
  scored_at timestamptz,
  score smallint check (score between 0 and 200),
  feedback_summary text,
  scoring_error text
);

create index attempts_user_id_started_at_idx on public.attempts (user_id, started_at desc);
create index attempts_exam_id_idx on public.attempts (exam_id);
create index attempts_part_template_id_idx on public.attempts (part_template_id);

revoke insert, update on public.attempts from anon, authenticated;
grant insert (exam_id, part_template_id, mode) on public.attempts to authenticated;
grant update (status, sample_viewed, submitted_at) on public.attempts to authenticated;

alter table public.attempts enable row level security;

create policy "Users can read own attempts"
  on public.attempts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can start attempts on visible exams"
  on public.attempts for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.exams e where e.id = exam_id)
  );

-- Only in-progress attempts can change, and only to a client-reachable status. A student who left mid-exam
-- (interrupted) can come back: the exam room sets it back to in_progress. Scored/submitted attempts stay locked.
create policy "Users can update own in-progress attempts"
  on public.attempts for update to authenticated
  using ((select auth.uid()) = user_id and status in ('in_progress', 'interrupted'))
  with check ((select auth.uid()) = user_id and status in ('in_progress', 'submitted', 'interrupted'));

-- Clients cannot write ends_at (not granted), so the deadline is set here and a student cannot extend their own timer.
-- Parts with a shared section_sec use it; otherwise the deadline is the sum of the per-question response_sec, which
-- the exam room splits per question from started_at.
create function public.set_attempt_ends_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.ends_at := case
    when new.mode = 'guided' then null
    else new.started_at + make_interval(secs => (
      select coalesce(pt.section_sec, (select sum(sec) from unnest(pt.response_sec) as sec))
      from public.part_templates pt
      where pt.id = new.part_template_id
    ))
  end;
  return new;
end;
$$;

create trigger attempts_set_ends_at
  before insert on public.attempts
  for each row execute function public.set_attempt_ends_at();

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete restrict,
  text_answer text,
  audio_path text,
  transcript text,
  score smallint check (score >= 0),
  max_score smallint check (max_score > 0),
  metrics jsonb not null default '{}',
  strengths jsonb not null default '[]',
  -- Written by the scoring route (service role) only.
  feedback text,
  scoring_model text,
  updated_at timestamptz not null default now(),
  unique (attempt_id, question_id),
  check (score <= max_score)
);

create index responses_question_id_idx on public.responses (question_id);

create trigger responses_set_updated_at
  before update on public.responses
  for each row execute function public.set_updated_at();

revoke insert, update on public.responses from anon, authenticated;
grant insert (attempt_id, question_id, text_answer, audio_path) on public.responses to authenticated;
grant update (text_answer, audio_path) on public.responses to authenticated;

alter table public.responses enable row level security;

create policy "Users can read own responses"
  on public.responses for select to authenticated
  using (exists (select 1 from public.attempts a where a.id = attempt_id));

create policy "Users can answer own in-progress attempts"
  on public.responses for insert to authenticated
  with check (exists (
    select 1 from public.attempts a
    where a.id = attempt_id and a.user_id = (select auth.uid()) and a.status = 'in_progress'
  ));

create policy "Users can edit answers of own in-progress attempts"
  on public.responses for update to authenticated
  using (exists (
    select 1 from public.attempts a
    where a.id = attempt_id and a.user_id = (select auth.uid()) and a.status = 'in_progress'
  ))
  with check (exists (
    select 1 from public.attempts a
    where a.id = attempt_id and a.user_id = (select auth.uid()) and a.status = 'in_progress'
  ));

-- Written by the scoring service (service role) only.
create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.responses (id) on delete cascade,
  mistake_pattern_id uuid references public.mistake_patterns (id) on delete set null,
  start_offset integer not null check (start_offset >= 0),
  end_offset integer not null,
  quote text not null,
  correction text not null,
  explanation text not null,
  criterion public.criterion not null,
  severity public.severity not null,
  at_sec real check (at_sec >= 0),
  check (end_offset > start_offset)
);

create index annotations_response_id_idx on public.annotations (response_id);
create index annotations_mistake_pattern_id_idx on public.annotations (mistake_pattern_id);

alter table public.annotations enable row level security;

create policy "Users can read annotations on own responses"
  on public.annotations for select to authenticated
  using (exists (select 1 from public.responses r where r.id = response_id));

create table public.bookmarks (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  exam_id uuid not null references public.exams (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, exam_id)
);

create index bookmarks_exam_id_idx on public.bookmarks (exam_id);

alter table public.bookmarks enable row level security;

create policy "Users can read own bookmarks"
  on public.bookmarks for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can bookmark visible exams"
  on public.bookmarks for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.exams e where e.id = exam_id)
  );

create policy "Users can delete own bookmarks"
  on public.bookmarks for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Lượt làm của mọi người dùng theo đề, cho trang quản lý đề.
-- View chạy với quyền owner (không security_invoker) để đếm qua RLS của attempts; chỉ admin thấy dòng nào.
create view public.exam_stats as
select
  exam_id,
  count(*)::int as attempt_count,
  round(100.0 * count(*) filter (where status in ('submitted', 'scoring', 'scored')) / count(*))::int as completion_rate
from public.attempts
where (select private.is_admin())
group by exam_id;

revoke all on public.exam_stats from public, anon, authenticated;
grant select on public.exam_stats to authenticated;

-- ---------------------------------------------------------------------------
-- Scoring quota (docs/prd/scoring.md)
-- ---------------------------------------------------------------------------

-- Answers scored per subject per day ('user:<uuid>' or 'ip:<sha256>'), so guests cannot drain the free provider quota.
create table public.scoring_usage (
  subject text not null,
  day date not null,
  used integer not null default 0 check (used >= 0),
  primary key (subject, day)
);

alter table public.scoring_usage enable row level security;
revoke all on public.scoring_usage from anon, authenticated;

-- Counts one scored answer and returns false once the subject has reached p_limit today (Vietnam time).
-- Atomic under concurrency: the conditional upsert only increments while below the limit.
create function public.consume_scoring_quota(p_subject text, p_limit integer)
returns boolean
language sql
set search_path = ''
as $$
  with bumped as (
    insert into public.scoring_usage as u (subject, day, used)
    values (p_subject, (now() at time zone 'Asia/Ho_Chi_Minh')::date, 1)
    on conflict (subject, day) do update set used = u.used + 1
      where u.used < p_limit
    returning 1
  )
  select exists (select 1 from bumped) and p_limit > 0;
$$;

revoke execute on function public.consume_scoring_quota(text, integer) from public, anon, authenticated;
grant execute on function public.consume_scoring_quota(text, integer) to service_role;

-- Gives back one answer of today's scoring quota when scoring failed (provider error), so retries do not drain it.
create function public.refund_scoring_quota(p_subject text)
returns void
language sql
set search_path = ''
as $$
  update public.scoring_usage
  set used = used - 1
  where subject = p_subject
    and day = (now() at time zone 'Asia/Ho_Chi_Minh')::date
    and used > 0;
$$;

revoke execute on function public.refund_scoring_quota(text) from public, anon, authenticated;
grant execute on function public.refund_scoring_quota(text) to service_role;

-- ---------------------------------------------------------------------------
-- Study plan
-- ---------------------------------------------------------------------------

create table public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  minutes_per_day smallint not null check (minutes_per_day between 1 and 1440),
  days_per_week smallint not null check (days_per_week between 1 and 7),
  status public.plan_status not null default 'active',
  ai_rationale text,
  created_at timestamptz not null default now()
);

create index study_plans_user_id_idx on public.study_plans (user_id);

alter table public.study_plans enable row level security;

create policy "Users can read own plans"
  on public.study_plans for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own plans"
  on public.study_plans for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own plans"
  on public.study_plans for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own plans"
  on public.study_plans for delete to authenticated
  using ((select auth.uid()) = user_id);

create table public.study_plan_weeks (
  plan_id uuid not null references public.study_plans (id) on delete cascade,
  week_no smallint not null check (week_no > 0),
  theme text not null,
  primary key (plan_id, week_no)
);

alter table public.study_plan_weeks enable row level security;

-- Ownership follows study_plans RLS.
create policy "Users can read weeks of own plans"
  on public.study_plan_weeks for select to authenticated
  using (exists (select 1 from public.study_plans p where p.id = plan_id));

create policy "Users can add weeks to own plans"
  on public.study_plan_weeks for insert to authenticated
  with check (exists (select 1 from public.study_plans p where p.id = plan_id));

create policy "Users can update weeks of own plans"
  on public.study_plan_weeks for update to authenticated
  using (exists (select 1 from public.study_plans p where p.id = plan_id))
  with check (exists (select 1 from public.study_plans p where p.id = plan_id));

create policy "Users can delete weeks of own plans"
  on public.study_plan_weeks for delete to authenticated
  using (exists (select 1 from public.study_plans p where p.id = plan_id));

create table public.plan_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.study_plans (id) on delete cascade,
  scheduled_date date not null,
  sort_order smallint not null default 0,
  kind public.plan_task_kind not null,
  title text not null,
  description text,
  goal text,
  duration_min smallint not null check (duration_min > 0),
  exam_id uuid references public.exams (id) on delete set null,
  part_template_id smallint references public.part_templates (id) on delete restrict,
  mistake_pattern_id uuid references public.mistake_patterns (id) on delete set null,
  attempt_id uuid unique references public.attempts (id) on delete set null,
  completed_at timestamptz
);

create index plan_tasks_plan_id_date_idx on public.plan_tasks (plan_id, scheduled_date, sort_order);
create index plan_tasks_exam_id_idx on public.plan_tasks (exam_id);
create index plan_tasks_part_template_id_idx on public.plan_tasks (part_template_id);
create index plan_tasks_mistake_pattern_id_idx on public.plan_tasks (mistake_pattern_id);

alter table public.plan_tasks enable row level security;

-- Ownership follows study_plans RLS; a linked attempt must be the caller's own (attempts RLS).
create policy "Users can read tasks of own plans"
  on public.plan_tasks for select to authenticated
  using (exists (select 1 from public.study_plans p where p.id = plan_id));

create policy "Users can add tasks to own plans"
  on public.plan_tasks for insert to authenticated
  with check (
    exists (select 1 from public.study_plans p where p.id = plan_id)
    and (attempt_id is null or exists (select 1 from public.attempts a where a.id = attempt_id))
  );

create policy "Users can update tasks of own plans"
  on public.plan_tasks for update to authenticated
  using (exists (select 1 from public.study_plans p where p.id = plan_id))
  with check (
    exists (select 1 from public.study_plans p where p.id = plan_id)
    and (attempt_id is null or exists (select 1 from public.attempts a where a.id = attempt_id))
  );

create policy "Users can delete tasks of own plans"
  on public.plan_tasks for delete to authenticated
  using (exists (select 1 from public.study_plans p where p.id = plan_id));

-- AI-generated insight cache, written by service role only.
create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  payload jsonb not null,
  generated_at timestamptz not null default now()
);

create index ai_insights_user_id_generated_at_idx on public.ai_insights (user_id, generated_at desc);

alter table public.ai_insights enable row level security;

create policy "Users can read own insights"
  on public.ai_insights for select to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- Create an exam with its parts and questions in one transaction (admin exam builder).
-- Security invoker: the inserts go through the admin-only RLS policies on exams, exam_parts and questions.
create function public.create_exam(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  exam_skill public.skill := (payload->>'skill')::public.skill;
  new_exam_id uuid;
  new_part_id uuid;
  part jsonb;
begin
  -- New exams always start as internal drafts owned by the caller; the code is filled by exams_set_code.
  insert into public.exams (skill, code, title, topic, created_by)
  values (
    exam_skill,
    '',
    payload->>'title',
    payload->>'topic',
    (select auth.uid())
  )
  returning id into new_exam_id;

  for part in select value from jsonb_array_elements(coalesce(payload->'parts', '[]')) loop
    insert into public.exam_parts (exam_id, part_template_id, context)
    values (new_exam_id, (part->>'part_template_id')::smallint, part->>'context')
    returning id into new_part_id;

    insert into public.questions (exam_part_id, number, prompt, stimulus, image_path, image_alt, keywords, sample_answer)
    select new_part_id, q.number, q.prompt, q.stimulus, q.image_path, q.image_alt, q.keywords, q.sample_answer
    from jsonb_to_recordset(coalesce(part->'questions', '[]'))
      as q(number smallint, prompt text, stimulus text, image_path text, image_alt text, keywords jsonb, sample_answer text);
  end loop;

  -- Every part template of the skill must appear with exactly its question numbers, and nothing else.
  if exists (
    select 1
    from public.part_templates pt
    where pt.skill = exam_skill
      and array(
        select q.number::int
        from public.exam_parts ep
        join public.questions q on q.exam_part_id = ep.id
        where ep.exam_id = new_exam_id and ep.part_template_id = pt.id
        order by q.number
      ) is distinct from array(select generate_series(pt.q_from::int, pt.q_to::int))
  ) or exists (
    select 1
    from public.exam_parts ep
    join public.part_templates pt on pt.id = ep.part_template_id
    where ep.exam_id = new_exam_id and pt.skill <> exam_skill
  ) then
    raise exception 'exam structure does not match the % part templates', exam_skill
      using errcode = '22023';
  end if;

  return new_exam_id;
end;
$$;

revoke execute on function public.create_exam(jsonb) from public, anon;
grant execute on function public.create_exam(jsonb) to authenticated;

-- Edit an exam in one transaction (docs/prd/exam-edit.md). General info is always editable; part contexts and
-- questions only while nobody has attempted the exam, so past attempts keep matching what was asked.

-- Security definer: attempts RLS only shows the caller's own rows, but the check must see every user's attempts.
create function private.exam_has_attempts(target_exam_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (select 1 from public.attempts a where a.exam_id = target_exam_id);
$$;

revoke execute on function private.exam_has_attempts(uuid) from public, anon;
grant execute on function private.exam_has_attempts(uuid) to authenticated;

create function public.update_exam(target_exam_id uuid, payload jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  part jsonb;
  target_part_id uuid;
  updated_count int;
begin
  -- RLS would silently update zero rows for non-admins; fail loudly instead.
  if not (select private.is_admin()) then
    raise exception 'only admins can edit exams' using errcode = '42501';
  end if;

  update public.exams
  set title = payload->>'title',
      topic = payload->>'topic'
  where id = target_exam_id;
  if not found then
    raise exception 'exam not found' using errcode = 'P0002';
  end if;

  if not (payload ? 'parts') then
    return;
  end if;

  if private.exam_has_attempts(target_exam_id) then
    raise exception 'exam has attempts, only general info can change' using errcode = '55006';
  end if;

  -- The part/question skeleton is fixed by the templates: every existing part and question must be sent back.
  if jsonb_array_length(payload->'parts') <> (select count(*) from public.exam_parts ep where ep.exam_id = target_exam_id) then
    raise exception 'exam structure does not match' using errcode = '22023';
  end if;

  for part in select value from jsonb_array_elements(payload->'parts') loop
    update public.exam_parts ep
    set context = part->>'context'
    where ep.exam_id = target_exam_id and ep.part_template_id = (part->>'part_template_id')::smallint
    returning ep.id into target_part_id;
    if target_part_id is null then
      raise exception 'exam structure does not match' using errcode = '22023';
    end if;

    update public.questions qu
    set prompt = q.prompt,
        stimulus = q.stimulus,
        image_path = q.image_path,
        image_alt = q.image_alt,
        keywords = q.keywords,
        sample_answer = q.sample_answer
    from jsonb_to_recordset(coalesce(part->'questions', '[]'))
      as q(number smallint, prompt text, stimulus text, image_path text, image_alt text, keywords jsonb, sample_answer text)
    where qu.exam_part_id = target_part_id and qu.number = q.number;
    get diagnostics updated_count = row_count;

    if updated_count <> jsonb_array_length(coalesce(part->'questions', '[]'))
      or updated_count <> (select count(*) from public.questions qu where qu.exam_part_id = target_part_id) then
      raise exception 'exam structure does not match' using errcode = '22023';
    end if;
    target_part_id := null;
  end loop;
end;
$$;

revoke execute on function public.update_exam(uuid, jsonb) from public, anon;
grant execute on function public.update_exam(uuid, jsonb) to authenticated;

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

-- ---------------------------------------------------------------------------
-- Seed: mistake pattern catalog
-- ---------------------------------------------------------------------------

-- Mistake pattern catalog (docs/prd/mistake-patterns.md, E7-3).
-- Fixed uuids: writing scoring links annotations to these rows, and the study plan links review tasks to them.
-- Speaking rows are kept for later: speaking scoring does not link annotations yet.
insert into public.mistake_patterns
  (id, skill, part_template_id, title, summary, why, criteria, severity, impact, remedy)
values
  (
    '00000000-0000-4000-8000-000000000001', 'speaking', 2,
    'Thiếu cụm từ chỉ vị trí khi mô tả hậu cảnh',
    'Mô tả nhân vật chính khá tốt nhưng chuyển sang hậu cảnh mà không định vị không gian, khiến bài nói rời rạc như đang liệt kê.',
    'Ở Q3-4, giám khảo đánh giá khả năng tổ chức nội dung theo không gian. Thiếu cụm định vị (in the background, on the left...) làm các câu rời rạc, kéo tiêu chí Từ vựng và Mạch lạc xuống — câu thường dừng ở 2/3 dù ngữ pháp đúng.',
    '{vocabulary,cohesion}', 'high', 'Thường giữ câu ở mức 2/3 thay vì 3/3',
    '{"rule":"Mỗi câu mô tả một vùng của bức tranh phải mở đầu bằng một cụm định vị.","steps":["Chia tranh thành 3 vùng: trung tâm → hai bên → hậu cảnh.","Trong 45 giây chuẩn bị, chọn trước một cụm định vị cho từng vùng.","Nói cụm định vị trước, sau đó mới đến chủ ngữ và động từ.","Kết thúc bằng một câu nhận xét chung về không khí bức tranh."],"phrases":[{"phrase":"In the foreground,","usage":"Người/vật ở gần, phía trước"},{"phrase":"In the background,","usage":"Cảnh phía sau, ở xa"},{"phrase":"On the left side of the picture,","usage":"Hai bên tranh"},{"phrase":"In the upper right corner,","usage":"Các góc tranh"},{"phrase":"Next to / Behind / Across from ...","usage":"Vị trí tương quan giữa hai đối tượng"}],"model":{"before":"There are many people walking.","after":"In the background, there are many people walking across the street."},"checklist":["Có ít nhất 3 cụm định vị khác nhau","Có nhắc tới hậu cảnh","Không mở đầu 2 câu liên tiếp bằng \"There is/are\""]}'
  ),
  (
    '00000000-0000-4000-8000-000000000002', 'writing', 7,
    'Bỏ sót một nhiệm vụ bắt buộc trong email',
    'Trả lời kỹ nhiệm vụ đầu tiên nhưng thiếu nhiệm vụ còn lại mà phần Directions chỉ định (thường là yêu cầu hoặc câu hỏi thứ hai).',
    'Q6-7 chấm trên thang 0-4, trong đó hoàn thành đủ các nhiệm vụ đề yêu cầu là điều kiện tiên quyết. Thiếu một nhiệm vụ, bài tối đa chỉ đạt 2/4 dù câu văn tốt đến đâu.',
    '{completeness,organization}', 'high', 'Giới hạn điểm câu tối đa 2/4',
    '{"rule":"Gạch chân và đánh số mọi nhiệm vụ trong Directions trước khi viết.","steps":["Đọc Directions, đánh số từng nhiệm vụ (số vấn đề, số câu hỏi, số yêu cầu).","Viết mỗi nhiệm vụ thành một đoạn ngắn riêng.","Mở đầu mỗi nhiệm vụ bằng một từ báo hiệu riêng.","Dành 1 phút cuối đối chiếu số nhiệm vụ đã viết với Directions."],"phrases":[{"phrase":"Could you please let me know ...?","usage":"Đặt câu hỏi lịch sự"},{"phrase":"I would also appreciate it if you could ...","usage":"Đưa thêm một yêu cầu"},{"phrase":"In addition, I would like to request ...","usage":"Chuyển sang nhiệm vụ mới"},{"phrase":"First, ... Second, ...","usage":"Tách hai thông tin hoặc hai câu hỏi"}],"model":{"before":"Could you tell me the exact new delivery date? I look forward to hearing from you.","after":"Could you tell me the exact new delivery date? In addition, I would appreciate it if you could refund the shipping fee for this order. I look forward to hearing from you."},"checklist":["Số nhiệm vụ đã viết bằng số nhiệm vụ trong Directions","Mỗi nhiệm vụ có từ báo hiệu riêng","Có lời chào và kết thư phù hợp"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000003', 'speaking', null,
    'Nuốt âm cuối của đuôi -s và -ed',
    'Âm cuối của danh từ số nhiều và động từ quá khứ thường bị bỏ, khiến "results" nghe như "result", "returned" nghe như "return".',
    'Âm cuối mang thông tin ngữ pháp (số nhiều, thì quá khứ, ngôi thứ ba). Khi bị nuốt, giám khảo không phân biệt được bạn nói đúng hay sai ngữ pháp, và tiêu chí Phát âm bị chấm thấp ở mọi câu, kể cả Q1-2.',
    '{pronunciation}', 'medium', 'Ảnh hưởng tiêu chí Phát âm ở cả 11 câu',
    '{"rule":"Phát âm rõ phụ âm cuối trước khi chuyển sang từ tiếp theo, đặc biệt khi từ sau bắt đầu bằng phụ âm.","steps":["Khi chuẩn bị Q1-2, đánh dấu mọi từ có đuôi -s/-es/-ed.","Luyện nối âm: phụ âm cuối + nguyên âm đầu của từ sau (\"helps us\" → \"help-sus\").","Ghi âm, nghe lại ở tốc độ 0.75x và so với audio mẫu."],"phrases":[{"phrase":"results /rɪˈzʌlts/","usage":"Cụm phụ âm cuối /ts/"},{"phrase":"answers /ˈɑːnsərz/","usage":"Đuôi -s đọc là /z/"},{"phrase":"returned /rɪˈtɜːrnd/","usage":"Đuôi -ed đọc là /d/"},{"phrase":"finished /ˈfɪnɪʃt/","usage":"Đuôi -ed đọc là /t/"}],"model":{"before":"or return product, please press two","after":"or returned products, please press two"},"checklist":["Đọc chậm lại ở từ có đuôi -s/-ed","Không bỏ âm cuối khi nói nhanh ở cuối câu"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000004', 'speaking', 5,
    'Nêu quan điểm nhưng thiếu ví dụ cụ thể',
    'Lý do được nêu đúng nhưng chỉ nhắc lại ý chung chung, không có trải nghiệm hay tình huống cụ thể nào để chứng minh.',
    'Q11 chấm trên thang 0-5. Để đạt 4-5, quan điểm phải được hỗ trợ bằng lý do và ví dụ phù hợp. Diễn đạt lại lý do bằng từ khác không được tính là ví dụ, nên bài dễ dừng ở mức 3.',
    '{support,relevance}', 'high', 'Giữ điểm Q11 ở mức 3/5',
    '{"rule":"Mỗi lý do cần đi kèm một ví dụ có chi tiết: ai, ở đâu, chuyện gì xảy ra.","steps":["Trong 45 giây chuẩn bị, chọn 1 quan điểm, 2 lý do và 1 ví dụ cá nhân.","Nói theo khung: Quan điểm → Lý do 1 → Ví dụ → Lý do 2 → Kết luận.","Đưa mốc thời gian hoặc con số vào ví dụ để tăng độ thuyết phục."],"phrases":[{"phrase":"For example, when I ...,","usage":"Mở ví dụ trải nghiệm cá nhân"},{"phrase":"From my own experience, ...","usage":"Dẫn chứng từ bản thân"},{"phrase":"This is why I believe ...","usage":"Nối ví dụ về lại quan điểm"}],"model":{"before":"Training in person is better because it is more interactive.","after":"For example, when I joined my company, I attended a three-day workshop where I practiced with real customer cases and got feedback immediately."},"checklist":["Có ít nhất 1 ví dụ với chi tiết cụ thể","Ví dụ liên quan trực tiếp tới lý do vừa nêu","Câu kết nhắc lại quan điểm"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000005', 'writing', null,
    'Thiếu hoặc dùng sai mạo từ a/an/the',
    'Danh từ đếm được số ít thường bị thiếu mạo từ, hoặc dùng "the" cho đối tượng mới nhắc tới lần đầu.',
    'Lỗi mạo từ hiếm khi làm sai nghĩa nhưng lặp lại nhiều lần sẽ kéo tiêu chí Ngữ pháp xuống, đặc biệt ở Q1-5 nơi mỗi câu chỉ có một câu văn để đánh giá.',
    '{grammar}', 'medium', 'Có thể mất 1 điểm mỗi câu ở Q1-5',
    '{"rule":"Danh từ đếm được số ít luôn cần một từ hạn định (a/an/the/my/this...).","steps":["Viết xong, rà lại từng danh từ số ít trong câu.","Lần đầu nhắc tới: a/an. Từ lần thứ hai hoặc khi đã xác định: the.","Danh từ không đếm được (information, equipment, advice) không dùng a/an."],"phrases":[{"phrase":"a desk lamp → the lamp","usage":"Lần đầu dùng \"a\", lần sau dùng \"the\""},{"phrase":"an urgent request","usage":"\"an\" đứng trước âm nguyên âm"},{"phrase":"some information","usage":"Danh từ không đếm được, không dùng \"an\""}],"model":{"before":"Bicycle is parked next to a street lamp.","after":"A bicycle is parked next to a street lamp."},"checklist":["Mọi danh từ đếm được số ít đều có từ hạn định","Không dùng a/an với danh từ không đếm được"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000006', 'speaking', null,
    'Ngập ngừng và dùng từ đệm "uhm, ah" giữa câu',
    'Khoảng lặng dài và từ đệm xuất hiện giữa câu khi đang tìm từ, làm bài nói thiếu tự nhiên.',
    'Ngập ngừng làm giảm độ trôi chảy và dễ khiến bạn hết giờ trước khi nói đủ ý, ảnh hưởng tiêu chí Mạch lạc và Ngữ điệu.',
    '{cohesion,intonation}', 'low', 'Giảm độ trôi chảy, dễ hết giờ',
    '{"rule":"Thay khoảng lặng bằng cụm câu giờ tự nhiên thay vì \"uhm\".","steps":["Học thuộc 3-4 cụm câu giờ tự nhiên.","Nói theo cụm ý ngắn thay vì câu dài phức tạp.","Luyện nói 30 giây liên tục với đồng hồ đếm ngược."],"phrases":[{"phrase":"Let me think...","usage":"Câu giờ khi cần ý tiếp theo"},{"phrase":"What I mean is ...","usage":"Diễn đạt lại khi bí từ"},{"phrase":"Another thing is ...","usage":"Chuyển ý mượt"}],"model":{"before":"For questions about online orders, uhm, deliveries...","after":"For questions about online orders, deliveries..."},"checklist":["Không có khoảng lặng quá 3 giây","Từ đệm không quá 2 lần mỗi câu"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000007', 'writing', 6,
    'Thiếu hoặc dùng sai từ bắt buộc',
    'Câu bỏ sót một trong hai từ đề cho, hoặc dùng từ đó sai nghĩa, sai từ loại nên không được tính là đã dùng.',
    'Ở Q1-5, thiếu hoặc dùng sai một từ bắt buộc thì câu tối đa chỉ đạt 1/3, dù phần còn lại đúng ngữ pháp và khớp tranh.',
    '{task_response,vocabulary}', 'high', 'Giới hạn điểm câu tối đa 1/3',
    '{"rule":"Đưa đủ cả hai từ bắt buộc vào một câu; được đổi dạng (số nhiều, thì, -ing) nhưng phải giữ nghĩa và đúng vai trò trong câu.","steps":["Xác định từ loại của từng từ: danh từ, động từ, giới từ hay liên từ.","Dựng khung câu quanh từ khó hơn trước, ví dụ liên từ \"because\", \"while\" cần hai mệnh đề.","Viết xong, gạch chân hai từ bắt buộc trong câu để chắc chắn không sót."],"phrases":[{"phrase":"woman / carry → A woman is carrying a box.","usage":"Động từ chia ở -ing vẫn được tính"},{"phrase":"because → ... because it is raining.","usage":"Liên từ phải nối hai mệnh đề"},{"phrase":"next to → ... next to the window.","usage":"Giới từ đi với cụm danh từ"}],"model":{"before":"The man is reading in the park.","after":"The man is reading a newspaper while he waits in the park."},"checklist":["Có đủ cả hai từ bắt buộc","Mỗi từ dùng đúng nghĩa và đúng từ loại"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000008', 'writing', 6,
    'Câu không khớp với nội dung bức tranh',
    'Câu đúng ngữ pháp và đủ từ bắt buộc nhưng mô tả chi tiết không có hoặc trái với tranh.',
    'Rubric Q1-5 yêu cầu câu phải phù hợp với tranh. Câu mô tả sai người, vật hoặc hành động bị chấm 1/3 dù viết đúng.',
    '{relevance}', 'high', 'Kéo câu xuống 1/3',
    '{"rule":"Chỉ viết điều nhìn thấy rõ trong tranh; không đoán cảm xúc, nghề nghiệp hay chuyện sắp xảy ra.","steps":["Nhìn tranh trước, chọn một hành động hoặc vị trí rõ ràng nhất.","Ghép hai từ bắt buộc vào đúng chi tiết đó.","Đọc lại câu và đối chiếu từng danh từ với tranh."],"phrases":[{"phrase":"A man is ...-ing ...","usage":"Mô tả hành động đang diễn ra"},{"phrase":"There are several ... on the ...","usage":"Mô tả vật và vị trí"},{"phrase":"... is placed next to ...","usage":"Quan hệ vị trí giữa hai vật"}],"model":{"before":"The woman is going to buy a new car.","after":"The woman is looking at a car in the showroom."},"checklist":["Mọi người, vật trong câu đều có trong tranh","Không đoán điều tranh không thể hiện"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000009', 'writing', 6,
    'Câu cụt hoặc viết thành nhiều câu',
    'Bài chỉ là một cụm từ thiếu động từ chính, nối hai mệnh đề bằng dấu phẩy, hoặc viết hai câu thay vì một.',
    'Q1-5 yêu cầu đúng MỘT câu hoàn chỉnh. Câu thiếu động từ chính hay nối sai mệnh đề là lỗi ngữ pháp, khiến câu khó đạt 3/3.',
    '{grammar}', 'medium', 'Thường mất 1 điểm ở câu đó',
    '{"rule":"Một câu = chủ ngữ + động từ chia thì; muốn thêm ý thì nối bằng liên từ, không dùng dấu phẩy.","steps":["Tìm chủ ngữ và động từ chính của câu.","Có hai mệnh đề thì nối bằng and, but, because, while... hoặc bỏ bớt một ý.","Kiểm tra cả bài chỉ có một dấu chấm, ở cuối."],"phrases":[{"phrase":"..., and ...","usage":"Nối hai hành động ngang hàng"},{"phrase":"... while ...","usage":"Hai việc xảy ra cùng lúc"},{"phrase":"..., holding a ...","usage":"Rút gọn ý thứ hai bằng -ing"}],"model":{"before":"Two men in the office, talking about a plan.","after":"Two men are talking about a plan in the office."},"checklist":["Có động từ chính chia thì","Chỉ có một câu","Không nối hai mệnh đề bằng dấu phẩy"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000010', 'writing', 7,
    'Giọng văn email không phù hợp',
    'Email quá suồng sã hoặc cộc lốc với người nhận cần trang trọng, thiếu lời chào, lời kết hoặc câu nêu mục đích.',
    'Rubric Q6-7 yêu cầu giọng văn và cách xưng hô phù hợp với người nhận. Giọng không phù hợp kéo bài xuống 2/4 kể cả khi đủ nhiệm vụ.',
    '{organization,vocabulary}', 'medium', 'Có thể kéo câu xuống 2/4',
    '{"rule":"Viết cho khách hàng, đối tác hoặc người lạ thì dùng giọng lịch sự, có mở thư và kết thư rõ ràng.","steps":["Xác định người nhận: khách hàng, đồng nghiệp hay cấp trên.","Mở thư bằng lời chào và một câu nêu lý do viết.","Dùng câu yêu cầu lịch sự thay vì câu mệnh lệnh.","Kết thư bằng câu cảm ơn và tên người gửi."],"phrases":[{"phrase":"Dear Mr. Smith,","usage":"Chào trang trọng"},{"phrase":"I am writing to ...","usage":"Nêu mục đích thư"},{"phrase":"Would it be possible to ...?","usage":"Yêu cầu lịch sự"},{"phrase":"Thank you for your time. Best regards,","usage":"Kết thư"}],"model":{"before":"Send me the price list now.","after":"Could you please send me the latest price list at your earliest convenience?"},"checklist":["Có lời chào và lời kết","Không có câu mệnh lệnh cộc lốc","Không dùng từ lóng hoặc viết tắt"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000011', 'writing', 8,
    'Không nêu rõ quan điểm trong bài luận',
    'Bài bàn cả hai phía nhưng không chốt mình đồng ý hay không, hoặc đến cuối bài mới nói quan điểm.',
    'Q8 chấm khả năng nêu, giải thích và bảo vệ quan điểm. Không có quan điểm rõ thì các lý do mất phương hướng, bài khó vượt 3/5.',
    '{task_response,organization}', 'high', 'Giữ điểm Q8 ở mức 3/5',
    '{"rule":"Nêu quan điểm ngay trong đoạn mở bài và nhắc lại ở kết bài.","steps":["Đọc đề, chọn một phía trong 1 phút, kể cả khi thấy cả hai đều có lý.","Câu cuối mở bài nêu quan điểm và hai lý do chính.","Mỗi đoạn thân bài mở đầu bằng câu chủ đề nối về quan điểm.","Kết bài nhắc lại quan điểm bằng cách diễn đạt khác."],"phrases":[{"phrase":"I strongly believe that ...","usage":"Nêu quan điểm"},{"phrase":"In my opinion, ... for two reasons.","usage":"Quan điểm kèm số lý do"},{"phrase":"For these reasons, I am convinced that ...","usage":"Nhắc lại ở kết bài"}],"model":{"before":"There are many advantages and disadvantages of working from home.","after":"I believe working from home benefits both employees and companies for two main reasons."},"checklist":["Quan điểm xuất hiện trong mở bài","Mọi lý do đều ủng hộ cùng một phía","Kết bài nhắc lại quan điểm"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000012', 'writing', 8,
    'Lý do thiếu ví dụ hoặc chi tiết cụ thể',
    'Lý do chỉ được nêu chung chung hoặc diễn đạt lại bằng từ khác, không có ví dụ, số liệu hay trải nghiệm để chứng minh.',
    'Để đạt 4-5 ở Q8, lý do phải được giải thích bằng ví dụ hoặc chi tiết liên quan. Ví dụ thiếu hoặc không phù hợp là đặc điểm của bài 2-3 điểm.',
    '{support}', 'high', 'Thường giữ Q8 ở mức 3/5',
    '{"rule":"Mỗi đoạn thân bài: lý do → giải thích → ví dụ cụ thể (ai, ở đâu, kết quả gì).","steps":["Lập dàn ý: mỗi lý do ghi ngay một ví dụ trước khi viết.","Ưu tiên ví dụ từ công việc, học tập hoặc trải nghiệm cá nhân.","Thêm con số, thời gian hoặc kết quả để ví dụ cụ thể hơn.","Kết đoạn bằng một câu nối ví dụ về lý do."],"phrases":[{"phrase":"For instance, when I worked at ...,","usage":"Mở ví dụ từ trải nghiệm"},{"phrase":"A good example of this is ...","usage":"Đưa ví dụ khách quan"},{"phrase":"As a result, ...","usage":"Nêu kết quả của ví dụ"},{"phrase":"This shows that ...","usage":"Nối ví dụ về lý do"}],"model":{"before":"Teamwork is important because people can help each other a lot.","after":"For instance, when my team prepared a sales report last year, each member analyzed one region, so we finished in two days instead of a week."},"checklist":["Mỗi lý do có ít nhất một ví dụ","Ví dụ có chi tiết cụ thể","Ví dụ liên quan trực tiếp tới lý do"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000013', 'writing', 8,
    'Ý rời rạc, thiếu từ nối giữa các câu và đoạn',
    'Các câu đứng cạnh nhau như danh sách, chuyển ý đột ngột, không có từ nối để người đọc theo được lập luận.',
    'Rubric Q8 đánh giá tính thống nhất và mạch lạc. Thiếu liên kết làm lập luận khó theo dõi; bài 4-5 điểm cần các ý nối tiếp nhau rõ ràng.',
    '{cohesion,organization}', 'medium', 'Có thể mất 1 điểm Q8',
    '{"rule":"Mỗi câu mới phải nối với câu trước bằng từ nối hoặc bằng cách nhắc lại ý vừa nói.","steps":["Chia bài thành mở bài, 2 đoạn thân bài và kết bài.","Mở mỗi đoạn thân bài bằng từ chuyển đoạn.","Dùng từ nối đúng quan hệ: thêm ý, đối lập, nguyên nhân, kết quả.","Đọc lại, chỗ nào chuyển ý đột ngột thì thêm từ nối."],"phrases":[{"phrase":"First of all, ... / In addition, ...","usage":"Thêm ý"},{"phrase":"However, ... / On the other hand, ...","usage":"Đối lập"},{"phrase":"Therefore, ... / As a result, ...","usage":"Kết quả"},{"phrase":"In conclusion, ...","usage":"Mở kết bài"}],"model":{"before":"Online courses are cheap. Students can study at night. Some people feel lonely.","after":"Online courses are cheap. In addition, students can study at night. However, some learners may feel lonely without classmates."},"checklist":["Mỗi đoạn có từ chuyển đoạn","Không có hai câu liền nhau chuyển ý đột ngột","Từ nối dùng đúng quan hệ giữa các ý"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000014', 'writing', null,
    'Sai hoà hợp giữa chủ ngữ và động từ',
    'Động từ không chia theo chủ ngữ: thiếu -s với ngôi thứ ba số ít, hoặc dùng "is" cho chủ ngữ số nhiều.',
    'Hoà hợp chủ–vị là lỗi ngữ pháp cơ bản và dễ thấy. Lặp lại nhiều lần sẽ kéo tiêu chí Ngữ pháp ở mọi câu Writing.',
    '{grammar}', 'medium', 'Có thể mất 1 điểm mỗi câu ở Q1-5',
    '{"rule":"Tìm chủ ngữ thật của câu rồi chia động từ theo nó, bỏ qua cụm giới từ ở giữa.","steps":["Gạch chân chủ ngữ chính, bỏ qua cụm \"of ...\", \"with ...\" theo sau.","Chủ ngữ số ít ở hiện tại đơn: động từ thêm -s/-es.","There is/are chia theo danh từ đứng ngay sau."],"phrases":[{"phrase":"The man is / The men are","usage":"Số ít và số nhiều"},{"phrase":"Each of the employees has ...","usage":"Each/Every đi với động từ số ít"},{"phrase":"The list of items is ...","usage":"Chia theo \"list\", không theo \"items\""}],"model":{"before":"The woman with two children are waiting for the bus.","after":"The woman with two children is waiting for the bus."},"checklist":["Mỗi động từ khớp số với chủ ngữ của nó","Đã kiểm tra các câu There is/are"]}'
  ),
  (
    '00000000-0000-4000-8000-000000000015', 'writing', null,
    'Dùng sai thì động từ',
    'Thì không khớp ngữ cảnh: mô tả tranh bằng hiện tại đơn thay vì tiếp diễn, hoặc trộn quá khứ và hiện tại trong cùng đoạn.',
    'Sai thì làm sai thời điểm của sự việc và là lỗi ngữ pháp dễ thấy. Q1-5 mô tả việc đang diễn ra trong tranh; email và bài luận cần thì nhất quán.',
    '{grammar}', 'medium', 'Kéo tiêu chí Ngữ pháp ở mọi câu',
    '{"rule":"Chọn thì theo thời điểm của sự việc và giữ nhất quán trong cả đoạn.","steps":["Q1-5: việc đang diễn ra trong tranh dùng hiện tại tiếp diễn.","Email: việc đã xảy ra dùng quá khứ đơn, kế hoạch dùng will hoặc be going to.","Rà từng động từ, đối chiếu với mốc thời gian trong câu (yesterday, next week...)."],"phrases":[{"phrase":"is/are + V-ing","usage":"Hành động đang diễn ra trong tranh"},{"phrase":"I ordered ... last week","usage":"Việc đã xảy ra"},{"phrase":"I have worked here for ...","usage":"Kéo dài từ quá khứ tới nay"},{"phrase":"We will hold the meeting ...","usage":"Kế hoạch tương lai"}],"model":{"before":"Yesterday I order a printer, but it does not arrive.","after":"Yesterday I ordered a printer, but it has not arrived yet."},"checklist":["Thì khớp với mốc thời gian trong câu","Không đổi thì vô cớ trong cùng đoạn"]}'
  );
