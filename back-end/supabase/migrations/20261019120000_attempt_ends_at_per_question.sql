-- Writing Part 2/3 time each question (response_sec) instead of sharing section_sec, so the deadline of a part
-- attempt is the sum of its question times. The exam room splits it per question from started_at.
create or replace function public.set_attempt_ends_at()
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
