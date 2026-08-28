#!/usr/bin/env node
/**
 * ABS Network Broadband — Supabase demo product image seeder
 * -------------------------------------------------------------------
 * RUN:  node scripts/seed-product-images.mjs
 *
 * Requirements:
 *   SUPABASE_SERVICE_ROLE_KEY   (server-side secret)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   Storage bucket "product-images" must exist (see 0001_initial.sql)
 *   "products" + "product_images" tables must exist and be seeded first
 *   (scripts/seed-supabase.mjs)
 *
 * Idempotent:
 *   * For every ACTIVE product without a stored image, a type-appropriate
 *     SVG is generated, uploaded to the bucket, and a product_images row
 *     is inserted (is_primary = true).
 *   * Products that already have any product_images rows are SKIPPED —
 *     admin-provided/edited images are never overwritten.
 *
 * The SVGs are deterministic (same slug => same bytes) so re-runs are stable.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

function loadEnv() {
  const env = { ...process.env };
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
      const m = line.match(/^\s*([^#=][^=]*)=\s*(.*)\s*$/);
      if (m) {
        const key = m[1].trim();
        if (env[key] === undefined) {
          env[key] = m[2].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('[seed-product-images] BLOCKED: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(2);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const BUCKET = 'product-images';

// ---- SVG generation ---------------------------------------------------------
const SVG_HEAD =
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">';

function svgWrap(inner) {
  return `${SVG_HEAD}
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#1e3a8a"/>
    <stop offset="100%" stop-color="#2563eb"/>
  </linearGradient>
  <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f8fafc"/>
    <stop offset="100%" stop-color="#e2e8f0"/>
  </linearGradient>
</defs>
<rect width="800" height="800" rx="48" fill="url(#bg)"/>
${inner}
</svg>`;
}

function antenna(x, y, deg) {
  return `<g transform="rotate(${deg} ${x} ${y})">
  <rect x="${x - 8}" y="${y - 110}" width="16" height="110" rx="8" fill="#0f172a"/>
  <rect x="${x - 8}" y="${y - 110}" width="16" height="26" rx="8" fill="#3b82f6"/>
</g>`;
}

function portRow(y, n, gap, w) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += `<rect x="${240 + i * gap}" y="${y}" width="${w}" height="22" rx="4" fill="#0f172a"/>
<rect x="${240 + i * gap + 3}" y="${y + 3}" width="${w - 6}" height="16" rx="2" fill="#1e293b"/>`;
  }
  return s;
}

function ledBox(x, y) {
  return `<rect x="${x}" y="${y}" width="52" height="18" rx="4" fill="#0f172a"/>
<rect x="${x + 4}" y="${y + 5}" width="20" height="8" rx="2" fill="#38bdf8"/>`;
}

const KINDS = {
  router: svgWrap(`
${antenna(300, 520, -18)}
${antenna(500, 520, 18)}
<rect x="160" y="400" width="480" height="220" rx="24" fill="url(#face)"/>
<rect x="160" y="400" width="480" height="56" rx="24" fill="#0f172a"/>
<rect x="184" y="414" width="160" height="28" rx="6" fill="#2563eb"/>
${portRow(520, 5, 84, 60)}
${ledBox(210, 470)}
${ledBox(270, 470)}
<circle cx="600" cy="470" r="14" fill="#22c55e"/>
<circle cx="630" cy="470" r="14" fill="#2563eb"/>`),
  switch: svgWrap(`
<rect x="120" y="330" width="560" height="140" rx="16" fill="url(#face)"/>
<rect x="136" y="352" width="30" height="86" rx="6" fill="#0f172a"/>
<rect x="600" y="352" width="64" height="86" rx="6" fill="#0f172a"/>
<rect x="614" y="366" width="36" height="26" rx="4" fill="#38bdf8"/>
<rect x="0" y="496" width="800" height="26" fill="#0f172a"/>
${portRow(496, 9, 58, 40)}
<rect x="200" y="560" width="80" height="26" rx="6" fill="#0f172a"/>
<rect x="300" y="560" width="120" height="26" rx="6" fill="#0f172a"/>
<rect x="440" y="560" width="90" height="26" rx="6" fill="#0f172a"/>`),
  ont: svgWrap(`
<rect x="230" y="330" width="340" height="200" rx="20" fill="url(#face)"/>
<rect x="254" y="354" width="86" height="150" rx="10" fill="#0f172a"/>
<rect x="262" y="366" width="22" height="22" rx="3" fill="#22c55e"/>
<rect x="294" y="366" width="22" height="22" rx="3" fill="#38bdf8"/>
<rect x="362" y="366" width="130" height="24" rx="4" fill="#0f172a"/>
<rect x="362" y="404" width="130" height="24" rx="4" fill="#0f172a"/>
<rect x="362" y="442" width="130" height="24" rx="4" fill="#0f172a"/>
<text x="400" y="340" font-family="sans-serif" font-size="30" font-weight="bold" fill="#0f172a">GPON ONT</text>
<circle cx="520" cy="470" r="12" fill="#0f172a"/>
<rect x="300" y="570" width="200" height="16" rx="8" fill="#0f172a"/>`),
  cable: svgWrap(`
<circle cx="400" cy="400" r="190" fill="none" stroke="#0f172a" stroke-width="54"/>
<circle cx="400" cy="400" r="150" fill="none" stroke="#2563eb" stroke-width="34"/>
<circle cx="400" cy="400" r="64" fill="#0f172a"/>
<circle cx="400" cy="400" r="40" fill="#1e293b"/>
<path d="M590 400 h110 v44" fill="none" stroke="#0f172a" stroke-width="16" stroke-linecap="round"/>`),
  fiber: svgWrap(`
<circle cx="400" cy="420" r="170" fill="none" stroke="#f59e0b" stroke-width="34"/>
<circle cx="400" cy="420" r="170" fill="none" stroke="#0f172a" stroke-width="34" stroke-dasharray="40 26" stroke-dashoffset="0"/>
<circle cx="400" cy="420" r="60" fill="#0f172a"/>
<rect x="120" y="180" width="54" height="54" rx="8" fill="#2563eb"/>
<rect x="626" y="606" width="54" height="54" rx="8" fill="#047857"/>
<rect x="140" y="200" width="80" height="14" rx="7" fill="#0f172a"/>
<rect x="580" y="606" width="80" height="14" rx="7" fill="#0f172a"/>`),
  accessory: svgWrap(`
<rect x="220" y="320" width="360" height="240" rx="24" fill="url(#face)"/>
<rect x="244" y="344" width="66" height="120" rx="10" fill="#0f172a"/>
<rect x="252" y="356" width="50" height="96" rx="6" fill="#1e293b"/>
<rect x="334" y="344" width="66" height="120" rx="10" fill="#0f172a"/>
<rect x="342" y="356" width="50" height="96" rx="6" fill="#1e293b"/>
<rect x="424" y="344" width="120" height="56" rx="10" fill="#0f172a"/>
<rect x="436" y="356" width="96" height="32" rx="6" fill="#1e293b"/>
<rect x="424" y="414" width="120" height="50" rx="10" fill="#0f172a"/>
<rect x="436" y="426" width="96" height="26" rx="6" fill="#1e293b"/>
<rect x="260" y="500" width="280" height="30" rx="8" fill="#2563eb"/>`),
  generic: svgWrap(`
<rect x="240" y="300" width="320" height="240" rx="24" fill="url(#face)"/>
<rect x="270" y="340" width="260" height="170" rx="16" fill="#0f172a"/>
<rect x="300" y="380" width="200" height="26" rx="6" fill="#2563eb"/>
<rect x="300" y="430" width="160" height="26" rx="6" fill="#1e293b"/>
<rect x="300" y="480" width="180" height="26" rx="6" fill="#1e293b"/>`),
};

function kindForCategory(categorySlug) {
  switch (categorySlug) {
    case 'routers':
      return 'router';
    case 'optical-devices':
      return 'ont';
    case 'fiber-optics':
      return 'fiber';
    case 'network-cables':
      return 'cable';
    case 'network-switches':
      return 'switch';
    case 'network-accessories':
    case 'fiber-accessories':
      return 'accessory';
    default:
      return 'generic';
  }
}

// ---- main -------------------------------------------------------------------
console.log('[seed-product-images] Fetching active products...');
const { data: products, error: fetchError } = await supabase
  .from('products')
  .select('id, slug, name, product_categories(name, slug)')
  .eq('is_active', true);

if (fetchError) {
  console.error(`[seed-product-images] BLOCKED: could not read products: ${fetchError.message}`);
  console.error('[seed-product-images] Run the SQL migration (0001_initial.sql) and scripts/seed-supabase.mjs first.');
  process.exit(1);
}

if (!products?.length) {
  console.log('[seed-product-images] No active products found — nothing to do.');
  process.exit(0);
}

// Existing images — skip products that already have one (never overwrite admin work).
const existing = await supabase.from('product_images').select('product_id');
const existingIds = new Set((existing.data ?? []).map((r) => r.product_id));

let uploaded = 0;
let skipped = 0;
let failed = 0;

for (const product of products) {
  const path = `demo/${product.slug}.svg`;
  const kind = kindForCategory(product.product_categories?.slug ?? 'other');

  if (existingIds.has(product.id)) {
    skipped++;
    console.log(`[seed-product-images] skip ${product.slug} (already has image)`);
    continue;
  }

  const svg = KINDS[kind] ?? KINDS.generic;
  const buffer = Buffer.from(svg, 'utf-8');

  // Ensure bucket exists (no-op if it does) — admin route normally does this.
  const { error: bucketError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: 'image/svg+xml',
      upsert: true,
      cacheControl: '3600',
    });

  if (bucketError) {
    console.error(`[seed-product-images] FAILED upload ${path}: ${bucketError.message}`);
    if (/not.found|NotFound|Bucket/i.test(bucketError.message)) {
      console.error('[seed-product-images] BLOCKED: storage bucket "product-images" does not exist. Apply 0001_initial.sql first.');
      process.exit(1);
    }
    failed++;
    continue;
  }

  const { data: url } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const altText = `${product.name} — demo image (ABS Network Broadband)`;

  const { error: insertError } = await supabase.from('product_images').insert({
    product_id: product.id,
    storage_path: path,
    url: url.publicUrl,
    alt_text: altText,
    is_primary: true,
    sort_order: 0,
  });

  if (insertError) {
    console.error(`[seed-product-images] FAILED insert row for ${product.slug}: ${insertError.message}`);
    failed++;
    continue;
  }

  uploaded++;
  console.log(`[seed-product-images] OK ${product.slug} -> ${url.publicUrl}`);
}

console.log(`[seed-product-images] DONE. uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
if (failed > 0) process.exitCode = 1;