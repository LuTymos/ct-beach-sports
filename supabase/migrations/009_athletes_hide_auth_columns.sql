-- Hide athletes.email from anon/authenticated API roles.
-- user_id stays selectable for authenticated (own-profile lookup via eq filter).
-- Admin UI loads email via service_role.

revoke select on table public.athletes from anon, authenticated;

grant select (id, name, team, active, created_at)
  on table public.athletes
  to anon;

grant select (id, name, team, active, created_at, user_id)
  on table public.athletes
  to authenticated;

grant insert (name, team, email, user_id, active)
  on table public.athletes
  to authenticated;

grant update (name, team, email, user_id, active)
  on table public.athletes
  to authenticated;

grant delete on table public.athletes to authenticated;

comment on column public.athletes.email is
  'Invite / login email — not selectable by anon/authenticated; admin reads via service_role';
