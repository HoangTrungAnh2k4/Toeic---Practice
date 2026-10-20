-- Exams no longer carry a target level or an edition year: the RPCs stop writing them, then the columns go.

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

create or replace function public.update_exam(target_exam_id uuid, payload jsonb)
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

alter table public.exams drop column target_level;
alter table public.exams drop column edition;
