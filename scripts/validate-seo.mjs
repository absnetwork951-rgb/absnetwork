#!/usr/bin/env node
/**
 * SEO validation & discoverability audit for ABS Network.
 *
 * Tracks the objective of shipping a fully search-engine and AI-crawler
 * discoverable site: sitemap.xml, robots.txt, llms.txt / llms-full.txt,
 * per-service canonical URLs, title/meta-description, and JSON-LD.
 *
 * Usage (from repo root):
 *   node scripts/validate-seo.mjs                # data-layer + config audit (no server)
 *   node scripts/validate-seo.mjs --base http://localhost:3000   # also crawl live URLs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const DB_PATH = resolve(root, 'data/abs_database.json');

function loadDb() {
  if (!existsSync(DB_PATH)) {
    console.error('No database file found. Run the app once to seed it.');
    process.exit(1);
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

const PRODUCTION_SITE_URL = 'https://www.absnetwork.com.pk';
const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    PRODUCTION_SITE_URL).replace(/\/+$/, '');

const STATIC_ROUTES = ['/', '/packages', '/services', '/shop', '/contact'];

// Mirrors lib/db/service-categories.ts
const VALID_CATEGORIES = [
  'networking', 'internet', 'cisco', 'mikrotik', 'servers', 'it-support',
  'cybersecurity', 'wireless', 'cabling', 'cctv', 'digital-services',
];

const results = [];
function report(ok, message) {
  results.push({ ok, message });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`  ${ok ? '\u2713' : '\u2717'} [${mark}] ${message}`);
}

function slugify(value) {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const args = process.argv.slice(2);
  const baseIdx = args.indexOf('--base');
  const baseUrl = baseIdx >= 0 ? args[baseIdx + 1] : null;

  const db = loadDb();
  const settings = db.settings || {};
  console.log(`\n=== ABS Network SEO Validation ===`);
  console.log(`Site URL: ${SITE_URL}`);
  console.log(`Database: ${DB_PATH} (${db.services ? db.services.length : 0} services)\n`);

  const services = (db.services || []).map((s) => ({
    ...s,
    displayOrder: s.displayOrder ?? 999,
    isPublished: s.isPublished !== false,
    isFeatured: !!s.isFeatured,
  }));

  // ---- Global config -----------------------------------------------------
  report(existsSync(resolve(root, 'app/sitemap.ts')), 'app/sitemap.ts present');
  report(existsSync(resolve(root, 'app/robots.ts')), 'app/robots.ts present');
  report(existsSync(resolve(root, 'app/llms.txt/route.ts')), 'app/llms.txt/route.ts present');
  report(existsSync(resolve(root, 'app/llms-full.txt/route.ts')), 'app/llms-full.txt/route.ts present');

  // robots.txt / sitemap references
  const robotsTs = existsSync(resolve(root, 'app/robots.ts'))
    ? readFileSync(resolve(root, 'app/robots.ts'), 'utf-8')
    : '';
  report(
    robotsTs.includes('/sitemap.xml'),
    'robots.ts references /sitemap.xml'
  );

  // ---- Settings ----------------------------------------------------------
  report(!!settings.companyName, `settings.companyName present: ${settings.companyName || ''}`);
  report(!!settings.tagline, `settings.tagline present`);
  report(!!settings.phone && !!settings.whatsapp, 'settings.phone & whatsapp present');

  // ---- Service-level SEO -------------------------------------------------
  const published = services.filter((s) => s.isPublished);
  const seenSlugs = new Map();

  console.log(`\n--- Service SEO (${services.length} total, ${published.length} published) ---`);

  services.forEach((s) => {
    const badge = s.isPublished ? '' : ' [draft]';

    // slug validity + uniqueness
    const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.slug || '') && !!s.slug;
    report(validSlug, `${s.id}: valid slug "${s.slug}"${badge}`);
    if (seenSlugs.has(s.slug)) {
      report(false, `${s.id}: DUPLICATE slug "${s.slug}" (also used by ${seenSlugs.get(s.slug)})`);
    } else {
      seenSlugs.set(s.slug, s.id);
    }

    // category valid
    report(
      VALID_CATEGORIES.includes(s.category),
      `${s.id}: category "${s.category}" is valid`
    );

    // canonical slug is produced from current slug
    const canonical = s.canonicalUrl || `${SITE_URL}/services/${s.slug}`;
    report(
      canonical.includes(`/services/${s.slug}`),
      `${s.id}: canonical URL ${canonical}`
    );

    // title & description
    const title = s.seoTitle || `${s.title} | ${settings.shortName || 'ABS Network'}`;
    const desc = s.seoDescription || s.shortDescription || settings.tagline || '';
    report(title.length > 10 && title.length <= 200, `${s.id}: title ${title.length} chars`);
    report(desc.length >= 50 && desc.length <= 320, `${s.id}: meta description ${desc.length} chars (50-320)`);

    // keywords
    const keywords = Array.isArray(s.seoKeywords) ? s.seoKeywords : [s.title, settings.shortName || 'ABS Network'];
    report(keywords.length >= 1 && keywords.every((k) => k && k.trim().length > 0), `${s.id}: keywords present`);

    // robots flags are explicit booleans (default index/follow)
    report(
      s.robotsIndex !== false && s.robotsFollow !== false,
      `${s.id}: robots index/follow enabled`
    );

    // social image for OG (BRANDED_SOCIAL_IMAGE = /images/abs-network-og.jpg fallback)
    const img = s.socialImage || s.imageUrl;
    report(
      !!img || existsSync(resolve(root, 'public/images/abs-network-og.jpg')),
      `${s.id}: OG image available`
    );

    // display order
    report(
      typeof s.displayOrder === 'number' && s.displayOrder >= 0,
      `${s.id}: displayOrder=${s.displayOrder}`
    );
  });

  // Featured flag sanity
  const featured = published.filter((s) => s.isFeatured);
  report(
    featured.length >= 1,
    `homepage featured services: ${featured.length}`
  );

  // ---- Previous-slug redirect collision check ---------------------------
  const prevMap = new Map();
  services.forEach((s) => {
    (s.previousSlugs || []).forEach((p) => {
      if (prevMap.has(p)) report(false, `previousSlug "${p}" collides (${s.id} vs ${prevMap.get(p)})`);
      else prevMap.set(p, s.id);
    });
  });
  console.log(`\n--- Legacy slug redirects (${prevMap.size} total) ---`);
  prevMap.forEach((owner, slug) => report(true, `"${slug}" -> ${owner}`));

  // ---- Summary counts -----------------------------------------------------
  console.log(`\n--- URL inventory ---`);
  const urls = [
    ...STATIC_ROUTES.map((r) => SITE_URL + r),
    ...published.map((s) => `${SITE_URL}/services/${s.slug}`),
  ];
  console.log(`  ${STATIC_ROUTES.length} static URLs + ${published.length} service URLs = ${urls.length} total`);

  const fails = results.filter((r) => !r.ok).length;
  console.log(`\n=== RESULT: ${results.length - fails}/${results.length} checks passed (${fails} failed) ===`);

  // ---- Optional live crawl ----------------------------------------------
  if (baseUrl) {
    console.log(`\n--- Live crawl against ${baseUrl} ---`);
    const failures = await crawl(baseUrl, urls);
    if (failures.length) {
      console.log(`  FAILED ${failures.length} URLs`);
      failures.forEach((f) => console.log(`    - ${f}`));
    } else {
      console.log('  All URLs healthy (200, canonical, title, meta-description, JSON-LD).');
    }
  }

  if (fails > 0) process.exitCode = 1;
}

async function crawl(baseUrl, urls) {
  const failures = [];
  for (const fullUrl of urls) {
    const path = fullUrl.replace(SITE_URL, '');
    const url = (baseUrl + path).replace(/\/$/, path === '/' ? '/' : '');
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'abs-seo-validator' } });
      if (res.status !== 200) {
        failures.push(`${path} -> HTTP ${res.status}`);
        continue;
      }
      const html = await res.text();
      const checks = [];
      if (!/<title>[^<]*<\/title>/.test(html)) checks.push('missing <title>');
      if (!/<meta name="description"[^>]*>/.test(html)) checks.push('missing meta description');
      if (!/application\/ld\+json/.test(html)) checks.push('missing JSON-LD');
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
      if (canonical && !canonical[1].includes('/services/')) {
        // canonical must be a real service URL (not homepage) on detail pages
        if (path.startsWith('/services/') && path !== '/services') {
          checks.push(`canonical "${canonical[1]}" not service-specific`);
        }
      }
      if (checks.length) failures.push(`${path} -> ${checks.join(', ')}`);
    } catch (e) {
      failures.push(`${path} -> fetch error: ${e.message}`);
    }
  }
  return failures;
}

main();
