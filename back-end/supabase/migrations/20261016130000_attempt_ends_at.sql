-- Clients cannot write ends_at (not granted), so the deadline is set here and a student cannot extend their own timer.
-- shortcut: only parts with a shared section_sec get a deadline (Writing Part 1), matching the current exam room;
-- extend to per-question response_sec when Writing Part 2/3 and Speaking get server-side timers.
create function public.set_attempt_ends_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.ends_at := case
    when new.mode = 'guided' then null
    else new.started_at + make_interval(secs => (
      select pt.section_sec from public.part_templates pt where pt.id = new.part_template_id
    ))
  end;
  return new;
end;
$$;

create trigger attempts_set_ends_at
  before insert on public.attempts
  for each row execute function public.set_attempt_ends_at();
