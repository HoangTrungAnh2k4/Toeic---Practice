-- A student who left mid-exam (interrupted) can come back: the exam room sets the attempt back to in_progress
-- before answering again. Scored/submitted attempts stay locked.
alter policy "Users can update own in-progress attempts" on public.attempts
  using ((select auth.uid()) = user_id and status in ('in_progress', 'interrupted'));
