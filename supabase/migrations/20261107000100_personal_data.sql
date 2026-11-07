begin;

create table public.ecosphere_saved_locations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt() ->> 'sub'),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  created_at timestamptz not null default now()
);
create index ecosphere_saved_locations_owner
  on public.ecosphere_saved_locations (user_id, created_at);

create table public.ecosphere_alert_preferences (
  user_id text primary key default (auth.jwt() ->> 'sub'),
  air_quality boolean not null default false,
  weather boolean not null default false
);

alter table public.ecosphere_saved_locations enable row level security;
alter table public.ecosphere_alert_preferences enable row level security;

revoke all on public.ecosphere_saved_locations, public.ecosphere_alert_preferences
  from public, anon, authenticated;
grant select, insert, delete on public.ecosphere_saved_locations to authenticated;
grant select, insert, update on public.ecosphere_alert_preferences to authenticated;

create policy read_own_locations on public.ecosphere_saved_locations
  for select to authenticated using (user_id = (select auth.jwt() ->> 'sub'));
create policy insert_own_locations on public.ecosphere_saved_locations
  for insert to authenticated with check (user_id = (select auth.jwt() ->> 'sub'));
create policy delete_own_locations on public.ecosphere_saved_locations
  for delete to authenticated using (user_id = (select auth.jwt() ->> 'sub'));

create policy read_own_preferences on public.ecosphere_alert_preferences
  for select to authenticated using (user_id = (select auth.jwt() ->> 'sub'));
create policy insert_own_preferences on public.ecosphere_alert_preferences
  for insert to authenticated with check (user_id = (select auth.jwt() ->> 'sub'));
create policy update_own_preferences on public.ecosphere_alert_preferences
  for update to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));

commit;
