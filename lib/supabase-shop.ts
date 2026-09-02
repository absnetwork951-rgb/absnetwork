import 'server-only';
import { getSupabaseAdmin } from './supabase-admin';
import type {
  ShopProduct,
  ShopProductCategory,
} from './db/types';

/**
 * Server-only helpers that read the public shop catalog from Supabase and
 * map it onto the existing `ShopProduct` shape consumed by the public shop UI.
 *
 * The canonical relationship is:
 *   products -> product_images -> Supabase Storage (url)
 *
 * This module is the ONLY source of truth for public shop product images.
 * It intentionally reuses the already-seeded `products` / `product_images`
 * records and never recreates them.
 */

interface RetryableResult {
  error?: { message?: string } | null;
}

/**
 * Transient Supabase rejections such as "JWT issued at future" are
 * infra-level clock-skew failures: the presented credentials/token are valid,
 * but the remote auth server momentarily disagrees with them on time, which
 * self-resolves on the next attempt. They are NOT security failures and MUST
 * NOT be treated as such. We only re-run the otherwise-validated request a
 * bounded number of times so a single intermittent rejection does not blank
 * the whole shop catalog. JWT validation stays fully intact — we never accept,
 * trust, or ignore an invalid token.
 */
function isTransientSupabaseError(message: unknown): boolean {
  const msg = String(message ?? '').toLowerCase().trim();
  if (!msg) return false;
  return (
    msg.includes('jwt issued at future') ||
    msg.includes('network error') ||
    msg.includes('fetch failed') ||
    msg.includes('socket hang up') ||
    msg.includes('name or service not known') ||
    msg.includes('econnreset') ||
    msg.includes('econnrefused') ||
    msg.includes('timeout')
  );
}

async function withTransientRetry<T>(run: () => Promise<T>): Promise<T> {
  const maxAttempts = 3;
  let last: T | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await run();
    last = result;
    const err = (result as RetryableResult | undefined)?.error;
    if (!err || !isTransientSupabaseError(err.message)) return result;
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
  return last as T;
}

interface RawProductImage {
  product_id: string;
  url: string;
  storage_path: string;
  is_primary: boolean;
  sort_order: number;
}

interface RawProduct {
  id: string;
  slug: string;
  name: string;
  model: string;
  sku: string | null;
  price: number | null;
  compare_price: number | null;
  stock_status: string;
  stock_quantity: number;
  warranty_years: number;
  short_description: string;
  full_description: string;
  specifications: Record<string, unknown> | null;
  features: unknown;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  category: { slug: string } | null;
  brand: { name: string } | null;
}

const CATEGORY_SLUG_TO_TYPE: Record<string, ShopProductCategory> = {
  routers: 'routers',
  'network-switches': 'network_switches',
  'optical-devices': 'optical_devices',
  'network-cables': 'network_cables',
  'fiber-optics': 'fiber_optics',
  'fiber-accessories': 'fiber_accessories',
  'network-accessories': 'network_accessories',
  'tools-testing': 'tools_testing',
  'rack-cabinet': 'rack_cabinet',
  other: 'other',
};

/** Map a Supabase category slug onto the app-level ShopProductCategory union. */
function toShopCategory(slug: string | undefined | null): ShopProductCategory {
  if (slug && slug in CATEGORY_SLUG_TO_TYPE) {
    return CATEGORY_SLUG_TO_TYPE[slug];
  }
  return 'other';
}

interface ImageRow {
  url: string;
  is_primary: boolean;
  sort_order: number;
}

/**
 * Select the display URL(s) for a product from its product_images records.
 *
 * Ordering rule (Phase 4):
 *   1. primary image first;
 *   2. remaining images ordered by sort_order ASC.
 * Only returns usable, well-formed public URLs.
 */
function selectImageUrls(rows: ImageRow[]): string[] {
  if (!rows.length) return [];
  const sorted = [...rows].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  const urls = sorted
    .map((r) => r.url)
    .filter((u) => typeof u === 'string' && u.startsWith('https://'));
  return urls;
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  return [];
}

function parseSpecifications(
  value: Record<string, unknown> | null
): Record<string, string> {
  if (!value) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === 'string') out[k] = v;
    else if (v !== null && v !== undefined) out[k] = String(v);
  }
  return out;
}

function mapProduct(
  raw: RawProduct,
  images: Record<string, ImageRow[]>
): ShopProduct {
  const imagesByProduct = images[raw.id] ?? [];
  const imageUrls = selectImageUrls(imagesByProduct);
  const salePrice = raw.price ?? raw.compare_price ?? 0;
  const regularPrice = raw.compare_price ?? salePrice;

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    category: toShopCategory(raw.category?.slug),
    brand: raw.brand?.name ?? '',
    model: raw.model ?? '',
    sku: raw.sku ?? undefined,
    pricePkr: regularPrice,
    salePricePkr:
      raw.compare_price !== null && raw.compare_price !== undefined
        ? salePrice
        : undefined,
    stockStatus: (['in_stock', 'low_stock', 'out_of_stock', 'on_order', 'pre_order'] as const).includes(
      raw.stock_status as ShopProduct['stockStatus']
    )
      ? (raw.stock_status as ShopProduct['stockStatus'])
      : 'in_stock',
    stockQuantity: raw.stock_quantity,
    warrantyYears: Number(raw.warranty_years) || 0,
    shortDescription: raw.short_description,
    fullDescription: raw.full_description,
    specifications: parseSpecifications(raw.specifications),
    features: parseStringList(raw.features),
    isFeatured: raw.is_featured,
    isActive: raw.is_active,
    images: imageUrls,
    displayOrder: raw.display_order,
    createdAt: '',
    updatedAt: '',
  };
}

const PRODUCT_SELECT =
  'id, slug, name, model, sku, price, compare_price, stock_status, stock_quantity, warranty_years, short_description, full_description, specifications, features, is_featured, is_active, display_order, category:product_categories(slug), brand:product_brands(name)';

async function loadShopProducts(activeOnly: boolean): Promise<ShopProduct[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const productResult = await withTransientRetry(async () => {
    let query = admin
      .from('products')
      .select(PRODUCT_SELECT)
      .order('display_order');
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    return await query;
  });

  const productError = productResult.error;
  if (productError) {
    console.error('[supabase-shop] Failed to load products:', productError.message);
    return [];
  }
  const productRows = productResult.data;

  const imageResult = await withTransientRetry(async () =>
    await admin
      .from('product_images')
      .select('product_id, url, storage_path, is_primary, sort_order')
      .order('sort_order')
  );

  const imageError = imageResult.error;
  if (imageError) {
    console.error('[supabase-shop] Failed to load product_images:', imageError.message);
  }

  const imagesByProduct: Record<string, ImageRow[]> = {};
  for (const row of (imageResult.data ?? []) as RawProductImage[]) {
    const bucket = (imagesByProduct[row.product_id] ??= []);
    bucket.push({
      url: row.url,
      is_primary: row.is_primary,
      sort_order: row.sort_order,
    });
  }

  return (productRows as RawProduct[] | null ?? []).map((raw) =>
    mapProduct(raw, imagesByProduct)
  );
}

/**
 * Public shop products pulled directly from Supabase with their
 * `product_images` resolved to display-ready Storage URLs.
 */
export async function getPublicShopProducts(): Promise<ShopProduct[]> {
  return loadShopProducts(true);
}

/**
 * Full catalog (including inactive products) for the admin shop panel.
 */
export async function getAllShopProducts(): Promise<ShopProduct[]> {
  return loadShopProducts(false);
}

/**
 * Single product (any active state) plus its images, used by the admin
 * editor and by the CMS write layer after creating/updating a product.
 */
export async function getShopProductById(id: string): Promise<ShopProduct | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const productResult = await withTransientRetry(async () =>
    await admin
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .maybeSingle()
  );

  if (productResult.error) {
    console.error('[supabase-shop] Failed to load product:', productResult.error.message);
    return null;
  }
  const productRow = productResult.data;
  if (!productRow) return null;

  const imageResult = await withTransientRetry(async () =>
    await admin
      .from('product_images')
      .select('product_id, url, storage_path, is_primary, sort_order')
      .eq('product_id', id)
      .order('sort_order')
  );

  if (imageResult.error) {
    console.error('[supabase-shop] Failed to load product_images:', imageResult.error.message);
  }

  const imagesByProduct: Record<string, ImageRow[]> = {
    [id]: ((imageResult.data ?? []) as RawProductImage[]).map((row) => ({
      url: row.url,
      is_primary: row.is_primary,
      sort_order: row.sort_order,
    })),
  };

  return mapProduct(productRow as RawProduct, imagesByProduct);
}
