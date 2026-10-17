-- Daily scoring quota: counts up to the limit, then refuses; clients cannot call it.
begin;
select plan(4);

select ok(public.consume_scoring_quota('ip:test', 2), 'first answer is within the limit');
select ok(public.consume_scoring_quota('ip:test', 2), 'second answer reaches the limit');
select ok(not public.consume_scoring_quota('ip:test', 2), 'third answer is refused');

set local role authenticated;
select throws_ok(
  $$select public.consume_scoring_quota('ip:test', 100)$$,
  '42501',
  null,
  'students cannot consume quota directly'
);

select * from finish();
rollback;
