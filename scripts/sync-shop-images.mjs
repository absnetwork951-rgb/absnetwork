#!/usr/bin/env node
/**
 * ABS Network — Sync public/images/shop product photos into Supabase Storage
 * (`product-images` bucket) and repoint every `product_images.url` /
 * `storage_path` at the resulting public Storage URL.
 *
 * Deterministic matching:
 *   * Rows already pointing at a specific slug image (`/images/shop/abs-*.jpg`)
 *     keep that same file — only the host/path changes to Storage.
 *   * Rows pointing at a category placeholder (`/images/shop/routers.jpg`,
 *     `switches.jpg`, `network cable.jpg`, ...) keep that category image.
 *   * All uploads under `product/<filename>`; idempotent upsert.
 *
 * No products are created/duplicated. No product_images rows are created or
 * deleted — only `url` / `storage_path` / `alt_text` are updated on the
 * existing rows (preserving id, product_id, is_primary, sort_order).
 *
 * RUN: node scripts/sync-shop-images.mjs
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

// file extension -> contentType
const MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

async function main() {
  const { data: rows, error: rowsErr } = await supabase
    .from('product_images')
    .select('id, product_id, url, storage_path, is_primary, sort_order, alt_text')
    .order('is_primary', { ascending: false });
  if (rowsErr) throw new Error(`Failed to load product_images: ${rowsErr.message}`);
  if (!rows || !rows.length) { console.log('No product_images rows.'); return; }

  console.log(`Loaded ${rows.length} product_images rows.\n`);
  const results = [];

  for (const row of rows) {
    const cur = row.url || '';
    // Only migrate rows currently pointing at a local public asset path.
    const m = cur.match(/^\/images\/shop\/(.+)$/);
    if (!m) {
      results.push({ status: 'SKIP', id: row.id, product_id: row.product_id, msg: `already remote/storage (${cur.slice(0, 60)})` });
      continue;
    }

    const filename = m[1]; // e.g. "abs-ax3000-wifi-6-router.jpg" or "network cable.jpg"
    const file = resolve(IMG_DIR, filename);
    if (!existsSync(file)) {
      results.push({ status: 'FAIL-MISSING', id: row.id, product_id: row.product_id, msg: `local file missing: ${filename}` });
      continue;
    }

    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const contentType = MIME[ext] || 'application/octet-stream';
    const buffer = readFileSync(file);

    // upload under product/<filename> (raw name; Supabase encodes on URL)
    const storagePath = `product/${filename}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType,
      upsert: true,
      cacheControl: '3600',
    });
    if (upErr) {
      results.push({ status: 'FAIL-UPLOAD', id: row.id, product_id: row.product_id, msg: upErr.message });
      continue;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const publicUrl = pub.publicUrl;

    const { error: updErr } = await supabase
      .from('product_images')
      .update({ url: publicUrl, storage_path: storagePath })
      .eq('id', row.id);
    if (updErr) {
      results.push({ status: 'FAIL-UPDATEROW', id: row.id, product_id: row.product_id, msg: updErr.message });
      continue;
    }

    results.push({ status: 'OK', id: row.id, product_id: row.product_id, filename, url: publicUrl });
  }

  for (const r of results) console.log(JSON.stringify(r));
  const fails = results.filter((r) => r.status !== 'OK' && r.status !== 'SKIP');
  console.log(`\nDONE rows=${results.length} ok=${results.filter(r=>r.status==='OK').length} skip=${results.filter(r=>r.status==='SKIP').length} fail=${fails.length}`);
  if (fails.length) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
