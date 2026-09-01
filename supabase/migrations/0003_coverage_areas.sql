-- =============================================================================
-- ABS Network Broadband SMC-Pvt-Ltd — Supabase coverage areas migration
-- Next.js 15 / Supabase (PostgreSQL) — coverage_areas CMS for the public
-- "Check Availability" dropdown on the Home page.
-- ---------------------------------------------------------------------------
-- APPLY:  Supabase Dashboard > SQL Editor,  or  `supabase db push` (CLI).
-- Idempotent-only (CREATE TABLE IF NOT EXISTS / ON CONFLICT DO NOTHING /
-- DROP POLICY IF EXISTS). Safe to re-run.
--
-- Intent: minimal schema per the coverage task spec. No status, no display
-- order, no coordinates, no radius. A coverage area either exists (shown on
-- the public Home page) or is deleted (no longer shown). Row Level Security
-- grants the public SELECT ONLY; all writes happen server-side through the
-- service-role key used by the admin server actions (service-role bypasses
-- RLS, and no anon/authenticated INSERT/UPDATE/DELETE policy exists).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- coverage_areas
--   Admin-managed service coverage areas (currently Lahore).
--   unique (city, name) prevents duplicate areas within the same city both at
--   the database level and as the backstop for the admin UI validation.
-- ---------------------------------------------------------------------------
create table if not exists coverage_areas (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_coverage_areas_not_blank
    check (btrim(city) <> '' and btrim(name) <> ''),
  constraint uq_coverage_areas_city_name unique (city, name)
);

create trigger trg_coverage_areas_updated
  before update on coverage_areas
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--   Public (anon/authenticated) may SELECT every coverage area. Writes are
--   performed exclusively through the service-role key used by the admin
--   server actions (service-role bypasses RLS). No anon/authenticated
--   INSERT/UPDATE/DELETE policy exists.
-- ---------------------------------------------------------------------------
alter table coverage_areas enable row level security;

drop policy if exists "coverage_areas public read" on coverage_areas;
create policy "coverage_areas public read"
  on coverage_areas for select
  to anon, authenticated
  using (true);

-- public-readable content table
grant select on coverage_areas to anon, authenticated;

-- service-role has full access by default for tables created in the public
-- schema; make the intent explicit.
grant usage on schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- ---------------------------------------------------------------------------
-- Initial seed: Lahore coverage areas (idempotent via unique (city, name)).
-- ---------------------------------------------------------------------------
insert into coverage_areas (city, name)
values
  ('Lahore', 'Nisbet Road'),
  ('Lahore', 'Qilla Gujjar Singh'),
  ('Lahore', 'McLeod Road'),
  ('Lahore', 'Montgomery Road'),
  ('Lahore', 'Royal Park'),
  ('Lahore', 'Beadon Road'),
  ('Lahore', 'Mall Road'),
  ('Lahore', 'Hall Road'),
  ('Lahore', 'Shimla Hill'),
  ('Lahore', 'Nicolson Road'),
  ('Lahore', 'Karim Park'),
  ('Lahore', 'Saggian Pull'),
  ('Lahore', 'Band Road'),
  ('Lahore', 'Azadi Chowk'),
  ('Lahore', 'Ravi Road'),
  ('Lahore', 'Badami Bagh'),
  ('Lahore', 'Mochi Gate'),
  ('Lahore', 'Guwalmandi'),
  ('Lahore', 'Ameen Park'),
  ('Lahore', 'Shah Alam Market'),
  ('Lahore', 'Lohari Gate'),
  ('Lahore', 'Bhatti Gate'),
  ('Lahore', 'Mori Gate'),
  ('Lahore', 'Taxali Gate'),
  ('Lahore', 'Shahdara'),
  ('Lahore', 'Islampura')
on conflict (city, name) do nothing;