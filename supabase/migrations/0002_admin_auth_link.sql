-- ===========================================================================
-- 0002_admin_auth_link.sql
-- ABS Network Broadband SMCVP Pvt Ltd
--
-- Links Supabase Auth users to admin accounts (RBAC source of truth stays in
-- the application's server-side admin store, resolved by auth_user_id).
--
-- APPLY:  Supabase Dashboard > SQL Editor > paste + Run  (idempotent; safe to
--         re-run). This matches the app's on-disk seed for the same Auth UUID.
--
-- Target Auth user:
--   UUID  32a4f677-0c9f-418a-9b95-ef0c3368f0a0  -> SUPER_ADMIN, is_active = true
-- ===========================================================================

-- 1. Link column (explicit FK to auth.users; NOT a legacy_id placeholder).
alter table admin_users
  add column if not exists auth_user_id uuid
  references auth.users(id)
  on delete set null;

-- Unique: one admin account per Auth user.
create unique index if not exists idx_admin_users_auth_user_id
  on admin_users (auth_user_id);

-- 2. Ensure exactly one SUPER_ADMIN row exists for the target Auth user
--    (e-mail/name taken from the real auth.users record; never fabricated).
--    password_hash is retained for column compatibility with the legacy
--    schema but is inert — this account authenticates via Supabase Auth only.
insert into admin_users (
  legacy_id,
  name,
  email,
  password_hash,
  role,
  is_active,
  auth_user_id
)
select
  'sys_auth_super_admin_' || au.id,
  coalesce(nullif(au.raw_user_meta_data ->> 'name', ''), split_part(au.email, '@', 1)),
  au.email,
  'DEPRECATED-SUPABASE-AUTH-ONLY',
  'SUPER_ADMIN',
  true,
  au.id
from auth.users au
where au.id = '32a4f677-0c9f-418a-9b95-ef0c3368f0a0'
on conflict (email) do update
  set role = excluded.role,
      is_active = true,
      auth_user_id = excluded.auth_user_id,
      updated_at = now();

-- 3. RLS remains untouched: admin_users has NO anon/authenticated policy and
--    service-role-only access is preserved (see 0001_initial.sql).