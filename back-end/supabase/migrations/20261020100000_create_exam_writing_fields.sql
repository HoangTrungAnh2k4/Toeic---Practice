-- Writing exams: per-question e-mail (stimulus) and required keywords ([{word, forms}]) are written by create_exam too.
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
