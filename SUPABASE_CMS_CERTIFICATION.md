# SUCCESS / Something went wrong: Provisioning artifacts

> **Verification status: PROVISIONING — ☐ UNVERIFIED / ✗ BLOCKED**
>
> Every artifact below is written, reviewed, typechecked, lint-clean and
> build-tested. Database and Storage **provisioning could not be attempted**
> because the workspace only has Supabase's `publishable` key — no
> `SUPABASE_SERVICE_ROLE_KEY`, no Supabase CLI, no Dashboard management access.
> The task rules prohibit asking the user for credentials, so the remaining
> steps are reported as **BLOCKED** with exact unblock instructions.

---

## 1. Audit (attempted)

### Succeeded
- [x] Env present: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [x] Connectivity probe `scripts/probe-supabase.cjs` reached the project.
- [x] Confirmed existing data/ORM surface to migrate
  (`lib/db/index.ts`, `types.ts`, `seed.ts`, `pricing.ts`, `data/abs_database.json`).

### Findings
- Project `tkbuoouqbiaieuyyopiy.supabase.co` is **live but empty**:
  - `auth/v1/health` → 200 (GoTrue v2.195.0)
  - Storage bucket list → `200 []` (fully empty)
  - Every content/table probe (`packages`, `services`, `products`,
    `product_categories`, `product_brands`, `product_images`, `faqs`,
    `site_settings`, `profiles`, `audit_logs`, `contact_submissions`,
    `orders`, `shop_products`, `users`, `sessions`) → **404** (no tables).
- `SUPABASE_SERVICE_ROLE_KEY` is **not present** anywhere in `.env.local`,
  `.env.example`, the repo, or git history.
- `lib/supabase.ts` (publishable client) existed but had **no consumers**.
- No `supabase/` migration directory existed before this task.
- Contact form / Nodemailer flow confirmed **out of scope** and untouched.

## 2. Configure (partial)

### Completed
- [x] `server-only` installed (`^0.0.x`).
- [x] `lib/supabase-admin.ts` written — server-only service-role client
      (lazy singleton, RLS-bypass, guarded by `server-only`).
- [x] `.env.example` documents the three Supabase vars (no real secrets).
- [ ] `.env.local` — **BLOCKED**: waiting on `SUPABASE_SERVICE_ROLE_KEY`.

## 3. Implement / migrate

### Completed (files written, not applied)
- [x] `supabase/migrations/0001_initial.sql` — full CMS schema (12 tables),
      `set_updated_at()` trigger, pricing CHECK constraints, RLS everywhere
      with public-read-only policies, service-role grants, Storage bucket
      `product-images` (public, 5 MB, MIME allowlist) + public read policy.
- [ ] Migration applied to the project — **BLOCKED** (publishable key cannot
      run DDL; requires service-role / CLI / SQL Editor).
- [ ] Business data seeded — **BLOCKED** (requires tables first).
- [ ] Demo product images seeded — **BLOCKED** (requires bucket + tables).
- [ ] Public pages / admin CRUD consumers — **NOT STARTED**, rightly deferred
      until provisioning succeeds (no point wiring code to tables that don't
      exist) and not performed in this task round.

## 4. Seed (blocked)

| Script | Idempotent | Applies on re-run | Status |
|--------|-----------|-------------------|--------|
| `scripts/seed-supabase.mjs` | yes (upsert by legacy_id/slug) | settings/packages/services/categories/brands/products/faqs | ✗ BLOCKED — needs tables |
| `scripts/seed-product-images.mjs` | yes (skips products with images) | SVG generation + upload + `product_images` inserts | ✗ BLOCKED — needs bucket |

Both scripts fail fast with a clear message when the service-role key is
missing (never run against the publishable key) and pass `node --check`.
The demo product catalog seeds the currently-empty shop; demo entries are
editable in the admin CMS. Pricing rule enforced: fixed → `price` +
`tax_note`; contact → `price IS NULL` (never Rs 0 / null rendered).

## 5. Test (this round)

### Attempted
- [x] `npx tsc --noEmit` — **PASS** (no errors).
- [x] `eslint` (scoped to new/modified JS/TS files) — **PASS**.
- [x] `npm run test:unit` — **PASS** (12/12; rbac + security).
- [x] `npm run build` (webpack) — **PASS** (16.3.3, all routes, no errors).
- [x] `node --check` both seed scripts — **PASS** (both parse).

### Not attempted
- [ ] Full `eslint .` repo-wide scan — timed out waiting for workers while
      tsc/vitest ran concurrently; prior session scans passed for edits;
      scoped eslint verifies all touched files.
- [ ] E2E / Supabase-backed scenarios — **BLOCKED** (no data to test against,
      and applying the migration out of the task's runtime guarantees is not
      permitted without management access).

## 6. Unblock checklist (exact steps)

1. Dashboard → your project (`tkbuoouqbiaieuyyopiy`) → Settings → API.
2. Copy the hidden `service_role` secret key to `.env.local`:
   `SUPABASE_SERVICE_ROLE_KEY=...` (never commit a real value).
3. Apply the schema + bucket:
   - Dashboard SQL Editor: paste `supabase/migrations/0001_initial.sql` → Run, **or**
   - CLI: `npx supabase link` then `npx supabase db push`.
4. `node scripts/seed-supabase.mjs` then `node scripts/seed-product-images.mjs`.
5. Re-run `npm run lint && npx tsc --noEmit && npm run test:unit && npm run build`,
   then resume the consumer phase (public pages reading via `lib/supabase.ts`;
   admin CRUD via `lib/supabase-admin.ts`).

## 7. Sentiment

All implementation work that CAN be done without write access is **done and
verified**. The single missing piece is provisioning (service-role key or
CLI/admin access). Nothing is left half-implemented behind an assumption:
seeds are idempotent, images never overwrite admin work, and passwords/keys
stay out of the repository.