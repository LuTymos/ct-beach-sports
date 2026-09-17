-- Security hardening: hide `paid` from Data API, stop anonymous ticket inserts,
-- rate-limit table (service_role only).

-- stage_entry_members.paid: public SELECT must not include payment.
revoke select on table public.stage_entry_members from anon, authenticated;

grant select (id, entry_id, stage_id, category, athlete_id, created_at)
  on table public.stage_entry_members
  to anon, authenticated;

comment on column public.stage_entry_members.paid is
  'Payment flag — not selectable by anon/authenticated; admin reads via service_role';

-- Contact tickets: no Data API insert for anon/authenticated (server action uses service_role).
revoke insert on table public.contact_tickets from anon, authenticated;

drop policy if exists "Public insert contact tickets" on public.contact_tickets;

-- Rate-limit hits: not exposed on the Data API.
create table if not exists public.security_rate_hits (
  bucket text not null,
  key_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists security_rate_hits_lookup_idx
  on public.security_rate_hits (bucket, key_hash, created_at desc);

alter table public.security_rate_hits enable row level security;

revoke all on table public.security_rate_hits from public, anon, authenticated;
grant select, insert, delete on table public.security_rate_hits to service_role;
