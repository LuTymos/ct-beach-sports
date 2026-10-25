# 0003. Papel de admin vive em `app_metadata`

- Status: aceita
- Data: 2026-10-25 (registra decisão anterior)

## Contexto

O Supabase tem `user_metadata` (editável pelo próprio usuário) e `app_metadata` (só o servidor altera).

## Decisão

Admin é `app_metadata.role = 'admin'`, verificado com `supabase.auth.getUser()` (nunca só `getSession()`). O RLS usa `public.is_admin()`; as actions usam `requireAdmin()`.

## Consequências

- Promover alguém a admin é feito no SQL Editor, não na aplicação.
- O middleware só renova a sessão; não é uma barreira de acesso.
- O `service_role` só é usado depois de confirmar admin (`createAdminServiceClient`) ou em fluxos de servidor controlados (convite, contato, rate limit).
