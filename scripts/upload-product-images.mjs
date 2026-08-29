#!/usr/bin/env node
/**
 * ABS Network Broadband — upload realistic product renders to Supabase
 * and re-point the matching product_images rows at them.
 *
 * Steps per product:
 *   1. upload render-out/<slug>.webp -> product-images bucket, path product/<slug>.webp
 *   2. build public URL
 *   3. update product_images row (preserving id, product_id, is_primary, sort_order)
 *
 * RUN:  node scripts/upload-product-images.mjs
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

// find each product's product_images row by matching product slug
async function imageRowForSlug(slug) {
  const { data: prod } = await supabase.from('products').select('id, slug').eq('slug', slug).maybeSingle();
  if (!prod) return null;
  const { data, error } = await supabase
    .from('product_images')
    .select('id')
    .eq('product_id', prod.id)
    .maybeSingle();
  if (error) throw new Error(`product_images lookup: ${error.message}`);
  return data;
}

const results = [];
for (const [slug, name] of Object.entries(PRODUCT_NAMES)) {
  const file = resolve('render-out', `${slug}.webp`);
  if (!existsSync(file)) {
    results.push({ slug, status: 'SKIP', msg: 'missing render' });
    continue;
  }
  const buffer = readFileSync(file);
  const path = `product/${slug}.webp`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'image/webp',
    upsert: true,
    cacheControl: '3600',
  });
  if (upErr) {
    results.push({ slug, status: 'FAIL-UPLOAD', msg: upErr.message });
    continue;
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const row = await imageRowForSlug(slug);
  if (!row) {
    results.push({ slug, status: 'FAIL-NOROW', msg: `${path} -> ${pub.publicUrl}` });
    continue;
  }

  const { error: upRow } = await supabase
    .from('product_images')
    .update({ storage_path: path, url: pub.publicUrl, alt_text: name })
    .eq('id', row.id);
  if (upRow) {
    results.push({ slug, status: 'FAIL-UPDATEROW', msg: upRow.message });
    continue;
  }

  results.push({ slug, status: 'OK', msg: pub.publicUrl, row: row.id });
}

for (const r of results) console.log(JSON.stringify(r));
const fails = results.filter((r) => !r.status.startsWith('OK'));
console.log(`DONE. ok=${results.length - fails.length} fail=${fails.length}`);
if (fails.length) process.exitCode = 1;
