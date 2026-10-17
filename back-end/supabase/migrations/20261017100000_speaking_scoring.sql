-- Speaking scoring (docs/prd/scoring.md): IELTS-style criteria, per-answer feedback, daily scoring quota.

alter type public.criterion add value if not exists 'fluency';
alter type public.criterion add value if not exists 'task_response';

-- Written by the scoring route (service role) only; the column grants on responses stay unchanged.
alter table public.responses
  add column feedback text,
  add column scoring_model text;

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
