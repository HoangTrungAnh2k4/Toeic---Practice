-- Writing Q6–7 (part template 7) keep their directions inside the e-mail text, so those questions have no prompt.
alter table public.questions alter column prompt drop not null;

-- Move existing directions to the end of the e-mail so neither the test room nor AI scoring loses them.
update public.questions q
set stimulus = concat_ws(E'\n\n', nullif(q.stimulus, ''), q.prompt),
    prompt = null
from public.exam_parts ep
where ep.id = q.exam_part_id
  and ep.part_template_id = 7
  and q.prompt is not null;
