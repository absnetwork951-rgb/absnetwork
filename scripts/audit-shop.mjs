#!/usr/bin/env node
/** Read-only final reconciliation audit of products vs product_images vs storage. */
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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function main() {
  const { data: productsRes, error: productsErr } = await supabase.from('products').select('id, slug, name, is_active').order('display_order');
  const { data: imagesRes, error: imagesErr } = await supabase.from('product_images').select('*').order('sort_order');
  if (productsErr) console.log('PRODUCTS ERROR:', productsErr.message);
  if (imagesErr) console.log('IMAGES ERROR:', imagesErr.message);
  const products = productsRes || [];
  const images = imagesRes || [];

  const prodMap = new Map(products.map(p => [p.id, p]));
  const byProduct = {};
  for (const img of images) (byProduct[img.product_id] ??= []).push(img);

  console.log('Product | Slug | Primary Image | # Images | DB Status');
  let noImg = 0, multiPrim = 0, orphan = 0, totalImgs = 0;
  for (const img of images) {
    totalImgs++;
    if (!prodMap.has(img.product_id)) { orphan++; console.log(`ORPHAN product_image -> ${img.product_id}`); }
  }
  for (const p of products || []) {
    const imgs = byProduct[p.id] || [];
    if (!imgs.length) noImg++;
    const prims = imgs.filter(i => i.is_primary);
    if (prims.length > 1) multiPrim++;
    const prim = prims[0]?.url || (imgs[0]?.url || 'NONE');
    console.log(`${p.name} | ${p.slug} | ${prim} | ${imgs.length} | OK`);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total products: ${products.length}`);
  console.log(`Total product_images rows: ${totalImgs}`);
  console.log(`Products with primary image: ${products.filter(p=>byProduct[p.id]?.some(i=>i.is_primary)).length}`);
  console.log(`Products with gallery images (2+): ${products.filter(p=>(byProduct[p.id]||[]).length>1).length}`);
  console.log(`Products missing image: ${noImg}`);
  console.log(`Products with multiple primary: ${multiPrim}`);
  console.log(`Orphaned product_images: ${orphan}`);
}
main().catch(e => { console.error(e); process.exit(1); });
