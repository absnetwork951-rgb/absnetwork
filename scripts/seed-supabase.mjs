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
  { name: 'TP-Link', slug: 'tp-link', description: 'Consumer and SMB networking hardware' },
  { name: 'Huawei', slug: 'huawei', description: 'Carrier-grade GPON and routing equipment' },
  { name: 'Ubiquiti', slug: 'ubiquiti', description: 'UniFi and EdgeMAX networking gear' },
];
await upsert('product_brands',
  BRANDS.map((b, i) => ({ ...b, legacy_id: `brand_${b.slug}`, is_active: true, display_order: i + 1 })),
  'slug');

// ---- resolve FK ids after upsert (single bulk fetch — no per-slug request to
// ---- be silently lost on a transient network error). Both tables are
// ---- slug-unique, so Object.fromEntries is safe. ----------------------------
const catRes = await supabase.from('product_categories').select('id, slug');
if (catRes.error) {
  console.error(`[seed-supabase] FAILED loading product_categories: ${catRes.error.message}`);
  process.exit(1);
}
const catIds = Object.fromEntries((catRes.data ?? []).map((r) => [r.slug, r.id]));

const brandRes = await supabase.from('product_brands').select('id, slug');
if (brandRes.error) {
  console.error(`[seed-supabase] FAILED loading product_brands: ${brandRes.error.message}`);
  process.exit(1);
}
const brandIds = Object.fromEntries((brandRes.data ?? []).map((r) => [r.slug, r.id]));

// Guard: a product whose category FK is unresolved would silently render in the
// public shop as category "other" — fail loudly instead of seeding bad rows.
for (const c of CATEGORIES) {
  if (!catIds[c.slug]) {
    console.error(`[seed-supabase] FATAL: product_categories slug "${c.slug}" has no id.`);
    process.exit(1);
  }
}

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
    category: 'optical-devices',
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
  {
    legacy_id: 'demo_router_wifi7',
    name: 'ABS Wi-Fi 7 Dual-Band Fiber Gateway',
    slug: 'abs-wifi7-dual-band-fiber-gateway',
    category: 'routers',
    brand: 'abs-network',
    model: 'GW-WIFI7',
    sku: 'ABS-GW-WIFI7',
    price: 15999,
    compare_price: 18999,
    stock_status: 'in_stock',
    stock_quantity: 18,
    warranty_years: 1,
    short_description: 'Next-generation Wi-Fi 7 dual-band gateway tuned for 2.5 Gbps fiber plans and heavy multi-device homes.',
    full_description: 'The ABS GW-WIFI7 brings Wi-Fi 7 multi-link operation to residential fiber with a 2.5 GbE WAN/LAN port, MU-MIMO and OFDMA scheduling, plus a dedicated gaming priority queue. Pairs natively with ABS GPON ONTs.',
    specifications: {
      'Standards': 'IEEE 802.11be (Wi-Fi 7) backward compatible',
      'Bands': '2.4 GHz + 5 GHz (BE6500 class)',
      'WAN/LAN': '1 x 2.5 GbE + 3 x Gigabit LAN',
      'Security': 'WPA3-Personal / Enterprise',
      'Management': 'ABS Cloud app + web UI',
    },
    features: [
      'Wi-Fi 7 dual-band, backward compatible',
      '2.5 GbE WAN port for high-tier fiber',
      'MU-MIMO + OFDMA for crowded homes',
      'Dedicated gaming and streaming QoS',
      'WPA3 security with guest network',
    ],
    is_featured: true,
    is_active: true,
    display_order: 9,
  },
  {
    legacy_id: 'demo_router_tp_ax55',
    name: 'TP-Link Archer AX55 AX3000 Wi-Fi 6 Router',
    slug: 'tp-link-archer-ax55-ax3000-router',
    category: 'routers',
    brand: 'tp-link',
    model: 'Archer AX55',
    sku: 'TPL-AX55',
    price: 17999,
    compare_price: 21000,
    stock_status: 'in_stock',
    stock_quantity: 12,
    warranty_years: 1,
    short_description: 'AX3000 dual-band Wi-Fi 6 router with gigabit ports — a proven upgrade for fiber homes.',
    full_description: 'The TP-Link Archer AX55 delivers AX3000 speeds across 2.4 GHz and 5 GHz with OFDMA, four gigabit LAN ports and robust home coverage. Includes TP-Link HomeShield security and easy app control.',
    specifications: {
      'Standards': 'IEEE 802.11ax',
      'Throughput': '574 Mbps + 2402 Mbps (AX3000)',
      'LAN Ports': '4 x Gigabit Ethernet',
      'USB': '1 x USB 3.0',
      'Security': 'WPA3 + HomeShield',
    },
    features: [
      'AX3000 dual-band Wi-Fi 6',
      '4 gigabit LAN + gigabit WAN',
      'OFDMA with better multi-device efficiency',
      'HomeShield security suite',
      'TP-Link app setup and VPN client',
    ],
    is_featured: false,
    is_active: true,
    display_order: 10,
  },
  {
    legacy_id: 'demo_router_lte_failover',
    name: 'ABS 4G/LTE Failover Router for Fiber Backup',
    slug: 'abs-4g-lte-failover-router',
    category: 'routers',
    brand: 'abs-network',
    model: 'LTE-FBR-1',
    sku: 'ABS-LTE-FBR-1',
    price: 12499,
    compare_price: 14500,
    stock_status: 'pre_order',
    stock_quantity: 6,
    warranty_years: 1,
    short_description: 'Automatic 4G/LTE failover router that keeps business lines alive if fiber drops.',
    full_description: 'Dual-WAN router with a built-in 4G/LTE modem that automatically fails over to cellular when the fiber uplink goes down. Gigabit Ethernet WAN, dual antennas and remote SIM management for business continuity.',
    specifications: {
      'WAN': '1 x Gigabit Ethernet + 1 x 4G/LTE',
      'Bands': 'LTE FDD/TDD (B1/B3/B5/B7/B8/B20/B28/B40)',
      'Antennas': '2 x external 5 dBi',
      'LAN': '4 x Gigabit Ethernet',
      'Failover': 'Automatic < 5 s',
    },
    features: [
      'Automatic fiber-to-LTE failover',
      'Gigabit Ethernet WAN + LAN',
      'External antennas for weak coverage',
      'Remote monitoring dashboard',
      'Business continuity for shops and offices',
    ],
    is_featured: false,
    is_active: true,
    display_order: 11,
  },
  {
    legacy_id: 'demo_switch_8g_poe',
    name: 'ABS 8-Port Gigabit PoE+ Managed Switch',
    slug: 'abs-8port-gigabit-poe-plus-switch',
    category: 'network-switches',
    brand: 'abs-network',
    model: 'SW-8G-POE+',
    sku: 'ABS-SW-8G-POE',
    price: 15999,
    compare_price: 18500,
    stock_status: 'in_stock',
    stock_quantity: 20,
    warranty_years: 2,
    short_description: '8-port gigabit switch with 8x PoE+ (120 W budget) for cameras, APs and IP phones.',
    full_description: 'Managed L2 switch offering 8 gigabit ports with 802.3at/af PoE+ injection and a 120 W budget — ideal for powering access points and CCTV on small business networks. Web/CLI managed with VLAN and QoS.',
    specifications: {
      'Ports': '8 x 10/100/1000 Mbps + 2 x SFP',
      'PoE': '802.3af/at, 120 W budget',
      'Switching Capacity': '20 Gbps',
      'Management': 'Web / CLI / SNMP',
      'Mount': 'Desktop / wall / rack kit',
    },
    features: [
      '8 PoE+ gigabit ports, 120 W budget',
      '2 SFP fiber uplinks',
      '802.1Q VLAN and QoS',
      'Fanless quiet operation',
      'Rack and wall mounting kit included',
    ],
    is_featured: false,
    is_active: true,
    display_order: 12,
  },
  {
    legacy_id: 'demo_switch_ubnt_lite8',
    name: 'Ubiquiti UniFi Switch Lite 8 PoE',
    slug: 'ubiquiti-unifi-switch-lite-8-poe',
    category: 'network-switches',
    brand: 'ubiquiti',
    model: 'USW-Lite-8-PoE',
    sku: 'UBNT-USW-LITE-8-POE',
    price: 27999,
    compare_price: 31500,
    stock_status: 'in_stock',
    stock_quantity: 9,
    warranty_years: 1,
    short_description: '8-port PoE UniFi switch managed from the UniFi Network console — perfect for UniFi AP fleets.',
    full_description: 'Silent, fanless UniFi Switch Lite 8 PoE powers UniFi access points and cameras, managed centrally from the UniFi Network application. Four PoE+ ports, 52 W budget and a 1 Gbps SFP uplink.',
    specifications: {
      'Ports': '8 x GbE (4 PoE+) + 1 x SFP',
      'PoE Budget': '52 W (802.3af/at)',
      'Management': 'UniFi Network console',
      'Switching': 'Non-blocking design',
      'Mount': 'Desktop / 1U rack ears',
    },
    features: [
      'Managed in UniFi Network dashboard',
      '4 x PoE+ with 52 W budget',
      'Fanless and silent',
      'SFP uplink for fiber aggregation',
      'Auto-discovery of UniFi devices',
    ],
    is_featured: false,
    is_active: true,
    display_order: 13,
  },
  {
    legacy_id: 'demo_ont_huawei_stick',
    name: 'Huawei MA5671A GPON ONT Stick',
    slug: 'huawei-ma5671a-gpon-ont-stick',
    category: 'optical-devices',
    brand: 'huawei',
    model: 'MA5671A',
    sku: 'HUA-MA5671A',
    price: 4499,
    compare_price: 5500,
    stock_status: 'low_stock',
    stock_quantity: 4,
    warranty_years: 1,
    short_description: 'SFP-class GPON ONT module that turns any SFP router/switch port into a fiber WAN.',
    full_description: 'The Huawei MA5671A plugs directly into an SFP port and terminates a GPON line without an external ONT. A favorite of power users and ISPs for replacing carrier ONTs on advanced routers.',
    specifications: {
      'Standard': 'ITU-T G.984 (GPON)',
      'Form Factor': 'SFP (SC/PC)',
      'Wavelength': '1310 nm TX / 1490 nm RX',
      'Speed': '2.5 Gbps down / 1.25 Gbps up',
      'Compatibility': 'Needs SFP-capable router/switch',
    },
    features: [
      'Bridges GPON into an SFP slot',
      'No separate ONT power supply',
      'PON power budget Class B+/C+',
      'TR-069 / OMCI manageable',
      'Needs compatible SFP WAN gateway',
    ],
    is_featured: false,
    is_active: true,
    display_order: 14,
  },
  {
    legacy_id: 'demo_ont_wifi6',
    name: 'ABS GPON Home Gateway Wi-Fi 6 ONT',
    slug: 'abs-gpon-home-gateway-wifi6-ont',
    category: 'optical-devices',
    brand: 'abs-network',
    model: 'ONT-W6-4GE',
    sku: 'ABS-ONT-W6-4GE',
    price: 3799,
    compare_price: 4200,
    stock_status: 'in_stock',
    stock_quantity: 35,
    warranty_years: 1,
    short_description: 'All-in-one GPON ONT with built-in Wi-Fi 6 router, 4 gigabit LAN ports and voice capability.',
    full_description: 'A compact FTTH gateway combining a GPON ONT, a Wi-Fi 6 access point and a 4-port gigabit router. Includes OMCI/TR-069 management and wall-mount housing — ideal for single-box fiber installs.',
    specifications: {
      'Standard': 'ITU-T G.984 GPON',
      'Wi-Fi': 'Wi-Fi 6 AX1800 dual-band',
      'LAN': '4 x Gigabit Ethernet + USB',
      'Voice': '1 x FXS POTS (SIP)',
      'Management': 'TR-069 / OMCI',
    },
    features: [
      'GPON ONT, router and Wi-Fi in one',
      'Wi-Fi 6 dual-band AX1800',
      '4 gigabit LAN ports',
      'Optional SIP voice port',
      'TR-069 remote provisioning',
    ],
    is_featured: false,
    is_active: true,
    display_order: 15,
  },
  {
    legacy_id: 'demo_cat6_patch_lead',
    name: 'ABS Cat6 RJ45 Patch Leads (10-Pack, 1 m)',
    slug: 'abs-cat6-rj45-patch-lead-10pack-1m',
    category: 'network-cables',
    brand: 'abs-network',
    model: 'PT6-CM-24-10',
    sku: 'ABS-PT6-1M-10',
    price: 2499,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 55,
    warranty_years: 0,
    short_description: 'Ten 1 m Cat6 snagless patch leads with 24 AWG stranded copper for patching racks and desks.',
    full_description: 'Stranded 24 AWG Cat6 patch cords with snagless boots and gold-plated RJ45 contacts. Certified to 250 MHz for gigabit and PoE patching between switches, panels and endpoints.',
    specifications: {
      'Category': 'Cat6, 250 MHz',
      'Length': '1 m (10 piece pack)',
      'Conductor': '24 AWG stranded bare copper',
      'Connector': 'RJ45 gold-plated, snagless',
      'Color': 'Assorted',
    },
    features: [
      'Snagless gold-plated RJ45 boots',
      'Stranded copper for flexible patching',
      'Gigabit + PoE certified',
      '10-piece value pack',
    ],
    is_featured: false,
    is_active: true,
    display_order: 16,
  },
  {
    legacy_id: 'demo_cat5e_cable',
    name: 'ABS Cat5e UTP Bulk Cable (305 m Box)',
    slug: 'abs-cat5e-utp-bulk-cable-305m',
    category: 'network-cables',
    brand: 'abs-network',
    model: 'CAT5E-UTP-305',
    sku: 'ABS-CAT5E-305',
    price: 4950,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 40,
    warranty_years: 1,
    short_description: 'Cat5e UTP bulk cable in a 305 m box — economical Gigabit-rated cabling for homes and offices.',
    full_description: 'Reliable Cat5e UTP bulk cable, 24 AWG solid copper, PVC jacket, in a 305 m pull box. Fully Gigabit and PoE capable, ideal for low-cost structured cabling and long patch-run projects.',
    specifications: {
      'Category': 'Cat5e UTP (100 MHz)',
      'Length': '305 m (1000 ft) box',
      'Conductor': '24 AWG solid bare copper',
      'Jacket': 'PVC (CM)',
      'Color': 'Grey',
    },
    features: [
      'Certified 100 MHz Cat5e',
      'Solid copper conductors',
      '305 m box with length markings',
      'Gigabit and PoE capable',
    ],
    is_featured: false,
    is_active: true,
    display_order: 17,
  },
  {
    legacy_id: 'demo_om3_patch',
    name: 'ABS OM3 LC-LC Duplex Fiber Patch Cord (3 m)',
    slug: 'abs-om3-lc-lc-duplex-fiber-patch-3m',
    category: 'fiber-optics',
    brand: 'abs-network',
    model: 'OM3-LLC-3',
    sku: 'ABS-OM3-LLC-3',
    price: 950,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 90,
    warranty_years: 0,
    short_description: 'OM3 laser-optimized multimode duplex patch cord, LC-LC, 3 m — ready for 10G fiber links.',
    full_description: 'Laser-optimized OM3 multimode fiber with low-loss LC/UPC connectors. Purpose-built for 10 Gigabit Ethernet to 300 m and ideal for switch-to-panel patching in data centers and MDUs.',
    specifications: {
      'Fiber': 'OM3 50/125 µm (3000 MHz·km)',
      'Connector': 'LC-LC duplex (UPC)',
      'Length': '3 m',
      'Insertion Loss': '< 0.25 dB',
      'Jacket': 'LSZH aqua',
    },
    features: [
      '10G-ready OM3 multimode fiber',
      'Low-loss LC/UPC duplex ends',
      'Aqua LSZH jacket',
      '3 m server/patch length',
    ],
    is_featured: false,
    is_active: true,
    display_order: 18,
  },
  {
    legacy_id: 'demo_armored_drop',
    name: 'ABS Armored Single-Mode Drop Cable (1 km)',
    slug: 'abs-armored-sm-drop-cable-1km',
    category: 'fiber-optics',
    brand: 'abs-network',
    model: 'SM-DROP-1K',
    sku: 'ABS-SM-DROP-1K',
    price: 13500,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 12,
    warranty_years: 1,
    short_description: 'Steel-armored G.652D single-mode drop cable with messenger — field-proven for FTTH outdoor drops.',
    full_description: 'G.652D fiber with steel armor and a messenger wire for aerial FTTH drops, plus a 3 mm breakout for indoor termination. Supplied on a 1 km drum with sequential length markings for installers and ISPs.',
    specifications: {
      'Fiber': 'G.652D single-mode, 2 fibers',
      'Armor': 'Corrugated steel tape',
      'Messenger': 'Integrated support wire',
      'Length': '1 km drum',
      'Use': 'Aerial/outdoor FTTH drop',
    },
    features: [
      'Steel-armored for rodent/crush resistance',
      'Integrated messenger for aerial spans',
      '1 km drum with length marks',
      '3 mm breakout for indoor entry',
    ],
    is_featured: false,
    is_active: true,
    display_order: 19,
  },
  {
    legacy_id: 'demo_splice_tray',
    name: 'ABS Fiber Splice Closure & Tray Kit',
    slug: 'abs-fiber-splice-closure-tray-kit',
    category: 'fiber-accessories',
    brand: 'abs-network',
    model: 'SPL-KIT-12',
    sku: 'ABS-SPL-KIT-12',
    price: 2150,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 30,
    warranty_years: 0,
    short_description: 'Weatherproof splice closure with 6 splice trays, holders and protection sleeves for FTTH splicing.',
    full_description: 'In-line splice closure (up to 12 fibers) with gel-sealed ports, a splice tray organizer and heat-shrink protection sleeves — everything a technician needs for outdoor FTTH splices.',
    specifications: {
      'Capacity': 'Up to 12 splices (6 trays)',
      'Protection': 'Heat-shrink + sleeve holders',
      'Sealing': 'Gel / O-ring weatherproof',
      'Ports': '4 cable entry ports',
      'Mount': 'Pole / aerial / manhole',
    },
    features: [
      'Weatherproof in-line closure',
      '6 splice trays included',
      'Heat-shrink and sleeve protection',
      '4 entry ports for drop cabling',
    ],
    is_featured: false,
    is_active: true,
    display_order: 20,
  },
  {
    legacy_id: 'demo_keystone_kit',
    name: 'ABS Cat6 Keystone Jack + Faceplate Kit',
    slug: 'abs-cat6-keystone-jack-faceplate-kit',
    category: 'network-accessories',
    brand: 'abs-network',
    model: 'KST6-FP-04',
    sku: 'ABS-KST6-FP-04',
    price: 1650,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 70,
    warranty_years: 0,
    short_description: 'Cat6 shielded keystone jack with wall faceplate and punch-down tool set for tidy wall drops.',
    full_description: 'Complete wall-outlet kit: a Cat6 tool-less/shielded keystone jack, single-gang faceplate, wall screws and a mini punch-down tool. Produces clean, rattle-free wall terminations on structured cabling.',
    specifications: {
      'Jack': 'Cat6 shielded tool-less keystone',
      'Faceplate': 'Single-gang 1-port white',
      'Termination': '110 / Krone punch-down',
      'Includes': 'Patch cable tie, screws',
      'Color': 'White',
    },
    features: [
      'Tool-less Cat6 keystone option',
      'Clean single-gang wall plate',
      'Mini punch-down tool included',
      'Works with ABS structured cable',
    ],
    is_featured: false,
    is_active: true,
    display_order: 21,
  },
  {
    legacy_id: 'demo_crimp_kit',
    name: 'ABS RJ45 Crimping & Termination Tool Kit',
    slug: 'abs-rj45-crimping-termination-tool-kit',
    category: 'tools-testing',
    brand: 'abs-network',
    model: 'CRIMP-KIT-8P',
    sku: 'ABS-CRIMP-KIT-8P',
    price: 4999,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 25,
    warranty_years: 1,
    short_description: 'Professional RJ45/RJ11 crimper with stripper, cutter and tester — the installer\'s standard kit.',
    full_description: 'All-in-one crimping kit for RJ45/RJ11 plugs, including a ratchet crimper, cable stripper, cutting tool, 50 connectors and a handy canvas pouch. The go-to kit for cable termination jobs.',
    specifications: {
      'Crimper': 'Ratchet type RJ45/RJ11/RJ12',
      'Includes': 'Stripper, cutter, 50x RJ45',
      'Body': 'Zinc alloy, ergonomic grip',
      'Testing': 'LED continuity tester included',
      'Case': 'Canvas tool pouch',
    },
    features: [
      'Ratchet crimper with die sets',
      '50 RJ45 connectors included',
      'Stripper, cutter and tester bundled',
      'Hard-wearing canvas pouch',
    ],
    is_featured: true,
    is_active: true,
    display_order: 22,
  },
  {
    legacy_id: 'demo_opm_vfl',
    name: 'ABS Optical Power Meter + VFL Tester',
    slug: 'abs-optical-power-meter-vfl-tester',
    category: 'tools-testing',
    brand: 'abs-network',
    model: 'OPM-VFL-01',
    sku: 'ABS-OPM-VFL-01',
    price: 27999,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 14,
    warranty_years: 1,
    short_description: 'Calibrated optical power meter with 10 mW visual fault locator for FTTH install and repair.',
    full_description: 'Dual-function OPM/VFL tester measuring 850/1300/1310/1490/1550 nm and locating breaks with a 10 mW red laser. Backlit LCD, auto-power-off and rechargeable battery for field technicians.',
    specifications: {
      'OPM Wavelengths': '850/1300/1310/1490/1550 nm',
      'Range': '-70 to +10 dBm, ±0.35 dB',
      'VFL': '10 mW, 650 nm laser',
      'Connector': 'FC/SC interchangeable adapters',
      'Power': 'Rechargeable Li-Ion, auto-off',
    },
    features: [
      'Calibrated power meter ±0.35 dB',
      '10 mW VFL for fiber tracing',
      'Interchangeable FC/SC adapters',
      'Backlit LCD and auto power off',
      'Rechargeable with carry case',
    ],
    is_featured: false,
    is_active: true,
    display_order: 23,
  },
  {
    legacy_id: 'demo_otdr',
    name: 'ABS OTDR Fiber Analyzer (1310/1550 nm)',
    slug: 'abs-otdr-fiber-analyzer-1310-1550',
    category: 'tools-testing',
    brand: 'abs-network',
    model: 'OTDR-1310',
    sku: 'ABS-OTDR-1310',
    price: 385000,
    compare_price: 420000,
    stock_status: 'on_order',
    stock_quantity: 2,
    warranty_years: 1,
    short_description: 'Touchscreen OTDR with 1310/1550 nm lasers, event analysis and integrated OPM/VFL for fiber commissioning.',
    full_description: 'Professional OTDR measuring single-mode networks with dynamic range up to 40 dB, automatic event map (loss, reflectance, events, sections) and a 7-inch touchscreen — built for FTTH and metro fiber commissioning.',
    specifications: {
      'Wavelengths': '1310 nm / 1550 nm',
      'Dynamic Range': 'Up to 40 dB',
      'Event Dead Zone': '< 1 m',
      'Display': '7-inch touchscreen',
      'Extras': 'OPM + VFL + TLS on board',
    },
    features: [
      '1310/1550 nm with 40 dB range',
      'Automatic event and splice analysis',
      '1 m event dead zone',
      'Integrated OPM and VFL',
      'Field-ready rugged touchscreen',
    ],
    is_featured: false,
    is_active: true,
    display_order: 24,
  },
  {
    legacy_id: 'demo_rack_12u',
    name: 'ABS 12U Wall-Mount Server Rack Cabinet',
    slug: 'abs-12u-wall-mount-rack-cabinet',
    category: 'rack-cabinet',
    brand: 'abs-network',
    model: 'RC-12U-WM',
    sku: 'ABS-RC-12U-WM',
    price: 38500,
    compare_price: 43000,
    stock_status: 'in_stock',
    stock_quantity: 6,
    warranty_years: 1,
    short_description: '12U ventilated wall-mount cabinet with glass door for MDU and office equipment corners.',
    full_description: 'Wall-mount 19-inch cabinet (12U) with a tempered glass front door, ventilated sides, removable panels and a built-in patch slot. Holds switches, ONTs and small patch panels securely out of the way.',
    specifications: {
      'Capacity': '12U, 19-inch',
      'Mount': 'Wall, pre-drilled M6',
      'Door': 'Tempered glass, key lock',
      'Ventilation': 'Perforated sides + roof fan slot',
      'Depth': '400 mm',
    },
    features: [
      '12U tempered-glass wall cabinet',
      'Pre-drilled M6 rack rails',
      'Key-locked glass door',
      'Removable side panels for access',
      '400 mm depth suits switches + patch panels',
    ],
    is_featured: false,
    is_active: true,
    display_order: 25,
  },
  {
    legacy_id: 'demo_patch_panel',
    name: 'ABS 24-Port Shielded Cat6 Patch Panel (1U)',
    slug: 'abs-24port-shielded-cat6-patch-panel-1u',
    category: 'rack-cabinet',
    brand: 'abs-network',
    model: 'PP-6-24-1U',
    sku: 'ABS-PP-6-24-1U',
    price: 6899,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 18,
    warranty_years: 1,
    short_description: '1U 24-port shielded Cat6 punch-down patch panel with rear cable bar for tidy racks.',
    full_description: '24-port Cat6 FTP patch panel in a 1U steel frame with a rear cable manager and numbered front ports. Punch-down (110/Krone) termination with clear labels for structured cabling.',
    specifications: {
      'Ports': '24 x RJ45 8P8C',
      'Category': 'Cat6 shielded (FTP)',
      'Form Factor': '1U, 19-inch steel',
      'Termination': '110 / Krone punch-down',
      'Cable Bar': 'Integrated rear organizer',
    },
    features: [
      '24 shielded Cat6 ports',
      'Punch-down rear termination',
      'Numbered ports with label spaces',
      'Integrated rear cable bar',
    ],
    is_featured: false,
    is_active: true,
    display_order: 26,
  },
  {
    legacy_id: 'demo_cable_mgmt',
    name: 'ABS 1U Horizontal Cable Manager (D-Ring)',
    slug: 'abs-1u-horizontal-cable-manager-dring',
    category: 'rack-cabinet',
    brand: 'abs-network',
    model: 'CM-1U-DR',
    sku: 'ABS-CM-1U-DR',
    price: 2250,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 22,
    warranty_years: 0,
    short_description: '1U D-ring horizontal cable manager that keeps patch leads neat between panels and switches.',
    full_description: 'Steel 1U horizontal cable management panel with D-rings and spring-loaded covers for tidy front patching. Protects leads from snags and maintains bends at the correct radius.',
    specifications: {
      'Form Factor': '1U, 19-inch',
      'Type': 'D-ring with snap cover',
      'Material': 'Cold-rolled steel',
      'Finish': 'Black powder coat',
      'Includes': 'Rack screws',
    },
    features: [
      'Snap-on covers for clean finish',
      'D-rings preserve bend radius',
      'Tool-free cover removal',
      'Matches ABS patch panels',
    ],
    is_featured: false,
    is_active: true,
    display_order: 27,
  },
  {
    legacy_id: 'demo_media_converter',
    name: 'ABS Gigabit Media Converter Kit (SC, MM)',
    slug: 'abs-gigabit-media-converter-kit-sc-mm',
    category: 'other',
    brand: 'abs-network',
    model: 'MC-1000-SC',
    sku: 'ABS-MC-1000-SC',
    price: 5999,
    compare_price: null,
    stock_status: 'in_stock',
    stock_quantity: 26,
    warranty_years: 1,
    short_description: 'Copper-to-fiber gigabit media converter kit with SC multimode port for long building runs.',
    full_description: 'A matched pair of 10/100/1000 media converters (plus power supplies) extends copper LAN runs over multimode fiber via SC connectors to 550 m. Plug-and-play with no configuration.',
    specifications: {
      'Ports': '1 x 10/100/1000 RJ45 + 1 x SC MM',
      'Fiber': 'Multimode 62.5/125 or 50/125 µm',
      'Distance': 'Up to 550 m',
      'Power': '2 x 5V DC adapters',
      'Extras': 'DIN rail + wall brackets',
    },
    features: [
      'Pair of 10/100/1000 converters',
      'Extends copper runs over fiber',
      'Plug-and-play, link-auto senses',
      'Two PSUs and mounting brackets',
    ],
    is_featured: false,
    is_active: true,
    display_order: 28,
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

// Keep the marketing/product-count stat truthful: derive it from the live row
// count instead of trusting the (editable) settings value.
const { count: liveProductCount, error: countError } = await supabase
  .from('products')
  .select('id', { count: 'exact', head: true });
if (countError) {
  console.error(`[seed-supabase] FAILED counting products: ${countError.message}`);
} else {
  const { error: statError } = await supabase
    .from('site_settings')
    .update({ stats_shop_product_count: liveProductCount })
    .eq('id', 1);
  if (statError) {
    console.error(`[seed-supabase] FAILED updating stats_shop_product_count: ${statError.message}`);
  } else {
    console.log(`[seed-supabase] stats_shop_product_count -> ${liveProductCount}`);
  }
}

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
    answer: 'Residential plans marked "Truly Unlimited" carry no fair usage policy cap. Business and enterprise plans operate on dedicated 1:1 bandwidth with contractual SLAs.'
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