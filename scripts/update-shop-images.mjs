#!/usr/bin/env node
/**
 * ABS Network Broadband — point the live shop at the real downloaded product
 * photos stored in public/images/shop/<slug>.jpg.
 *
 * For each product:
 *   1. upload public/images/shop/<slug>.jpg -> product-images bucket, product/<slug>.jpg
 *   2. build the public URL
 *   3. update the matching product_images row (storage_path, url, alt_text),
 *      preserving id / product_id / is_primary / sort_order
 *
 * Also assigns the GPON ONT product its missing category (optical-devices)
 * so it appears under the shop category filters.
 *
 * RUN:  node scripts/update-shop-images.mjs
 *       idempotent: safe to re-run (bucket upload upserts, rows point at the same path)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const env = { ...process.env };
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
      const m = line.match(/^\s*([^#=][^=]*)=\s*(.*)\s*$/);
      if (m && env[m[1].trim()] === undefined) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('BLOCKED: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required.');
  process.exit(2);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const BUCKET = 'product-images';
const IMG_DIR = resolve('public/images/shop');

// slug -> accurate product name (for alt_text)
const PRODUCT_NAMES = {
  'abs-ax3000-wifi-6-router': 'ABS AX3000 Dual-Band Wi-Fi 6 Fiber Router',
  'abs-gpon-ont-1ge': 'ABS GPON ONT 1GE Optical Network Terminal',
  'abs-24port-gigabit-managed-switch': 'ABS 24-Port Gigabit Managed L2+ Switch',
  'abs-ac1200-ceiling-access-point': 'ABS AC1200 Dual-Band Ceiling Access Point',
  'abs-cat6-utp-lan-cable-305m': 'ABS Cat6 UTP LAN Cable (305 m Box)',
  'abs-sm-sc-sc-fiber-patch-2m': 'ABS Single-Mode SC-SC Fiber Patch Cord (2 m)',
  'abs-fiber-connector-adapter-kit': 'ABS Fiber Connector & Adapter Kit (SC/LC)',
  'abs-48v-poe-power-adapter': 'ABS 48V PoE Power Adapter (802.3af/at)',
};

// slug -> desired product_categories slug (fixes GPON's missing category)
const CATEGORY_FIX = {
  'abs-gpon-ont-1ge': 'optical-devices',
};

async function productForSlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(`product lookup ${slug}: ${error.message}`);
  return data;
}

async function imageRowForProduct(productId) {
  const { data, error } = await supabase
    .from('product_images')
    .select('id')
    .eq('product_id', productId)
    .maybeSingle();
  if (error) throw new Error(`product_images lookup: ${error.message}`);
  return data;
}

const results = [];

// 1. category fix (GPON)
for (const [slug, catSlug] of Object.entries(CATEGORY_FIX)) {
  const prod = await productForSlug(slug);
  if (!prod) { results.push({ step: 'category', slug, status: 'SKIP', msg: 'product not found' }); continue; }
  const { data: cat } = await supabase.from('product_categories').select('id').eq('slug', catSlug).maybeSingle();
  if (!cat) { results.push({ step: 'category', slug, status: 'SKIP', msg: `category ${catSlug} not found` }); continue; }
  const { error } = await supabase.from('products').update({ category_id: cat.id }).eq('id', prod.id);
  results.push({ step: 'category', slug, status: error ? 'FAIL' : 'OK', msg: error ? error.message : `category_id -> ${catSlug}` });
}

// 2. images
for (const [slug, name] of Object.entries(PRODUCT_NAMES)) {
  const file = resolve(IMG_DIR, `${slug}.jpg`);
  if (!existsSync(file)) {
    results.push({ step: 'image', slug, status: 'SKIP', msg: 'missing jpg in public/images/shop' });
    continue;
  }
  const prod = await productForSlug(slug);
  if (!prod) { results.push({ step: 'image', slug, status: 'SKIP', msg: 'product not found' }); continue; }

  const buffer = readFileSync(file);
  const path = `product/${slug}.jpg`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'image/jpeg',
    upsert: true,
    cacheControl: '3600',
  });
  if (upErr) { results.push({ step: 'image', slug, status: 'FAIL-UPLOAD', msg: upErr.message }); continue; }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const row = await imageRowForProduct(prod.id);
  if (!row) { results.push({ step: 'image', slug, status: 'FAIL-NOROW', msg: `${path} -> ${pub.publicUrl}` }); continue; }

  const { error: upRow } = await supabase
    .from('product_images')
    .update({ storage_path: path, url: pub.publicUrl, alt_text: name })
    .eq('id', row.id);
  if (upRow) { results.push({ step: 'image', slug, status: 'FAIL-UPDATEROW', msg: upRow.message }); continue; }

  results.push({ step: 'image', slug, status: 'OK', msg: pub.publicUrl, row: row.id });
}

for (const r of results) console.log(JSON.stringify(r));
const fails = results.filter((r) => r.status !== 'OK' && r.status !== 'SKIP');
console.log(`DONE count=${results.length} fail=${fails.length}`);
if (fails.length) process.exitCode = 1;
