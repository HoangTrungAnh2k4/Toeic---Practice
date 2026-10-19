-- The admin exam builder no longer collects these.
alter table public.exams drop column description;
alter table public.exams drop column tags;
alter table public.questions drop column hint;

-- Exam codes (SP-0001, WR-0002...) come from one sequence shared by both skills, so two exams can never get the same code.
create sequence private.exam_code_seq;

-- Start after any existing code already in the generated format, so new codes cannot collide with old rows.
select setval(
  'private.exam_code_seq',
  coalesce(max(substring(code from '^(?:SP|WR)-(\d+)$')::bigint), 0) + 1,
  false
)
from public.exams;

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

-- Same as before minus the dropped columns; the code is filled by exams_set_code.
create or replace function public.create_exam(payload jsonb)
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
  -- New exams always start as internal drafts owned by the caller.
  insert into public.exams (skill, code, title, edition, topic, target_level, created_by)
  values (
    exam_skill,
    '',
    payload->>'title',
    (payload->>'edition')::smallint,
    payload->>'topic',
    (payload->>'target_level')::smallint,
    (select auth.uid())
  )
  returning id into new_exam_id;

  for part in select value from jsonb_array_elements(coalesce(payload->'parts', '[]')) loop
    insert into public.exam_parts (exam_id, part_template_id, context)
    values (new_exam_id, (part->>'part_template_id')::smallint, part->>'context')
    returning id into new_part_id;

    insert into public.questions (exam_part_id, number, prompt, image_path, image_alt, sample_answer)
    select new_part_id, q.number, q.prompt, q.image_path, q.image_alt, q.sample_answer
    from jsonb_to_recordset(coalesce(part->'questions', '[]'))
      as q(number smallint, prompt text, image_path text, image_alt text, sample_answer text);
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
