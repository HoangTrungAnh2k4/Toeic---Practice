-- Archived exams leave the library but stay readable: students keep the history, results and mistake book of their
-- attempts on them, and unfinished attempts can still be completed and scored. exam_parts and questions follow.
-- shortcut: archived content stays readable by anyone holding the id, as it was while published; limit it to the
-- attempt owners if an exam ever has to be pulled for legal reasons.
alter policy "Anon can read published exams" on public.exams
  using (status in ('published', 'archived'));
alter policy "Anon can read published exams" on public.exams
  rename to "Anon can read published and archived exams";

alter policy "Users can read published exams, admins all" on public.exams
  using (status in ('published', 'archived') or (select private.is_admin()));
alter policy "Users can read published exams, admins all" on public.exams
  rename to "Users can read published and archived exams, admins all";

-- Readable no longer means open: new attempts and bookmarks only on published exams (admins may preview any exam).
alter policy "Users can start attempts on visible exams" on public.attempts
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.exams e
      where e.id = exam_id and (e.status = 'published' or (select private.is_admin()))
    )
  );
alter policy "Users can start attempts on visible exams" on public.attempts
  rename to "Users can start attempts on published exams";

alter policy "Users can bookmark visible exams" on public.bookmarks
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.exams e
      where e.id = exam_id and (e.status = 'published' or (select private.is_admin()))
    )
  );
alter policy "Users can bookmark visible exams" on public.bookmarks
  rename to "Users can bookmark published exams";

-- Copy an exam into a new draft of the caller, so an exam whose content is locked by attempts can be fixed in the
-- copy while the original gets archived. Images are shared by URL: deleteUnusedExamImages keeps an R2 image while
-- any question still points to it.
create function public.duplicate_exam(source_exam_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_exam_id uuid;
  new_part_id uuid;
  source_part record;
begin
  -- RLS would silently insert nothing for non-admins; fail loudly instead.
  if not (select private.is_admin()) then
    raise exception 'only admins can duplicate exams' using errcode = '42501';
  end if;

  -- 140 + suffix keeps the title within the 150 characters the exam form allows.
  insert into public.exams (skill, code, title, source, created_by)
  select e.skill, '', left(e.title, 140) || ' (bản sao)', e.source, (select auth.uid())
  from public.exams e
  where e.id = source_exam_id
  returning id into new_exam_id;
  if new_exam_id is null then
    raise exception 'exam not found' using errcode = 'P0002';
  end if;

  for source_part in
    select ep.id, ep.part_template_id, ep.description, ep.context, ep.context_media_path
    from public.exam_parts ep
    where ep.exam_id = source_exam_id
  loop
    insert into public.exam_parts (exam_id, part_template_id, description, context, context_media_path)
    values (new_exam_id, source_part.part_template_id, source_part.description, source_part.context, source_part.context_media_path)
    returning id into new_part_id;

    insert into public.questions (exam_part_id, number, prompt, stimulus, image_path, image_alt, audio_path, keywords, sample_answer)
    select new_part_id, q.number, q.prompt, q.stimulus, q.image_path, q.image_alt, q.audio_path, q.keywords, q.sample_answer
    from public.questions q
    where q.exam_part_id = source_part.id;
  end loop;

  return new_exam_id;
end;
$$;

revoke execute on function public.duplicate_exam(uuid) from public, anon;
grant execute on function public.duplicate_exam(uuid) to authenticated;
