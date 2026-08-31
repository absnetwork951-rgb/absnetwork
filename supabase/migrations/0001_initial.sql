-- =============================================================================
-- ABS Network Broadband SMC-Pvt-Ltd — Supabase CMS initial migration
-- Next.js 15 / Supabase (PostgreSQL) — packages, services, shop, CMS data model
-- ---------------------------------------------------------------------------
-- This migration is intentionally written to run as a whole via:
--   Supabase Dashboard > SQL Editor,  or  `supabase db push` (CLI).
-- It is idempotent-only where stated (CREATE ... IF NOT EXISTS / ON CONFLICT).
-- Secrets are NEVER stored here. Passwords remain bcrypt hashes (admin_users).
-- Contact form submission/email flow is OUT OF SCOPE (separate Nodemailer task);
-- no Supabase table is created for it and the existing JSON flow is untouched.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- updated_at trigger (shared)
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- 1. site_settings (single row, id forced to 1)
-- ===========================================================================
create table if not exists site_settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default '',
  short_name text not null default '',
  legal_registration text not null default '',
  tagline text not null default '',
  phone text not null default '',
  support_phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  sales_email text not null default '',
  support_email text not null default '',
  address text not null default '',
  city text not null default '',
  business_hours text not null default '',
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  twitter_url text,
  hero_headline text not null default '',
  hero_subheadline text not null default '',
  footer_notice text not null default '',
  shop_banner_text text not null default '',
  stats_fiber_coverage_km integer not null default 0,
  stats_active_subscribers integer not null default 0,
  stats_uptime_guarantee text not null default '',
  stats_shop_product_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_site_settings_updated
  before update on site_settings
  for each row execute function set_updated_at();

-- ===========================================================================
-- 2. packages
-- ===========================================================================
create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  slug text not null unique,
  category text not null check (category in ('residential', 'business', 'gaming', 'enterprise')),
  speed_mbps numeric not null check (speed_mbps >= 0),
  upload_speed_mbps numeric check (upload_speed_mbps is null or upload_speed_mbps >= 0),
  pricing_type text not null default 'fixed' check (pricing_type in ('fixed', 'contact')),
  price numeric check (price is null or price >= 0),
  tax_note text not null default '+ TAX',
  billing_period text not null default 'Monthly',
  installation_fee numeric not null default 0 check (installation_fee >= 0),
  data_limit text not null default '',
  short_description text,
  router_included boolean not null default true,
  router_details text,
  features jsonb not null default '[]'::jsonb,
  is_popular boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- fixed pricing must carry a real price; contact pricing must not display one
  constraint chk_packages_pricing check (
    (pricing_type = 'contact' and price is null)
    or (pricing_type = 'fixed' and price is not null)
  )
);

create trigger trg_packages_updated
  before update on packages
  for each row execute function set_updated_at();

create index if not exists idx_packages_active_order
  on packages (is_active, display_order);

-- ===========================================================================
-- 3. services
-- ===========================================================================
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  title text not null,
  slug text not null unique,
  short_description text not null default '',
  full_description text not null default '',
  icon_name text not null default '',
  category text not null check (category in ('broadband', 'enterprise', 'it', 'cloud', 'support')),
  badge text,
  features jsonb not null default '[]'::jsonb,
  capabilities jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_services_updated
  before update on services
  for each row execute function set_updated_at();

create index if not exists idx_services_active_order
  on services (is_active, display_order);

-- ===========================================================================
-- 4. product_categories
-- ===========================================================================
create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  slug text not null unique,
  description text not null default '',
  icon text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_product_categories_updated
  before update on product_categories
  for each row execute function set_updated_at();

-- ===========================================================================
-- 5. product_brands
-- ===========================================================================
create table if not exists product_brands (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  slug text not null unique,
  description text not null default '',
  logo_storage_path text,
  logo_url text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_product_brands_updated
  before update on product_brands
  for each row execute function set_updated_at();

-- ===========================================================================
-- 6. products
-- ===========================================================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  slug text not null unique,
  category_id uuid references product_categories(id) on delete set null,
  brand_id uuid references product_brands(id) on delete set null,
  model text not null default '',
  sku text,
  price numeric check (price is null or price >= 0),
  compare_price numeric check (compare_price is null or compare_price >= 0),
  stock_status text not null default 'in_stock'
    check (stock_status in ('in_stock', 'low_stock', 'out_of_stock', 'on_order', 'pre_order')),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  warranty_years numeric not null default 0 check (warranty_years >= 0),
  short_description text not null default '',
  full_description text not null default '',
  specifications jsonb not null default '{}'::jsonb,
  features jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_products_updated
  before update on products
  for each row execute function set_updated_at();

create index if not exists idx_products_category on products (category_id);
create index if not exists idx_products_brand on products (brand_id);
create index if not exists idx_products_active_order on products (is_active, display_order);

-- ===========================================================================
-- 7. product_images  (product -> product_images -> Supabase Storage)
-- ===========================================================================
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  url text not null,
  alt_text text not null default '',
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_product_images_updated
  before update on product_images
  for each row execute function set_updated_at();

create index if not exists idx_product_images_product on product_images (product_id, sort_order);

-- at most one primary image per product
create unique index if not exists idx_product_images_one_primary
  on product_images (product_id) where is_primary;

-- ===========================================================================
-- 8. faqs
-- ===========================================================================
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  question text not null,
  answer text not null,
  category text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_faqs_updated
  before update on faqs
  for each row execute function set_updated_at();

-- ===========================================================================
-- 9. admin_users + admin_sessions (existing custom cookie+bcrypt auth preserved)
-- ===========================================================================
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in (
    'SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SALES_MANAGER', 'SUPPORT_AGENT', 'SECURITY_AUDITOR'
  )),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_admin_users_updated
  before update on admin_users
  for each row execute function set_updated_at();

create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  user_id uuid not null references admin_users(id) on delete cascade,
  ip_address text,
  user_agent text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_sessions_user on admin_sessions (user_id);
create index if not exists idx_admin_sessions_token on admin_sessions (token);

-- ===========================================================================
-- 10. audit_logs + security_events (private)
-- ===========================================================================
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id text,
  user_id text,
  user_email text,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created on audit_logs (created_at desc);
create index if not exists idx_audit_logs_entity on audit_logs (entity_type, entity_id);

create table if not exists security_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in (
    'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'UNAUTHORIZED_ACCESS', 'PERMISSION_DENIED',
    'PASSWORD_CHANGED', 'USER_CREATED', 'USER_ROLE_CHANGED', 'USER_DISABLED', 'USER_DELETED',
    'SESSION_REVOKED', 'SUSPICIOUS_REQUEST', 'RATE_LIMITED'
  )),
  severity text not null check (severity in ('INFO', 'WARNING', 'CRITICAL')),
  description text not null default '',
  user_id text,
  user_email text,
  ip_address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_security_events_created on security_events (created_at desc);

-- ===========================================================================
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Strategy:
--   * Public users (anon/authenticated) may only SELECT intentionally-public
--     records. Write access is reserved for the service-role key used by the
--     server actions on the admin side (service-role bypasses RLS).
--   * No anon/authenticated INSERT/UPDATE/DELETE policy exists anywhere —
--     direct unauthorized writes will fail.
--   * Sensitive tables (admin_users, admin_sessions, audit_logs,
--     security_events) expose NO public policy at all.
-- ===========================================================================

alter table site_settings enable row level security;
alter table packages enable row level security;
alter table services enable row level security;
alter table product_categories enable row level security;
alter table product_brands enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table faqs enable row level security;
alter table admin_users enable row level security;
alter table admin_sessions enable row level security;
alter table audit_logs enable row level security;
alter table security_events enable row level security;

-- Public reads ---------------------------------------------------------------

drop policy if exists "site_settings public read" on site_settings;
create policy "site_settings public read"
  on site_settings for select
  to anon, authenticated
  using (id = 1);

drop policy if exists "packages public read active" on packages;
create policy "packages public read active"
  on packages for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "services public read active" on services;
create policy "services public read active"
  on services for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "product_categories public read active" on product_categories;
create policy "product_categories public read active"
  on product_categories for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "product_brands public read active" on product_brands;
create policy "product_brands public read active"
  on product_brands for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "products public read active" on products;
create policy "products public read active"
  on products for select
  to anon, authenticated
  using (is_active = true);

-- product images are public so public product cards/detail can render them
drop policy if exists "product_images public read" on product_images;
create policy "product_images public read"
  on product_images for select
  to anon, authenticated
  using (true);

drop policy if exists "faqs public read active" on faqs;
create policy "faqs public read active"
  on faqs for select
  to anon, authenticated
  using (is_active = true);

-- No write policies for anon/authenticated are defined anywhere.
-- Privileged writes are performed exclusively through the service-role key.

-- Grant hygiene ---------------------------------------------------------------

-- public-readable content tables
grant select on site_settings, packages, services, product_categories,
  product_brands, products, product_images, faqs
  to anon, authenticated;

-- sensitive tables: deny everything to public roles
revoke all on admin_users, admin_sessions, audit_logs, security_events
  from anon, authenticated;

-- service-role has full access by default for tables created in public schema;
-- make the intent explicit and cover future grants as well.
grant usage on schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- ===========================================================================
-- Storage
-- ---------------------------------------------------------------------------
-- Bucket:  product-images
--   public read  -> public product images renderable by anyone
--   writes       -> service-role only (admin uploads via server actions);
--                   no anon/authenticated upload/update/delete policy exists.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5 * 1024 * 1024,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml']::text[]
)
on conflict (id) do nothing;

drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');