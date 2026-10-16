-- Tables from front-end/docs/erd.md. Enum values mirror front-end/lib/domain/types.ts.

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
  'relevance', 'completeness', 'organization', 'support'
);
create type public.severity as enum ('high', 'medium', 'low');
create type public.plan_status as enum ('active', 'archived');
create type public.plan_task_kind as enum ('speaking', 'writing', 'review', 'mock', 'summary');

-- ---------------------------------------------------------------------------
-- Private schema: security definer helpers, not exposed through the API.
-- ---------------------------------------------------------------------------

create schema private;
grant usage on schema private to authenticated;

-- Move the sign-up trigger function out of the exposed schema.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
drop function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column role public.user_role not null default 'student',
  add column target_speaking smallint check (target_speaking between 0 and 200),
  add column target_writing smallint check (target_writing between 0 and 200),
  add column exam_date date,
  add column preferred_time text,
  add column reminder_enabled boolean not null default false;

-- Users edit their own profile but never their role.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, avatar_url, target_speaking, target_writing, exam_date, preferred_time, reminder_enabled)
  on public.profiles to authenticated;

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
  edition smallint not null,
  source public.exam_source not null default 'internal',
  status public.exam_status not null default 'draft',
  is_verified boolean not null default false,
  topic text not null,
  target_level smallint check (target_level between 1 and 9),
  description text,
  tags text[] not null default '{}',
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
  prompt text not null,
  stimulus text,
  image_path text,
  image_alt text,
  audio_path text,
  keywords jsonb,
  sample_answer text,
  hint text,
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
-- Mistake book content
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

-- Only in-progress attempts can change, and only to a client-reachable status.
create policy "Users can update own in-progress attempts"
  on public.attempts for update to authenticated
  using ((select auth.uid()) = user_id and status = 'in_progress')
  with check ((select auth.uid()) = user_id and status in ('in_progress', 'submitted', 'interrupted'));

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
