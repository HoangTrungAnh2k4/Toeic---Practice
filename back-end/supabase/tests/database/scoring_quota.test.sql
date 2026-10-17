-- Daily scoring quota: counts up to the limit, then refuses; failed scorings are refunded; clients cannot call it.
begin;
select plan(8);

select ok(public.consume_scoring_quota('ip:test', 2), 'first answer is within the limit');
select ok(public.consume_scoring_quota('ip:test', 2), 'second answer reaches the limit');
select ok(not public.consume_scoring_quota('ip:test', 2), 'third answer is refused');

select public.refund_scoring_quota('ip:test');
select ok(public.consume_scoring_quota('ip:test', 2), 'a refunded answer can be scored again');

select public.refund_scoring_quota('ip:test');
select public.refund_scoring_quota('ip:test');
select public.refund_scoring_quota('ip:test');
select is((select used from public.scoring_usage where subject = 'ip:test'), 0, 'refunds never go below zero');

select public.refund_scoring_quota('ip:other');
select is((select count(*)::int from public.scoring_usage where subject = 'ip:other'), 0, 'refund creates no row');

set local role authenticated;
select throws_ok(
  $$select public.consume_scoring_quota('ip:test', 100)$$,
  '42501',
  null,
  'students cannot consume quota directly'
);
select throws_ok(
  $$select public.refund_scoring_quota('ip:test')$$,
  '42501',
  null,
  'students cannot refund quota directly'
);

select * from finish();
rollback;
