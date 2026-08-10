-- Contact / feedback tickets (public form → admin inbox)

create table if not exists public.contact_tickets (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  reason text not null check (
    reason in (
      'pontuacao_errada',
      'sugestao',
      'bug',
      'nome_errado',
      'resultado_faltando',
      'outro'
    )
  ),
  message text not null check (char_length(trim(message)) between 1 and 4000),
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now()
);

create index if not exists contact_tickets_created_at_idx
  on public.contact_tickets (created_at desc);

create index if not exists contact_tickets_status_idx
  on public.contact_tickets (status);

alter table public.contact_tickets enable row level security;

-- Data API: explicit grants (new tables may not be exposed by default)
grant insert on public.contact_tickets to anon, authenticated;
grant select, update on public.contact_tickets to authenticated;
grant select, insert, update, delete on public.contact_tickets to service_role;

-- Anyone can open a ticket; only authenticated admin can read/update
create policy "Public insert contact tickets"
  on public.contact_tickets for insert
  to anon, authenticated
  with check (true);

create policy "Auth read contact tickets"
  on public.contact_tickets for select
  to authenticated
  using (true);

create policy "Auth update contact tickets"
  on public.contact_tickets for update
  to authenticated
  using (true)
  with check (true);
