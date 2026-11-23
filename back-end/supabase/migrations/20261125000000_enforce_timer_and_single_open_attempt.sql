-- 1. Answers can only be written before the attempt's deadline (ends_at, set by trigger), with 30s of slack for
--    network latency on the last autosave. Before this, a student could keep saving answers after time ran out.
--    shortcut: full tests (part_template_id null) have no ends_at, so only Part practice is enforced here; give
--    full tests a deadline in set_attempt_ends_at if they need the same guard.
-- 2. At most one in-progress attempt per user, exam and part, so two tabs opening the same exam at once share one
--    attempt instead of creating two.

drop policy "Users can answer own in-progress attempts" on public.responses;
drop policy "Users can edit answers of own in-progress attempts" on public.responses;

create policy "Users can answer own in-progress attempts"
  on public.responses for insert to authenticated
  with check (exists (
    select 1 from public.attempts a
    where a.id = attempt_id and a.user_id = (select auth.uid()) and a.status = 'in_progress'
      and (a.ends_at is null or now() < a.ends_at + interval '30 seconds')
  ));

create policy "Users can edit answers of own in-progress attempts"
  on public.responses for update to authenticated
  using (exists (
    select 1 from public.attempts a
    where a.id = attempt_id and a.user_id = (select auth.uid()) and a.status = 'in_progress'
      and (a.ends_at is null or now() < a.ends_at + interval '30 seconds')
  ))
  with check (exists (
    select 1 from public.attempts a
    where a.id = attempt_id and a.user_id = (select auth.uid()) and a.status = 'in_progress'
      and (a.ends_at is null or now() < a.ends_at + interval '30 seconds')
  ));

-- Existing duplicates would block the index: keep the newest open attempt, mark older ones interrupted.
update public.attempts a
set status = 'interrupted'
where a.status = 'in_progress'
  and exists (
    select 1 from public.attempts b
    where b.user_id = a.user_id
      and b.exam_id = a.exam_id
      and b.part_template_id is not distinct from a.part_template_id
      and b.status = 'in_progress'
      -- id breaks ties so two attempts with the same started_at cannot both survive and block the index
      and (b.started_at, b.id) > (a.started_at, a.id)
  );

create unique index attempts_one_in_progress_idx
  on public.attempts (user_id, exam_id, coalesce(part_template_id, 0))
  where status = 'in_progress';
