# Supabase CMS — ABS Network Broadband SMC-Pvt-Ltd

## Status (August 2026)

> **PROVISIONING BLOCKED.** The Supabase project
> (`tkbuoouqbiaieuyyopiy.supabase.co`) is configured with only a
> **publishable key** in `.env.local`. Creating tables, RLS policies and the
> Storage bucket requires the **service-role key** (or Supabase CLI / Dashboard
> SQL Editor). Every provisioning artifact below is review-ready and
> idempotent, but **cannot write to the database until a service-role key is
> provisioned**. See [Unblocking](#unblocking).

---

## Goals

- Supabase becomes the **authoritative business-data source** (packages,
  services, shop products, settings, faqs).
- **Admin CRUD** moves to server actions backed by Supabase (service-role key,
  server-only).
- **Products** gain real images via **Supabase Storage** (`product-images`
  bucket) referenced by a `product_images` table.
- **Demo product images** are generated and uploaded by an idempotent seeder.
- **RLS + Storage policies**: public read-only for content tables; no public
  write path; sensitive tables fully locked down.
- **Public pages** consume Supabase; the existing **contact form /
  Nodemailer email flow is untouched and out of scope.**

## What lives where

| Layer | File | Notes |
|------|------|-------|
| Schema + RLS + bucket | `supabase/migrations/0001_initial.sql` | One migration, apply via Dashboard SQL Editor or `supabase db push`. |
| Business data seed | `scripts/seed-supabase.mjs` | Idempotent upserts: settings, packages, services, categories, brands, demo products, faqs. |
| Demo image seed | `scripts/seed-product-images.mjs` | Generates type-appropriate SVGs, uploads to Storage, inserts `product_images`. |
| Server client | `lib/supabase-admin.ts` | Service-role client (RLS bypass), server-only, lazy singleton. |
| Public client | `lib/supabase.ts` | Existing publishable-key client, safe for the browser. |
| Env template | `.env.example` | Documents the three Supabase vars (no real secrets). |
| Audit/certification | `SUPABASE_CMS_CERTIFICATION.md` | Truthful attempted/succeeded/failed/blocked report. |

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Read-only public queries |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only, secret** | Migrations can't use it, but admin CRUD, seeds and storage uploads do. |

Never put the service-role key in a `NEXT_PUBLIC_*` variable or commit a real
value.

## Runbook

### 1. Provision (one-time, requires service-role key or Dashboard)

```bash
# Option A — Dashboard SQL Editor
#   copy-paste supabase/migrations/0001_initial.sql → Run

# Option B — Supabase CLI (project linked)
supabase db push

# Option C — this repo's migration runner against a local/self-hosted instance
#   (uses SUPABASE_SERVICE_ROLE_KEY; not provided in this repo)
```

Ensure the `product-images` bucket exists and is public (the migration creates
it with a 5 MB limit and MIME allowlist).

### 2. Add the secret to `.env.local`

```
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

### 3. Seed business data

```bash
node scripts/seed-supabase.mjs
```

Safe to re-run: every table is upserted by `legacy_id` or `slug`. It maps the
existing `data/abs_database.json` (settings, packages, services) and seeds a
curated **demo product catalog** (the JSON datastore currently has no shop
products). Pricing follows the rule: fixed plans carry a real `price` +
`tax_note`; contact plans have `price = NULL` so nothing renders as Rs 0.

### 4. Seed demo product images

```bash
node scripts/seed-product-images.mjs
```

For every **active** product without an image, generates a deterministic
type-appropriate SVG, uploads it to `product-images/demo/{slug}.svg`, and
inserts one `product_images` row (`is_primary = true`). Products that already
have images are **skipped** — admin uploads are never overwritten.

### 5. Verify

```bash
npm run lint
npx tsc --noEmit
npm run test:unit
npm run build
```

## Security model

- **RLS** is enabled on every table.
- Public roles (`anon`, `authenticated`) may only `SELECT` intentionally-public
  rows (`is_active = true`; `site_settings` id 1; all product images). No
  public `INSERT`/`UPDATE`/`DELETE` policy exists anywhere.
- `admin_users`, `admin_sessions`, `audit_logs`, `security_events` have **no**
  public policy and are fully revoked for public roles.
- Writes happen exclusively through the **service-role key** in server actions
  (`lib/supabase-admin.ts`), which bypasses RLS and is guarded by the
  `server-only` package.
- Storage bucket `product-images` is public-read (so product images render for
  anonymous visitors); uploads/updates/deletes are service-role only.
- Passwords remain **bcrypt hashes**; no secrets are stored in the repository.

## Interface contracts (for the consumer phase)

- `product_images.url` is the full public URL (render directly in `<img>`).
- `packages.price` is `NULL` exactly when `pricing_type = 'contact'`.
- `packages.slug` / `services.slug` / `products.slug` are unique — use as the
  public route key.
- `product_categories.slug` is the filter key used by the shop page.
- `faqs` is a flat, active-filtered list ready for the contact page.

## Unblocking

1. Sign in to Supabase Dashboard → your project → Settings → API.
2. Copy the `service_role` (secret) key into `.env.local` as
   `SUPABASE_SERVICE_ROLE_KEY`.
3. Run the migration (SQL Editor or CLI), then the two seed scripts.
4. Re-run the certification checklist in `SUPABASE_CMS_CERTIFICATION.md`.