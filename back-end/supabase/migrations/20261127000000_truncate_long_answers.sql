-- responses_text_answer_length was added not valid, but Postgres still checks it on every update of a row. An answer
-- saved before the cap (> 8000 chars) therefore blocked its own autosave and the score write of the scoring route.
-- Cut those answers to the cap, then validate. An answer that was already scored in full keeps its score and
-- feedback; annotations past character 8000 lose their highlight.
update public.responses
set text_answer = left(text_answer, 8000)
where char_length(text_answer) > 8000;

alter table public.responses validate constraint responses_text_answer_length;
