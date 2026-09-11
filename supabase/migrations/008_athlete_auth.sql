-- Athlete Auth link: existing athlete rows get optional user_id + email.
-- Unlinked athletes keep working for ranking and admin inscriptions.

alter table public.athletes
  add column if not exists email text,
  add column if not exists user_id uuid unique references auth.users (id) on delete set null;

-- One athlete per email when email is present
create unique index if not exists athletes_email_unique_idx
  on public.athletes (lower(email))
  where email is not null;

create index if not exists athletes_user_id_idx on public.athletes (user_id);

comment on column public.athletes.user_id is
  'Supabase Auth user linked by admin invite; null = no account yet';
comment on column public.athletes.email is
  'Invite / login email managed by admin; optional until linked';

-- Athletes may update only their own profile fields (name, team).
-- Protect link columns from non-admin writes.
create or replace function public.protect_athlete_auth_columns()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select public.is_admin()) then
    return new;
  end if;

  if new.user_id is distinct from old.user_id
     or new.email is distinct from old.email
     or new.active is distinct from old.active
     or new.created_at is distinct from old.created_at then
    raise exception 'Athletes cannot change account link fields';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_athlete_auth_columns on public.athletes;
create trigger protect_athlete_auth_columns
  before update on public.athletes
  for each row
  execute function public.protect_athlete_auth_columns();

-- Own-profile update (admin ALL policy already covers admin writes)
drop policy if exists "Athlete update own profile" on public.athletes;
create policy "Athlete update own profile"
  on public.athletes for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
