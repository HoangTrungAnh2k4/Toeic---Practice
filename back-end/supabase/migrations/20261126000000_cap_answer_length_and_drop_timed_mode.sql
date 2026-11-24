-- 1. Writing answers are sent whole to the shared Groq key when scored, so one huge answer can burn the token quota
--    of every user. Cap them like the guest route does (MAX_ANSWER_CHARS in front-end/lib/domain/writing-text.ts).
--    not valid: existing rows are not re-checked (the scoring route truncates them); new and edited rows are.
alter table public.responses
  add constraint responses_text_answer_length check (char_length(text_answer) <= 8000) not valid;

-- 2. Drop the 'timed' attempt mode: no page ever linked to it and it behaved like cbt without the auto-submit.
--    Its attempts already had a cbt deadline (ends_at), so they become cbt. Postgres cannot remove an enum value in
--    place, so the type is rebuilt; only attempts.mode uses it.
update public.attempts set mode = 'cbt' where mode = 'timed';

alter type public.attempt_mode rename to attempt_mode_old;
create type public.attempt_mode as enum ('cbt', 'guided');
alter table public.attempts
  alter column mode type public.attempt_mode using mode::text::public.attempt_mode;
drop type public.attempt_mode_old;
