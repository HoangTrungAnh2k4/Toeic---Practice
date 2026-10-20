-- Edit an exam in one transaction (docs/prd/exam-edit.md). General info is always editable; part contexts and
-- questions only while nobody has attempted the exam, so past attempts keep matching what was asked.

-- Security definer: attempts RLS only shows the caller's own rows, but the check must see every user's attempts.
create function private.exam_has_attempts(target_exam_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (select 1 from public.attempts a where a.exam_id = target_exam_id);
$$;

revoke execute on function private.exam_has_attempts(uuid) from public, anon;
grant execute on function private.exam_has_attempts(uuid) to authenticated;

create function public.update_exam(target_exam_id uuid, payload jsonb)
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
      topic = payload->>'topic',
      target_level = (payload->>'target_level')::smallint,
      edition = (payload->>'edition')::smallint
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

revoke execute on function public.update_exam(uuid, jsonb) from public, anon;
grant execute on function public.update_exam(uuid, jsonb) to authenticated;
