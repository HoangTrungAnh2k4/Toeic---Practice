-- Lượt làm của mọi người dùng theo đề, cho trang quản lý đề.
-- View chạy với quyền owner (không security_invoker) để đếm qua RLS của attempts; chỉ admin thấy dòng nào.
create view public.exam_stats as
select
  exam_id,
  count(*)::int as attempt_count,
  round(100.0 * count(*) filter (where status in ('submitted', 'scoring', 'scored')) / count(*))::int as completion_rate
from public.attempts
where (select private.is_admin())
group by exam_id;

revoke all on public.exam_stats from public, anon, authenticated;
grant select on public.exam_stats to authenticated;
