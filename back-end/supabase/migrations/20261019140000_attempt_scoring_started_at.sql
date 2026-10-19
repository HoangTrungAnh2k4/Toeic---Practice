-- When the current scoring run started: the Writing scoring route claims an attempt (submitted -> scoring) and may
-- reclaim it only when a run is stale (crashed or timed out), so two runs never score the same attempt at once.
-- Not granted to clients; only service_role writes it.
alter table public.attempts add column scoring_started_at timestamptz;
