import 'server-only';
import { getSupabaseAdmin } from './supabase-admin';
import { getPublicClient } from './supabase-public';
import { getShopProductById } from './supabase-shop';
import type {
  BroadbandPackage,
  ServiceItem,
  ShopProduct,
  ShopProductCategory,
  SiteSettings,
} from './db/types';

/**
 * Supabase-backed CMS data layer — the single server-side source of truth for
 * all Admin-managed content:
 *
 *   Broadband packages   -> `packages`
 *   Company services     -> `services`
 *   Site settings        -> `site_settings` (single row, id = 1)
 *   Shop products        -> `products` + `product_categories` +
 *                           `product_brands` + `product_images`
 *
 * Read strategy:
 *   * Public pages read ONLY ACTIVE rows through the publishable-key client,
 *     which is constrained by RLS (anon rows only, no writes possible).
 *   * Admin pages and all writes use the service-role key (bypasses RLS).
 *
 * Every row is mapped onto the app-level camelCase shapes
 * (`BroadbandPackage`, `ServiceItem`, `ShopProduct`, `SiteSettings`) so the
 * existing admin/public components keep working unchanged.
 */

// ---------------------------------------------------------------------------
// shared helpers
// ---------------------------------------------------------------------------

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  return [];
}

function toJsonbArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v));
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function toSpecObj(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(value as Record<string, unknown>)) {
    if (val === null || val === undefined) continue;
    out[k] = typeof val === 'string' ? val : String(val);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Broadband packages
// ---------------------------------------------------------------------------

function mapPackage(row: Record<string, any>): BroadbandPackage {
  const speed = Number(row.speed_mbps) || 0;
  const upload =
    row.upload_speed_mbps != null ? Number(row.upload_speed_mbps) : speed;
  const price = row.price != null ? Number(row.price) : null;
  const isContact = row.pricing_type === 'contact' || price == null;
  const shownPrice = price ?? 0;

  return {
    id: String(row.id),
    name: String(row.name || ''),
    slug: String(row.slug || ''),
    category: row.category,
    speedMbps: speed,
    uploadSpeedMbps: upload,
    pricePkr: shownPrice,
    priceType: isContact ? 'contact' : 'fixed',
    priceLabel: isContact
      ? 'Please contact us for rates.'
      : `PKR ${shownPrice.toLocaleString()} + TAX`,
    billingPeriod: row.billing_period || 'Monthly',
    installationFeePkr: Number(row.installation_fee) || 0,
    dataLimit: row.data_limit || '',
    features: toArray(row.features),
    shortDescription: row.short_description || undefined,
    routerIncluded: row.router_included === false ? false : true,
    routerDetails: row.router_details || undefined,
    isPopular: Boolean(row.is_popular),
    isActive: row.is_active === false ? false : true,
    displayOrder: Number(row.display_order) || 0,
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  };
}

function toPackageColumns(input: Record<string, any>): Record<string, unknown> {
  const isContact = input.priceType === 'contact';
  const speed = Number(input.speedMbps) || 0;
  return {
    name: String(input.name ?? ''),
    slug: String(input.slug ?? ''),
    category: input.category,
    speed_mbps: speed,
    upload_speed_mbps:
      input.uploadSpeedMbps != null ? Number(input.uploadSpeedMbps) || speed : speed,
    pricing_type: isContact ? 'contact' : 'fixed',
    price: isContact ? null : Number(input.pricePkr) || 0,
    tax_note: '+ TAX',
    billing_period: input.billingPeriod || 'Monthly',
    installation_fee: Number(input.installationFeePkr) || 0,
    data_limit: input.dataLimit || 'Truly Unlimited',
    short_description: input.shortDescription
      ? String(input.shortDescription).trim()
      : null,
    router_included: Boolean(input.routerIncluded),
    router_details: input.routerDetails
      ? String(input.routerDetails).trim()
      : null,
    features: toJsonbArray(input.features),
    is_popular: Boolean(input.isPopular),
    is_featured: Boolean(input.isFeatured),
    is_active: input.isActive === undefined ? true : Boolean(input.isActive),
    display_order: Number(input.displayOrder) || 0,
  };
}

async function fetchPackageRow(client: any, id: string) {
  const { data, error } = await client
    .from('packages')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load package ${id}: ${error.message}`);
  }
  return data as Record<string, any> | null;
}

/** Public reads use the publishable (RLS) client; admin reads use service-role. */
export async function getSupabasePackages(
  activeOnly = false
): Promise<BroadbandPackage[]> {
  const client = activeOnly ? getPublicClient() : getSupabaseAdmin();
  if (!client) return [];
  const { data, error } = await client
    .from('packages')
    .select('*')
    .order('display_order');
  if (error) {
    console.error('[supabase-cms] Failed to load packages:', error.message);
    return [];
  }
  return (data as Record<string, any>[] | null ?? []).map(mapPackage);
}

export async function getSupabasePackageById(
  id: string
): Promise<BroadbandPackage | null> {
  const row = await fetchPackageRow(getSupabaseAdmin(), id);
  return row ? mapPackage(row) : null;
}

export async function createSupabasePackage(
  data: Record<string, any>
): Promise<BroadbandPackage> {
  const admin = getSupabaseAdmin() as any;
  const { data: row, error } = await admin
    .from('packages')
    .insert(toPackageColumns(data))
    .select()
    .single();
  if (error) {
    throw new Error(`Failed to create package: ${error.message}`);
  }
  return mapPackage(row as Record<string, any>);
}

export async function updateSupabasePackage(
  id: string,
  updates: Partial<BroadbandPackage>
): Promise<BroadbandPackage | null> {
  const admin = getSupabaseAdmin() as any;
  const row = await fetchPackageRow(admin, id);
  if (!row) return null;

  const current = mapPackage(row);
  const next = { ...current, ...updates };
  const { data: updatedRow, error } = await admin
    .from('packages')
    .update(toPackageColumns(next))
    .eq('id', id)
    .select()
    .single();
  if (error) {
    throw new Error(`Failed to update package ${id}: ${error.message}`);
  }
  return mapPackage(updatedRow as Record<string, any>);
}

export async function deleteSupabasePackage(id: string): Promise<boolean> {
  const admin = getSupabaseAdmin() as any;
  const { error } = await admin.from('packages').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete package ${id}: ${error.message}`);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

function mapService(row: Record<string, any>): ServiceItem {
  return {
    id: String(row.id),
    title: String(row.title || ''),
    slug: String(row.slug || ''),
    shortDescription: row.short_description || '',
    fullDescription: row.full_description || '',
    iconName: row.icon_name || 'Zap',
    category: row.category || 'networking',
    features: toArray(row.features),
    capabilities: toArray(row.capabilities),
    badge: row.badge || undefined,
    imageUrl: row.image_url || undefined,
    imageAlt: row.image_alt || undefined,
    ctaLabel: row.cta_label || undefined,
    whatsappMessage: row.whatsapp_message || undefined,
    isFeatured: Boolean(row.is_featured),
    isPublished:
      row.is_published === false ? false : row.is_active === false ? false : true,
    isActive: row.is_active === false ? false : true,
    displayOrder: Number(row.display_order) || 0,
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    seoKeywords: toArray(row.seo_keywords),
    canonicalUrl: row.canonical_url || undefined,
    socialImage: row.social_image || undefined,
    robotsIndex: row.robots_index === false ? false : true,
    robotsFollow: row.robots_follow === false ? false : true,
    previousSlugs: toArray(row.previous_slugs),
    publishedAt: row.published_at || undefined,
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  };
}

function toServiceColumns(input: Record<string, any>): Record<string, unknown> {
  return {
    title: String(input.title ?? ''),
    slug: String(input.slug ?? ''),
    short_description: String(input.shortDescription || ''),
    full_description: String(input.fullDescription || ''),
    icon_name: String(input.iconName || 'Zap'),
    category: input.category || 'networking',
    badge: input.badge ? String(input.badge).trim() : null,
    features: toJsonbArray(input.features),
    capabilities: toJsonbArray(input.capabilities),
    is_featured:
      input.isFeatured === undefined ? false : Boolean(input.isFeatured),
    is_published:
      input.isPublished === undefined
        ? input.isActive === undefined
          ? true
          : Boolean(input.isActive)
        : Boolean(input.isPublished),
    image_url: input.imageUrl ? String(input.imageUrl).trim() : null,
    image_alt: input.imageAlt ? String(input.imageAlt).trim() : null,
    cta_label: input.ctaLabel ? String(input.ctaLabel).trim() : null,
    whatsapp_message: input.whatsappMessage
      ? String(input.whatsappMessage).trim()
      : null,
    seo_title: input.seoTitle ? String(input.seoTitle).trim() : null,
    seo_description: input.seoDescription
      ? String(input.seoDescription).trim()
      : null,
    seo_keywords: toJsonbArray(input.seoKeywords),
    canonical_url: input.canonicalUrl ? String(input.canonicalUrl).trim() : null,
    social_image: input.socialImage ? String(input.socialImage).trim() : null,
    robots_index: input.robotsIndex === false ? false : true,
    robots_follow: input.robotsFollow === false ? false : true,
    previous_slugs: toJsonbArray(input.previousSlugs),
    published_at: input.publishedAt || null,
    is_active: input.isActive === undefined ? true : Boolean(input.isActive),
    display_order: Number(input.displayOrder) || 0,
  };
}

async function fetchServiceRow(client: any, id: string) {
  const { data, error } = await client
    .from('services')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load service ${id}: ${error.message}`);
  }
  return data as Record<string, any> | null;
}

export async function getSupabaseServices(
  activeOnly = false
): Promise<ServiceItem[]> {
  const client = activeOnly ? getPublicClient() : getSupabaseAdmin();
  if (!client) return [];
  const { data, error } = await client
    .from('services')
    .select('*')
    .order('display_order');
  if (error) {
    console.error('[supabase-cms] Failed to load services:', error.message);
    return [];
  }
  return (data as Record<string, any>[] | null ?? []).map(mapService);
}

export async function getSupabaseServiceById(
  id: string
): Promise<ServiceItem | null> {
  const row = await fetchServiceRow(getSupabaseAdmin(), id);
  return row ? mapService(row) : null;
}

export async function createSupabaseService(
  data: Record<string, any>
): Promise<ServiceItem> {
  const admin = getSupabaseAdmin() as any;
  const { data: row, error } = await admin
    .from('services')
    .insert(toServiceColumns(data))
    .select()
    .single();
  if (error) {
    throw new Error(`Failed to create service: ${error.message}`);
  }
  return mapService(row as Record<string, any>);
}

export async function updateSupabaseService(
  id: string,
  updates: Partial<ServiceItem>
): Promise<ServiceItem | null> {
  const admin = getSupabaseAdmin() as any;
  const row = await fetchServiceRow(admin, id);
  if (!row) return null;

  const current = mapService(row);
  const next = { ...current, ...updates };
  const { data: updatedRow, error } = await admin
    .from('services')
    .update(toServiceColumns(next))
    .eq('id', id)
    .select()
    .single();
  if (error) {
    throw new Error(`Failed to update service ${id}: ${error.message}`);
  }
  return mapService(updatedRow as Record<string, any>);
}

export async function deleteSupabaseService(id: string): Promise<boolean> {
  const admin = getSupabaseAdmin() as any;
  const { error } = await admin.from('services').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete service ${id}: ${error.message}`);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Site settings (single row, id = 1)
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: 'ABS Network Broadband SMC-Pvt-Ltd',
  shortName: 'ABS Network',
  legalRegistration: 'SMC-PVT-LTD',
  tagline: 'Fiber-optic broadband for Islamabad & Rawalpindi',
  phone: '+92 51 111 227 227',
  supportPhone: '+92 51 111 227 227',
  whatsapp: '+92 300 111 2273',
  email: 'info@absnetwork.pk',
  salesEmail: 'sales@absnetwork.pk',
  supportEmail: 'support@absnetwork.pk',
  address: 'Office #12, 2nd Floor, Evacuee Trust Complex, F-5, Islamabad',
  city: 'Islamabad',
  businessHours: 'Mon – Sat, 9:00 AM – 8:00 PM',
  heroHeadline: 'Ultra HD Fiber Internet',
  heroSubheadline:
    'Symmetric 1:1 speeds from 100 Mbps to 10 Gbps with zero throttling, a free dual-band fiber router, and 24/7 NOC support.',
  footerNotice:
    'All packages are subject to standard taxes (Sales Tax & Withholding Tax) as notified by the Government of Pakistan.',
  shopBannerText: 'Professional networking equipment with manufacturer warranty.',
  statsFiberCoverageKm: 850,
  statsActiveSubscribers: 28500,
  statsUptimeGuarantee: '99.98%',
  statsShopProductCount: 0,
  updatedAt: '',
};

function mapSettings(row: Record<string, any>): SiteSettings {
  return {
    companyName: row.company_name || DEFAULT_SETTINGS.companyName,
    shortName: row.short_name || DEFAULT_SETTINGS.shortName,
    legalRegistration: row.legal_registration || DEFAULT_SETTINGS.legalRegistration,
    tagline: row.tagline || DEFAULT_SETTINGS.tagline,
    phone: row.phone || DEFAULT_SETTINGS.phone,
    supportPhone: row.support_phone || DEFAULT_SETTINGS.supportPhone,
    whatsapp: row.whatsapp || DEFAULT_SETTINGS.whatsapp,
    email: row.email || DEFAULT_SETTINGS.email,
    salesEmail: row.sales_email || DEFAULT_SETTINGS.salesEmail,
    supportEmail: row.support_email || DEFAULT_SETTINGS.supportEmail,
    address: row.address || DEFAULT_SETTINGS.address,
    city: row.city || DEFAULT_SETTINGS.city,
    businessHours: row.business_hours || DEFAULT_SETTINGS.businessHours,
    facebookUrl: row.facebook_url || undefined,
    instagramUrl: row.instagram_url || undefined,
    linkedinUrl: row.linkedin_url || undefined,
    twitterUrl: row.twitter_url || undefined,
    heroHeadline: row.hero_headline || DEFAULT_SETTINGS.heroHeadline,
    heroSubheadline: row.hero_subheadline || DEFAULT_SETTINGS.heroSubheadline,
    footerNotice: row.footer_notice || DEFAULT_SETTINGS.footerNotice,
    shopBannerText: row.shop_banner_text || DEFAULT_SETTINGS.shopBannerText,
    statsFiberCoverageKm: Number(row.stats_fiber_coverage_km) || DEFAULT_SETTINGS.statsFiberCoverageKm,
    statsActiveSubscribers:
      Number(row.stats_active_subscribers) || DEFAULT_SETTINGS.statsActiveSubscribers,
    statsUptimeGuarantee: row.stats_uptime_guarantee || DEFAULT_SETTINGS.statsUptimeGuarantee,
    statsShopProductCount: Number(row.stats_shop_product_count) || 0,
    updatedAt: row.updated_at || '',
  };
}

function toSettingsColumns(input: Partial<SiteSettings>): Record<string, unknown> {
  const cols: Record<string, unknown> = {};
  const map: Array<[string, keyof SiteSettings]> = [
    ['company_name', 'companyName'],
    ['short_name', 'shortName'],
    ['legal_registration', 'legalRegistration'],
    ['tagline', 'tagline'],
    ['phone', 'phone'],
    ['support_phone', 'supportPhone'],
    ['whatsapp', 'whatsapp'],
    ['email', 'email'],
    ['sales_email', 'salesEmail'],
    ['support_email', 'supportEmail'],
    ['address', 'address'],
    ['city', 'city'],
    ['business_hours', 'businessHours'],
    ['facebook_url', 'facebookUrl'],
    ['instagram_url', 'instagramUrl'],
    ['linkedin_url', 'linkedinUrl'],
    ['twitter_url', 'twitterUrl'],
    ['hero_headline', 'heroHeadline'],
    ['hero_subheadline', 'heroSubheadline'],
    ['footer_notice', 'footerNotice'],
    ['shop_banner_text', 'shopBannerText'],
    ['stats_fiber_coverage_km', 'statsFiberCoverageKm'],
    ['stats_active_subscribers', 'statsActiveSubscribers'],
    ['stats_uptime_guarantee', 'statsUptimeGuarantee'],
    ['stats_shop_product_count', 'statsShopProductCount'],
  ];
  for (const [column, key] of map) {
    if (input[key] !== undefined) {
      cols[column] = input[key];
    }
  }
  return cols;
}

export async function getSupabaseSettings(): Promise<SiteSettings> {
  const admin = getSupabaseAdmin() as any;
  if (!admin) {
    return DEFAULT_SETTINGS;
  }
  const { data, error } = await admin
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error || !data) {
    console.error('[supabase-cms] Failed to load site_settings:', error?.message ?? 'row missing');
    return DEFAULT_SETTINGS;
  }
  return mapSettings(data as Record<string, any>);
}

export async function updateSupabaseSettings(
  updates: Partial<SiteSettings>
): Promise<SiteSettings> {
  const admin = getSupabaseAdmin() as any;
  const { data: row, error } = await admin
    .from('site_settings')
    .update(toSettingsColumns(updates))
    .eq('id', 1)
    .select()
    .single();
  if (error) {
    throw new Error(`Failed to update site settings: ${error.message}`);
  }
  return mapSettings(row as Record<string, any>);
}

// ---------------------------------------------------------------------------
// Shop products (write-side). Reads go through lib/supabase-shop.ts.
// ---------------------------------------------------------------------------

const CATEGORY_TYPE_TO_SLUG: Record<ShopProductCategory, string> = {
  network_cables: 'network-cables',
  fiber_optics: 'fiber-optics',
  fiber_accessories: 'fiber-accessories',
  routers: 'routers',
  network_switches: 'network-switches',
  optical_devices: 'optical-devices',
  network_accessories: 'network-accessories',
  tools_testing: 'tools-testing',
  rack_cabinet: 'rack-cabinet',
  other: 'other',
};

function slugify(value: string, fallback = 'item'): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

async function resolveCategoryId(category: ShopProductCategory): Promise<string | null> {
  const admin = getSupabaseAdmin() as any;
  const slug = CATEGORY_TYPE_TO_SLUG[category] || 'other';
  const { data, error } = await admin
    .from('product_categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to resolve category: ${error.message}`);
  }
  if (data?.id) return data.id;

  const { data: created, error: createError } = await admin
    .from('product_categories')
    .insert({ name: slug, slug, description: '', is_active: true, display_order: 0 })
    .select('id')
    .single();
  if (createError) {
    throw new Error(`Failed to create category: ${createError.message}`);
  }
  return created?.id ?? null;
}

async function resolveBrandId(brandName: string): Promise<string | null> {
  const admin = getSupabaseAdmin() as any;
  const name = (brandName || '').trim();
  if (!name) return null;

  const byName = await admin
    .from('product_brands')
    .select('id')
    .eq('name', name)
    .maybeSingle();
  if (byName.error) {
    throw new Error(`Failed to resolve brand: ${byName.error.message}`);
  }
  if (byName.data?.id) return byName.data.id;

  const slug = slugify(name, 'brand');
  const bySlug = await admin
    .from('product_brands')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (bySlug.error) {
    throw new Error(`Failed to resolve brand: ${bySlug.error.message}`);
  }
  if (bySlug.data?.id) return bySlug.data.id;

  const { data: created, error: createError } = await admin
    .from('product_brands')
    .insert({ name, slug, description: '', is_active: true, display_order: 99 })
    .select('id')
    .single();
  if (createError) {
    throw new Error(`Failed to create brand: ${createError.message}`);
  }
  return created?.id ?? null;
}

function toProductColumns(input: Record<string, any>): Record<string, unknown> {
  const regular = Number(input.pricePkr) || 0;
  const saleRaw = input.salePricePkr;
  const hasSale = saleRaw != null && Number(saleRaw) > 0;
  const sale = hasSale ? Number(saleRaw) : null;
  return {
    name: String(input.name || ''),
    slug: String(input.slug || ''),
    model: String(input.model || ''),
    sku: input.sku ? String(input.sku).trim() : null,
    price: hasSale ? sale : regular,
    compare_price: hasSale ? regular : null,
    stock_status: input.stockStatus || 'in_stock',
    stock_quantity: Number(input.stockQuantity) || 0,
    warranty_years: Number(input.warrantyYears) || 0,
    short_description: String(input.shortDescription || ''),
    full_description: String(input.fullDescription || ''),
    specifications: toSpecObj(input.specifications),
    features: toJsonbArray(input.features),
    is_featured: Boolean(input.isFeatured),
    is_active: input.isActive === undefined ? true : Boolean(input.isActive),
    display_order: Number(input.displayOrder) || 0,
  };
}

function toStoragePath(url: string): string {
  const marker = '/storage/v1/object/public/product-images/';
  const idx = url.indexOf(marker);
  return idx >= 0 ? decodeURIComponent(url.slice(idx + marker.length)) : url;
}

async function replaceProductImages(
  productId: string,
  images: string[]
): Promise<void> {
  const admin = getSupabaseAdmin() as any;
  const valid = (images || []).filter(
    (u) => typeof u === 'string' && u.startsWith('https://')
  );

  const { data: existing } = await admin
    .from('product_images')
    .select('url')
    .eq('product_id', productId)
    .order('sort_order');
  const existingUrls = (existing ?? []).map((row: any) => row.url);
  if (
    existingUrls.length === valid.length &&
    existingUrls.every((u: string, i: number) => u === valid[i])
  ) {
    return;
  }

  const { error: delError } = await admin
    .from('product_images')
    .delete()
    .eq('product_id', productId);
  if (delError) {
    throw new Error(`Failed to replace product images: ${delError.message}`);
  }
  if (!valid.length) return;

  const rows = valid.map((url, i) => ({
    product_id: productId,
    url,
    storage_path: toStoragePath(url),
    alt_text: '',
    is_primary: i === 0,
    sort_order: i,
  }));
  const { error: insError } = await admin.from('product_images').insert(rows);
  if (insError) {
    throw new Error(`Failed to insert product images: ${insError.message}`);
  }
}

export async function createSupabaseShopProduct(
  data: Record<string, any>
): Promise<ShopProduct> {
  const admin = getSupabaseAdmin() as any;
  const [categoryId, brandId] = await Promise.all([
    resolveCategoryId(data.category),
    resolveBrandId(data.brand),
  ]);

  const { data: row, error } = await admin
    .from('products')
    .insert({ ...toProductColumns(data), category_id: categoryId, brand_id: brandId })
    .select()
    .single();
  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
  const productId = String((row as Record<string, any>).id);

  await replaceProductImages(productId, data.images || []);
  const created = await getShopProductById(productId);
  if (!created) {
    throw new Error('Product created but could not be reloaded');
  }
  return created;
}

export async function updateSupabaseShopProduct(
  id: string,
  updates: Partial<ShopProduct>
): Promise<ShopProduct | null> {
  const admin = getSupabaseAdmin() as any;
  const current = await getShopProductById(id);
  if (!current) return null;

  const next = { ...current, ...updates } as Record<string, any>;
  const [categoryId, brandId] = await Promise.all([
    resolveCategoryId(next.category),
    resolveBrandId(next.brand),
  ]);

  const imageReplay = 'images' in updates ? updates.images : undefined;

  const { data: row, error } = await admin
    .from('products')
    .update({ ...toProductColumns(next), category_id: categoryId, brand_id: brandId })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    throw new Error(`Failed to update product ${id}: ${error.message}`);
  }
  if (imageReplay !== undefined) {
    await replaceProductImages(id, imageReplay ?? []);
  }

  const updated = await getShopProductById(String((row as Record<string, any>).id));
  return updated ?? null;
}

export async function deleteSupabaseShopProduct(id: string): Promise<boolean> {
  const admin = getSupabaseAdmin() as any;
  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) {
    throw new Error(`Failed to delete product ${id}: ${error.message}`);
  }
  return true;
}

/**
 * Derive `site_settings.stats_shop_product_count` from the live product row count.
 *
 * The stat drives the public "Shop Products" marketing claim; leaving it as a
 * manually-edited field lets it drift from reality (DATA-003). Every admin
 * product mutation calls this so the value never goes stale.
 */
export async function syncShopProductCount(): Promise<number> {
  const admin = getSupabaseAdmin() as any;
  const { count, error } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true });
  if (error) {
    throw new Error(`Failed to count products: ${error.message}`);
  }
  const { error: statError } = await admin
    .from('site_settings')
    .update({ stats_shop_product_count: count })
    .eq('id', 1);
  if (statError) {
    throw new Error(`Failed to update shop product count: ${statError.message}`);
  }
  return count ?? 0;
}