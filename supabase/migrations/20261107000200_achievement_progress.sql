begin;

create table public.ecosphere_achievement_progress (
  user_id text not null,
  badge_id text not null check (badge_id = 'baseline-observer'),
  days_checked integer not null check (days_checked between 1 and 7),
  last_check_date date not null,
  earned_at timestamptz,
  primary key (user_id, badge_id)
);

alter table public.ecosphere_achievement_progress enable row level security;
revoke all on public.ecosphere_achievement_progress from public, anon, authenticated;
grant select on public.ecosphere_achievement_progress to authenticated;

create policy read_own_achievement_progress on public.ecosphere_achievement_progress
  for select to authenticated using (user_id = (select auth.jwt() ->> 'sub'));

create function public.ecosphere_record_aqi_check()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id text := auth.jwt() ->> 'sub';
  check_date date := (statement_timestamp() at time zone 'Asia/Kolkata')::date;
begin
  if account_id is null or account_id = '' then
    raise exception 'Sign-in required' using errcode = '42501';
  end if;

  insert into public.ecosphere_achievement_progress as progress
    (user_id, badge_id, days_checked, last_check_date)
  values (account_id, 'baseline-observer', 1, check_date)
  on conflict (user_id, badge_id) do update
    set days_checked = progress.days_checked + 1,
        last_check_date = excluded.last_check_date,
        earned_at = case when progress.days_checked = 6 then statement_timestamp() end
    where progress.earned_at is null and progress.last_check_date < excluded.last_check_date;
end;
$$;

revoke all on function public.ecosphere_record_aqi_check() from public, anon, authenticated;
grant execute on function public.ecosphere_record_aqi_check() to authenticated;

commit;
