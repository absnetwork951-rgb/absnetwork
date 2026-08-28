#!/usr/bin/env node
/**
 * ABS Network Broadband — Supabase CMS seed (business/content data)
 * -------------------------------------------------------------------
 * RUN:  node scripts/seed-supabase.mjs
 *
 * Requirements (server-side only):
 *   SUPABASE_SERVICE_ROLE_KEY   (never in NEXT_PUBLIC_*)
 *   NEXT_PUBLIC_SUPABASE_URL
 *
 * Reads .env.local automatically (process env wins).
 *
 * Idempotent:
 *   - site_settings       upserted by fixed id 1
 *   - packages/services   upserted by legacy_id (then slug uniqueness enforced)
 *   - categories/brands   upserted by slug
 *   - products            upserted by slug (legacy_id retained)
 *   - faqs                upserted by slug
 * Safe to re-run — it never deletes or duplicates.
 *
 * The demo PRODUCT catalog below is created because the existing JSON datastore
 * currently has an empty shop catalog; it supplies the product rows that the
 * demo image seeder (scripts/seed-product-images.mjs) then attaches images to.
 * Demo products/brands are clearly demo content, editable in the admin CMS.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

// ---- env loader (no dotenv dependency) -----------------------------------
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
  console.error('[seed-supabase] BLOCKED: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  console.error('[seed-supabase] Add SUPABASE_SERVICE_ROLE_KEY to .env.local (server-side secret) and run the SQL migration first.');
  process.exit(2);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

// ---- helpers ----------------------------------------------------------------
async function upsert(table, rows, onConflict) {
  if (rows.length === 0) return;
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict, ignoreDuplicates: false });
  if (error) {
    console.error(`[seed-supabase] FAILED upsert ${table}: ${error.message}`);
    process.exitCode = 1;
    throw error;
  }
  console.log(`[seed-supabase] upsert ${table}: ${rows.length} rows`);
}

async function selectId(table, column, value) {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq(column, value)
    .maybeSingle();
  if (error) return null;
  return data?.id ?? null;
}

// ---- load existing JSON backup (kept for reference, not runtime) ------------
function readJson(rel) {
  const p = resolve(process.cwd(), rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}
const db = readJson('data/abs_database.json');

// =============================================================================
// 1. site_settings
// =============================================================================
if (db?.settings) {
  const s = db.settings;
  await upsert('site_settings', [
    {
      id: 1,
      company_name: s.companyName ?? '',
      short_name: s.shortName ?? '',
      legal_registration: s.legalRegistration ?? '',
      tagline: s.tagline ?? '',
      phone: s.phone ?? '',
      support_phone: s.supportPhone ?? '',
      whatsapp: s.whatsapp ?? '',
      email: s.email ?? '',
      sales_email: s.salesEmail ?? '',
      support_email: s.supportEmail ?? '',
      address: s.address ?? '',
      city: s.city ?? '',
      business_hours: s.businessHours ?? '',
      facebook_url: s.facebookUrl ?? null,
      instagram_url: s.instagramUrl ?? null,
      linkedin_url: s.linkedinUrl ?? null,
      twitter_url: s.twitterUrl ?? null,
      hero_headline: s.heroHeadline ?? '',
      hero_subheadline: s.heroSubheadline ?? '',
      footer_notice: s.footerNotice ?? '',
      shop_banner_text: s.shopBannerText ?? '',
      stats_fiber_coverage_km: s.statsFiberCoverageKm ?? 0,
      stats_active_subscribers: s.statsActiveSubscribers ?? 0,
      stats_uptime_guarantee: s.statsUptimeGuarantee ?? '',
      stats_shop_product_count: s.statsShopProductCount ?? 0,
    },
  ], 'id');
}

// =============================================================================
// 2. packages  (pricing rule: fixed => price + tax_note; contact => price NULL)
// =============================================================================
if (Array.isArray(db?.packages) && db.packages.length) {
  const rows = db.packages.map((p) => {
    const contact = p.priceType === 'contact' || p.pricePkr <= 0;
    return {
      legacy_id: p.id,
      name: p.name ?? '',
      slug: p.slug ?? '',
      category: p.category ?? 'residential',
      speed_mbps: p.speedMbps ?? 0,
      upload_speed_mbps: p.uploadSpeedMbps ?? null,
      pricing_type: contact ? 'contact' : 'fixed',
      price: contact ? null : p.pricePkr,
      tax_note: '+ TAX',
      billing_period: p.billingPeriod ?? 'Monthly',
      installation_fee: p.installationFeePkr ?? 0,
      data_limit: p.dataLimit ?? '',
      short_description: p.shortDescription ?? null,
      router_included: p.routerIncluded ?? true,
      router_details: p.routerDetails ?? null,
      features: (p.features ?? []).filter(Boolean),
      is_popular: p.isPopular ?? false,
      is_active: p.isActive ?? true,
      display_order: p.displayOrder ?? 0,
    };
  });
  await upsert('packages', rows, 'slug');
}

// =============================================================================
// 3. services
// =============================================================================
if (Array.isArray(db?.services) && db.services.length) {
  const rows = db.services.map((s) => ({
    legacy_id: s.id,
    title: s.title ?? '',
    slug: s.slug ?? '',
    short_description: s.shortDescription ?? '',
    full_description: s.fullDescription ?? '',
    icon_name: s.iconName ?? '',
    category: s.category ?? 'broadband',
    badge: s.badge ?? null,
    features: (s.features ?? []).filter(Boolean),
    capabilities: (s.capabilities ?? []).filter(Boolean),
    is_active: s.isActive ?? true,
    display_order: s.displayOrder ?? 0,
  }));
  await upsert('services', rows, 'slug');
}

// =============================================================================
// 4+5. product_categories + product_brands (demo catalog)
// =============================================================================
const CATEGORIES = [
  { name: 'Routers', slug: 'routers', description: 'Wireless broadband and fiber routers', icon: 'Router' },
  { name: 'Network Switches', slug: 'network-switches', description: 'Managed and unmanaged Ethernet switches', icon: 'Network' },
  { name: 'Optical Devices', slug: 'optical-devices', description: 'ONU/ONT terminals, optical modems and SFP modules', icon: 'Cable' },
  { name: 'Network Cables', slug: 'network-cables', description: 'Cat5e, Cat6 and structured cabling', icon: 'Cable' },
  { name: 'Fiber Optics', slug: 'fiber-optics', description: 'Fiber patch cords and single-mode/multi-mode fiber', icon: 'Cable' },
  { name: 'Fiber Accessories', slug: 'fiber-accessories', description: 'Connectors, adapters, splices and termination kits', icon: 'Settings' },
  { name: 'Network Accessories', slug: 'network-accessories', description: 'PoE adapters, power supplies and mounting gear', icon: 'Zap' },
  { name: 'Tools & Testing', slug: 'tools-testing', description: 'Crimping, OTDR and network test equipment', icon: 'Wrench' },
  { name: 'Rack & Cabinet', slug: 'rack-cabinet', description: 'Racks, cabinets, patch panels and organizers', icon: 'Server' },
  { name: 'Other', slug: 'other', description: 'Miscellaneous networking equipment', icon: 'Package' },
];
await upsert('product_categories',
  CATEGORIES.map((c, i) => ({ ...c, legacy_id: `cat_${c.slug}`, is_active: true, display_order: i + 1 })),
  'slug');

const BRANDS = [
  { name: 'ABS Network', slug: 'abs-network', description: 'ABS own-brand fiber and networking equipment' },
  { name: 'OEM Compatible', slug: 'oem-compatible', description: 'Compatible, vendor-neutral networking hardware' },
];
await upsert('product_brands',
  BRANDS.map((b, i) => ({ ...b, legacy_id: `brand_${b.slug}`, is_active: true, display_order: i + 1 })),
  'slug');

// ---- resolve FK ids after upsert --------------------------------------------
const catIds = {};
for (const c of CATEGORIES) catIds[c.slug] = await selectId('product_categories', 'slug', c.slug);
const brandIds = {};
for (const b of BRANDS) brandIds[b.slug] = await selectId('product_brands', 'slug', b.slug);

// =============================================================================
// 6. products (small demo catalog; images added by scripts/seed-product-images.mjs)
// =============================================================================
const PRODUCTS = [
  {
    legacy_id: 'demo_router_ax3000',
    name: 'ABS AX3000 Dual-Band Wi-Fi 6 Fiber Router',
    slug: 'abs-ax3000-wifi-6-router',
    category: 'routers',
    brand: 'abs-network',
    model: 'AX3000-FT',
    sku: 'ABS-AX3000-FT',
    price: 6999,
    compare_price: 8999,
    stock_status: 'in_stock',
    stock_quantity: 25,
    warranty_years: 1,
    short_description: 'Dual-band Wi-Fi 6 router with gigabit fiber WAN passthrough for homes and small offices.',
    full_description: 'The ABS AX3000 delivers simultaneous 2.4 GHz and 5 GHz bands with GameFast QoS, gigabit LAN ports and a dedicated fiber WAN slot. Ideal as a gateway for ABS GPON fiber installations.',
    specifications: {
      'Standards': 'IEEE 802.11ax / ac / a / b / g / n',
      'Bands': '2.4 GHz + 5 GHz (AX3000)',
      'Throughput': '574 Mbps + 2402 Mbps',
      'LAN Ports': '4 x Gigabit Ethernet',
      'WAN': '1 x Gigabit + SFP (fiber)',
      'QoS': 'GameFast priority queue',
    },
    features: [
      'Wi-Fi 6 dual-band up to 3000 Mbps',
      'Fiber SFP WAN port for GPON gateways',
      '4 x Gigabit LAN ports',
      'Dedicated GameFast gaming QoS',
      'Parental controls and guest Wi-Fi',
    ],
    is_featured: true,
    is_active: true,
    display_order: 1,
  },
  {
    legacy_id: 'demo_ont_gpon',
    name: 'ABS GPON ONT 1GE Optical Network Terminal',
    slug: 'abs-gpon-ont-1ge',
    category: 'optical_devices',
    brand: 'abs-network',
    model: 'ONT-1GE-G',
    sku: 'ABS-ONT-1GE-G',
    price: 2499,
    compare_price: 3999,
    stock_status: 'in_stock',
    stock_quantity: 40,
    warranty_years: 1,
    short_description: 'Single-port GPON ONT (Optical Network Terminal) with 1 GE port for FTTH broadband.',
    full_description: 'Compact GPON ONT providing true fiber-to-the-home connectivity with a single gigabit LAN port, low power consumption, and TR-069 remote management compatibility.',
    specifications: {
      'Standard': 'ITU-T G.984 (GPON)',
      'Wavelength': '1490 nm down / 1310 nm up',
      'LAN Port': '1 x Gigabit Ethernet',
      'Power': '12V / 0.5A DC adapter',
      'Management': 'TR-069, OMCI',
    },
    features: [
      'GPON FTTH optical network terminal',
      '1 x Gigabit Ethernet RJ-45 port',
      'TR-069 / OMCI remote management',
      'LED status indicators',
      'Wall-mountable design',
    ],
    is_featured: true,
    is_active: true,
    display_order: 2,
  },
  {
    legacy_id: 'demo_switch_24g',
    name: 'ABS 24-Port Gigabit Managed L2+ Switch',
    slug: 'abs-24port-gigabit-managed-switch',
    category: 'network-switches',
    brand: 'abs-network',
    model: 'SW-24G-M',
    sku: 'ABS-SW-24G-M',
    price: 39999,
    compare_price: 45999,
    stock_status: 'in_stock',
    stock_quantity: 8,
    warranty_years: 2,
    short_description: '24-port managed gigabit switch with 4 SFP uplinks for enterprise and ISP distribution.',
    full_description: 'Layer-2+ managed switch with full VLAN, QoS, link aggregation, and 4 combo SFP fiber uplinks. Ideal for MDUs, offices and ISP access-layer deployments.',
    specifications: {
      'Ports': '24 x 10/100/1000 Mbps + 4 x SFP',
      'Switching Capacity': '56 Gbps',
      'VLAN': '802.1Q up to 4096 groups',
      'Management': 'Web / CLI / SNMP',
      'Fanless': 'No (active cooling)',
    },
    features: [
      '24 gigabit ports + 4 SFP uplinks',
      'Full Layer-2+ switching feature set',
      '802.1Q VLAN and port isolation',
      'SNMP / CLI / web management',
      'Rack-mountable 1U chassis',
    ],
    is_featured: false,
    is_active: true,
    display_order: 3,
  },
  {
    legacy_id: 'demo_ap_ac1200',
    name: 'ABS AC1200 Dual-Band Ceiling Access Point',
    slug: 'abs-ac1200-ceiling-access-point',
    category: 'routers',
    brand: 'abs-network',
    model: 'AP-AC1200-C',
    sku: 'ABS-AP-AC1200-C',
    price: 8999,
    compare_price: 10999,
    stock_status: 'low_stock',
    stock_quantity: 5,
    warranty_years: 1,
    short_description: '802.11ac dual-band ceiling access point with PoE for offices and MDUs.',
    full_description: 'PoE-powered ceiling access point delivering up to 1200 Mbps, 802.3af PoE, and centralized controller support — suited for offices, hotels and multi-dwelling units.',
    specifications: {
      'Standard': 'IEEE 802.11ac wave 2',
      'Throughput': '300 + 867 Mbps (AC1200)',
      'Power': '802.3af PoE',
      'Mount': 'Ceiling / wall',
      'Management': 'Controller + standalone',
    },
    features: [
      'Dual-band 802.11ac up to 1200 Mbps',
      '802.3af PoE powered (no separate PSU)',
      'Ceiling and wall mounting',
      'Part of scalable controller mesh',
    ],
    is_featured: false,
    is_active: true,
    display_order: 4,
  },
  {
    legacy_id: 'demo_cat6_cable',
    name: 'ABS Cat6 UTP LAN Cable (305 m Box)',
    slug: 'abs-cat6-utp-lan-cable-305m',
    category: 'network-cables',
    brand: 'abs-network',
    model: 'CAT6-UTP-305',
    sku: 'ABS-CAT6-305',
    price: 7950,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 30,
    warranty_years: 1,
    short_description: 'Category 6 UTP bulk cable, 24 AWG, PVC jacket, 305 m pull box — certified for Gigabit runs.',
    full_description: 'High-performance Cat6 UTP cable engineered for Gigabit Ethernet and PoE deployments, with 23-24 AWG solid copper conductors and reduced crosstalk for reliable structured cabling.',
    specifications: {
      'Category': 'Cat6 UTP',
      'Length': '305 m (1000 ft) box',
      'Conductor': '24 AWG solid bare copper',
      'Jacket': 'PVC / LSZH option',
      'Bandwidth': '250 MHz',
    },
    features: [
      'Certified 250 MHz Cat6 performance',
      'Solid copper for stable PoE',
      'Pull box with sequential markings',
      'Ideal for structured cabling',
    ],
    is_featured: false,
    is_active: true,
    display_order: 5,
  },
  {
    legacy_id: 'demo_fiber_patch_sc',
    name: 'ABS Single-Mode SC-SC Fiber Patch Cord (2 m)',
    slug: 'abs-sm-sc-sc-fiber-patch-2m',
    category: 'fiber-optics',
    brand: 'abs-network',
    model: 'SM-SCSC-2',
    sku: 'ABS-SM-SCSC-2',
    price: 650,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 120,
    warranty_years: 1,
    short_description: 'G.652D single-mode duplex fiber patch cord with SC connectors, 2 m — for ONT and switch links.',
    full_description: 'Low-loss G.652D single-mode patch cord terminated with SC/UPC connectors, ideal for ONT-to-router, patch panel and switch interconnects in fiber networks.',
    specifications: {
      'Fiber': 'G.652D single-mode',
      'Connector': 'SC-SC (UPC)',
      'Length': '2 m',
      'Insertion Loss': '< 0.3 dB',
      'Jacket': 'LSZH',
    },
    features: [
      'Low insertion loss (< 0.3 dB)',
      'Duplex single-mode construction',
      'SC/UPC connectors both ends',
      'Dropbox-friendly bend radius',
    ],
    is_featured: false,
    is_active: true,
    display_order: 6,
  },
  {
    legacy_id: 'demo_fiber_kit',
    name: 'ABS Fiber Connector & Adapter Kit (SC/LC)',
    slug: 'abs-fiber-connector-adapter-kit',
    category: 'fiber-accessories',
    brand: 'abs-network',
    model: 'FC-KIT-SCLC',
    sku: 'ABS-FC-KIT-SCLC',
    price: 1200,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 60,
    warranty_years: 0,
    short_description: 'Field termination kit with SC/LC connectors, adapters, and cleaning tools for fiber splicing and patching.',
    full_description: 'Complete accessory set for terminating and joining fiber — SC and LC connectors, duplex adapters, caps, and cleaning accessories for maintenance teams and home installs.',
    specifications: {
      'Includes': 'SC + LC connectors, adapters',
      'Polish': 'UPC / APC',
      'Use': 'Field termination & patching',
      'Case': 'Hard storage case',
    },
    features: [
      'SC and LC connector assortment',
      'Duplex adapters for panel patching',
      'Includes cleaning and safety tools',
      'Hard carry case',
    ],
    is_featured: false,
    is_active: true,
    display_order: 7,
  },
  {
    legacy_id: 'demo_poe_adapter',
    name: 'ABS 48V PoE Power Adapter (802.3af/at)',
    slug: 'abs-48v-poe-power-adapter',
    category: 'network-accessories',
    brand: 'oem-compatible',
    model: 'POE-48V-1P',
    sku: 'ABS-POE-48V-1P',
    price: 1450,
    compare_price: 1799,
    stock_status: 'in_stock',
    stock_quantity: 45,
    warranty_years: 1,
    short_description: 'Single-port 802.3af/at PoE injector/adapter (48 V) for access points, cameras and switches.',
    full_description: 'Compact PoE power adapter injecting 48 V @ 30 W to a single network port — powers access points, IP cameras, and small switches without a PoE switch.',
    specifications: {
      'Standard': 'IEEE 802.3af / 802.3at',
      'Output': '48V DC, up to 30 W',
      'Data': '10/100/1000 Mbps pass-through',
      'Input': '100-240V AC',
    },
    features: [
      '802.3af/at compliant injection',
      'Gigabit data pass-through',
      'LED power and link indicators',
      'Slim wall-plug design',
    ],
    is_featured: false,
    is_active: true,
    display_order: 8,
  },
];

const productRows = [];
for (const p of PRODUCTS) {
  productRows.push({
    legacy_id: p.legacy_id,
    name: p.name,
    slug: p.slug,
    category_id: catIds[p.category] ?? null,
    brand_id: brandIds[p.brand] ?? null,
    model: p.model,
    sku: p.sku ?? null,
    price: p.price,
    compare_price: p.compare_price ?? null,
    stock_status: p.stock_status,
    stock_quantity: p.stock_quantity,
    warranty_years: p.warranty_years,
    short_description: p.short_description,
    full_description: p.full_description,
    specifications: p.specifications,
    features: p.features,
    is_featured: p.is_featured,
    is_active: p.is_active,
    display_order: p.display_order,
  });
}
await upsert('products', productRows, 'slug');

// =============================================================================
// 7. faqs (curated CMS FAQ content)
// =============================================================================
const FAQS = [
  {
    legacy_id: 'faq_activation',
    question: 'How quickly can I get activation after subscribing?',
    answer: 'Standard installations are scheduled within 2-3 working days after confirmation. Pre-verified fiber-covered premises can be activated the same day.'
  },
  {
    legacy_id: 'faq_coverage',
    question: 'Is my area covered by fiber?',
    answer: 'Coverage is expanding across Islamabad. Use the "Check Availability" form on the contact page and our team will confirm fiber connectivity at your address within a few hours.'
  },
  {
    legacy_id: 'faq_router',
    question: 'Is a router included with my plan?',
    answer: 'Yes. Every residential plan includes a dual-band gigabit Wi-Fi router/ONT. Business and enterprise plans include managed fiber gateways with optional advanced configurations.'
  },
  {
    legacy_id: 'faq_unlimited',
    question: 'Do you enforce a data cap or FUP?',
    answer: 'Residential plans marked "Truly Unlimited" carry no fair usage policy cap. Business and enterprise plans operate on dedicated 1:1 CIR bandwidth with contractual SLAs.'
  },
  {
    legacy_id: 'faq_existing_connection',
    question: 'Can I keep my existing indoor cabling?',
    answer: 'In most cases yes — we terminate our fiber at the nearest feasible point and reuse existing structured cabling where it meets Gigabit standards. Our technician will inspect on site.'
  },
];
await upsert('faqs',
  FAQS.map((f, i) => ({ ...f, is_active: true, display_order: i + 1 })),
  'legacy_id');

console.log('[seed-supabase] DONE.');