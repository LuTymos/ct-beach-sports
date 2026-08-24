-- Restrict writes to JWT app_metadata.role = 'admin' (not user_metadata).
-- After this migration, promote users in SQL Editor then they must sign in again:
--
--   update auth.users
--   set raw_app_meta_data =
--     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
--   where email in ('SEU_EMAIL');

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Auth write athletes" on public.athletes;
drop policy if exists "Auth write stages" on public.stages;
drop policy if exists "Auth write results" on public.results;

create policy "Admin write athletes"
  on public.athletes for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admin write stages"
  on public.stages for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admin write results"
  on public.results for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Public insert contact tickets" on public.contact_tickets;
drop policy if exists "Auth read contact tickets" on public.contact_tickets;
drop policy if exists "Auth update contact tickets" on public.contact_tickets;

-- Public form may only open tickets (cannot insert status = done).
create policy "Public insert contact tickets"
  on public.contact_tickets for insert
  to anon, authenticated
  with check (status = 'open');

create policy "Admin read contact tickets"
  on public.contact_tickets for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admin update contact tickets"
  on public.contact_tickets for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
