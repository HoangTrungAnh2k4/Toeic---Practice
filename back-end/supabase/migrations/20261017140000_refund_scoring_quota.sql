-- Gives back one answer of today's scoring quota when scoring failed (provider error), so retries do not drain it.
create function public.refund_scoring_quota(p_subject text)
returns void
language sql
set search_path = ''
as $$
  update public.scoring_usage
  set used = used - 1
  where subject = p_subject
    and day = (now() at time zone 'Asia/Ho_Chi_Minh')::date
    and used > 0;
$$;

revoke execute on function public.refund_scoring_quota(text) from public, anon, authenticated;
grant execute on function public.refund_scoring_quota(text) to service_role;
