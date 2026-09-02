import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  DatabaseSchema,
  SiteSettings,
  BroadbandPackage,
  ServiceItem,
  ShopProduct,
  ContactSubmission,
  ShopInquiryOrder,
  AdminUser,
  AdminSession,
  AuditLog,
  SecurityEvent,
  AdminAppearancePreferences,
  DEFAULT_ADMIN_APPEARANCE,
} from './types';
import { getInitialSeedData } from './seed';

const DB_OVERRIDE = process.env.ABS_DB_PATH?.trim();
const DB_DIR = DB_OVERRIDE
  ? path.dirname(DB_OVERRIDE)
  : path.join(process.cwd(), 'data');
const DB_FILE = DB_OVERRIDE || path.join(DB_DIR, 'abs_database.json');

let cachedDb: DatabaseSchema | null = null;
// Tracks the mtime of DB_FILE at the time `cachedDb` was loaded. Next.js runs
// server actions and page renders in separate worker threads, each with its
// own module-registry (and thus its own `cachedDb`). When another worker
// writes the shared file, its mtime advances past ours; we detect that and
// reload so a session/user/mutation written by one worker is visible to the
// others. This prevents auth-session redirect loops and stale reads.
let cachedDbMtimeMs = 0;

// -------------------------------------------------------------
// Cryptographically-secure ID / token generation (SEC-001)
// Replaces all Math.random()-based identifiers with CSPRNG output.
// -------------------------------------------------------------

export function generateEntityId(prefix: string): string {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
}

export function generateSessionToken(): string {
  return `sess_${crypto.randomBytes(32).toString('hex')}`;
}

export function generateOrderNumber(year: number): string {
  return `ABS-NET-${year}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

/** Loads and migrates the DB from disk (no cache). */
function loadDatabaseFromDisk(): DatabaseSchema {
  try {
    ensureDbDirectory();

    if (!fs.existsSync(DB_FILE)) {
      const seed = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
      return seed;
    }
  } catch (error) {
    // Non-writable filesystem (e.g. read-only Cloud Run container) or a
    // missing data/ directory must never 500 the app. Fall back to an
    // in-memory seed so pages render; writes are kept in memory per worker.
    console.error(
      'Database directory/file is not writable; continuing with in-memory seed data:',
      error instanceof Error ? error.message : error
    );
    return getInitialSeedData();
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;

    if (!parsed.shopProducts && (parsed as any).solarProducts) {
      parsed.shopProducts = (parsed as any).solarProducts;
      delete (parsed as any).solarProducts;
    }
    if (!parsed.shopOrders && (parsed as any).solarOrders) {
      parsed.shopOrders = (parsed as any).solarOrders;
      delete (parsed as any).solarOrders;
    }
    if (!parsed.settings.shopBannerText && (parsed.settings as any).solarBannerText) {
      parsed.settings.shopBannerText = (parsed.settings as any).solarBannerText;
      delete (parsed.settings as any).solarBannerText;
    }
    if ((parsed.settings as any).statsSolarKwhInstalled !== undefined) {
      parsed.settings.statsShopProductCount = parsed.shopProducts?.length || 0;
      delete (parsed.settings as any).statsSolarKwhInstalled;
    }
    if (!parsed.shopProducts || parsed.shopProducts.length === 0) {
      parsed.shopProducts = getInitialSeedData().shopProducts;
    }
    if (!parsed.settings.shopBannerText) {
      parsed.settings.shopBannerText = 'Professional fiber optic and networking equipment for ISPs, enterprises, and home networks.';
    }
    parsed.settings.statsShopProductCount = parsed.shopProducts?.length || 0;

    // ---- Package catalog & pricing migration ---------------------------
    // Replaces the legacy seed package set with the official 8-tier catalog,
    // and backfills priceType/priceLabel for any packages that predate them.
    const LEGACY_SEED_PACKAGE_IDS = [
      'pkg_fiber_20',
      'pkg_fiber_40',
      'pkg_fiber_75',
      'pkg_fiber_150',
      'pkg_biz_100',
      'pkg_biz_300',
    ];
    const hasLegacySeedPackages =
      Array.isArray(parsed.packages) &&
      parsed.packages.some((p) => LEGACY_SEED_PACKAGE_IDS.includes(p.id));

    if (hasLegacySeedPackages) {
      parsed.packages = getInitialSeedData().packages;
    }

    parsed.packages = (parsed.packages || []).map((p) => {
      if (p.priceType) return p;
      if (!p.pricePkr || p.speedMbps >= 200) {
        return {
          ...p,
          priceType: 'contact' as const,
          pricePkr: 0,
          priceLabel: 'Please contact us for rates.',
        };
      }
      return {
        ...p,
        priceType: 'fixed' as const,
        priceLabel: `PKR ${p.pricePkr.toLocaleString()} + TAX`,
      };
    });

    // ---- Services catalog migration ---------------------------------------
  // Replaces the legacy 6-service seed set (old `ServiceItem` shape) with the
  // official 15-service CMS catalog from seed.ts so the public site, admin
  // editor, sitemap, and LLM docs all share the same rich, published set.
  // The replacement only triggers when the services array is EXACTLY the
  // legacy seed (no new marker service and no admin-added/custom rows), so
  // real admin edits or additions are never wiped.
  const LEGACY_SEED_SERVICE_SLUGS = [
    'fiber-broadband',
    'leased-lines',
    'managed-network-solutions',
    'networking-equipment-sales',
    'web-digital-services',
    'tier3-support',
  ];
  const hasNewSeedServices = (parsed.services || []).some(
    (s) => s.id === 'srv_network_design'
  );
  const looksLikeLegacySeed =
    (parsed.services || []).length === LEGACY_SEED_SERVICE_SLUGS.length &&
    (parsed.services || []).every(
      (s) =>
        LEGACY_SEED_SERVICE_SLUGS.includes(s.slug) && s.isPublished === undefined
    );
  if (!hasNewSeedServices && looksLikeLegacySeed) {
    parsed.services = getInitialSeedData().services;
    // Persist the catalog swap so the on-disk DB reflects the new seed on the
    // very next read/restart (idempotent: a later load sees the marker and
    // skips this block). Tolerates read-only filesystems.
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    } catch (e) {
      console.error(
        'Could not persist service catalog migration to disk:',
        e instanceof Error ? e.message : e
      );
    }
  }

  // Upgrades any legacy service rows (old `ServiceItem` shape: `isActive`, no
  // featured/publish/SEO fields) to the current CMS shape so the public site,
  // sitemap, and admin editor all read the same rich structure.
  parsed.services = (parsed.services || []).map((s) => {
    if (s.isPublished !== undefined && s.isFeatured !== undefined) return s;
    return normalizeServiceRow(s);
  });

  return parsed;
  } catch (error) {
    console.error('Error reading database file, re-initializing with seed:', error);
    return getInitialSeedData();
  }
}

/** Returns the current mtime of DB_FILE (ms), or 0 when the file is absent. */
function currentDbMtimeMs(): number {
  try {
    return fs.statSync(DB_FILE).mtimeMs;
  } catch {
    return 0;
  }
}

export function getDatabase(): DatabaseSchema {
  // Reload when the shared file was written by another worker after we cached
  // the current copy (see cachedDbMtimeMs note above). `saveDatabase` keeps
  // our own cache authoritative, so a same-worker write never triggers a
  // wasteful reload here (mtime is refreshed in saveDatabase).
  if (cachedDb) {
    try {
      if (fs.statSync(DB_FILE).mtimeMs > cachedDbMtimeMs) {
        cachedDb = loadDatabaseFromDisk();
        cachedDbMtimeMs = currentDbMtimeMs();
      }
    } catch {
      // stat failed (file momentarily absent): fall through to cached copy.
    }
    return cachedDb;
  }

  cachedDb = loadDatabaseFromDisk();
  cachedDbMtimeMs = currentDbMtimeMs();
  return cachedDb;
}

export function saveDatabase(data: DatabaseSchema): void {
  cachedDb = data;
  try {
    ensureDbDirectory();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (firstErr) {
    // rename can fail on some platforms when the destination exists; retry as
    // a direct write. On a non-writable filesystem this also fails, in which
    // case the change stays in memory and never 500s the caller.
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (secondErr) {
      console.error(
        'Database file is not writable; keeping changes in memory:',
        secondErr instanceof Error ? secondErr.message : secondErr
      );
    }
  }
  cachedDbMtimeMs = currentDbMtimeMs();
}

// -------------------------------------------------------------
// Audit & Security Logging Helpers
// -------------------------------------------------------------

export function logAudit(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>,
  user?: { id?: string; email?: string },
  ipAddress?: string
): AuditLog {
  const db = getDatabase();
  const log: AuditLog = {
    id: generateEntityId('aud'),
    action,
    entityType,
    entityId,
    userId: user?.id,
    userEmail: user?.email,
    details,
    ipAddress,
    createdAt: new Date().toISOString(),
  };

  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 1000) {
    db.auditLogs = db.auditLogs.slice(0, 1000);
  }
  saveDatabase(db);
  return log;
}

export function logSecurityEvent(
  eventType: SecurityEvent['eventType'],
  severity: SecurityEvent['severity'],
  description: string,
  user?: { id?: string; email?: string },
  ipAddress?: string,
  metadata?: Record<string, any>
): SecurityEvent {
  const db = getDatabase();
  const event: SecurityEvent = {
    id: generateEntityId('sec'),
    eventType,
    severity,
    description,
    userId: user?.id,
    userEmail: user?.email,
    ipAddress,
    metadata,
    createdAt: new Date().toISOString(),
  };

  db.securityEvents.unshift(event);
  if (db.securityEvents.length > 1000) {
    db.securityEvents = db.securityEvents.slice(0, 1000);
  }
  saveDatabase(db);
  return event;
}

// -------------------------------------------------------------
// Site Settings
// -------------------------------------------------------------

export function getSiteSettings(): SiteSettings {
  const db = getDatabase();
  return db.settings;
}

export function updateSiteSettings(
  updates: Partial<SiteSettings>,
  actor?: { id: string; email: string },
  ipAddress?: string
): SiteSettings {
  const db = getDatabase();
  const prev = { ...db.settings };
  db.settings = {
    ...db.settings,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveDatabase(db);

  logAudit(
    'ADMIN_UPDATED_SETTINGS',
    'SiteSettings',
    'global',
    { previous: prev, updated: db.settings },
    actor,
    ipAddress
  );

  return db.settings;
}

// -------------------------------------------------------------
// Broadband Packages
// -------------------------------------------------------------

export function getPackages(activeOnly = false): BroadbandPackage[] {
  const db = getDatabase();
  let pkgs = [...db.packages];
  if (activeOnly) {
    pkgs = pkgs.filter((p) => p.isActive);
  }
  return pkgs.sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getPackageById(id: string): BroadbandPackage | undefined {
  const db = getDatabase();
  return db.packages.find((p) => p.id === id);
}

export function createPackage(
  pkgData: Omit<BroadbandPackage, 'id' | 'createdAt' | 'updatedAt'>,
  actor?: { id: string; email: string },
  ipAddress?: string
): BroadbandPackage {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = generateEntityId('pkg');
  const newPkg: BroadbandPackage = {
    ...pkgData,
    id,
    createdAt: now,
    updatedAt: now,
  };

  db.packages.push(newPkg);
  saveDatabase(db);

  logAudit(
    'ADMIN_CREATED_PACKAGE',
    'BroadbandPackage',
    id,
    { name: newPkg.name, speed: newPkg.speedMbps, price: newPkg.pricePkr },
    actor,
    ipAddress
  );

  return newPkg;
}

export function updatePackage(
  id: string,
  updates: Partial<BroadbandPackage>,
  actor?: { id: string; email: string },
  ipAddress?: string
): BroadbandPackage | null {
  const db = getDatabase();
  const index = db.packages.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const prev = db.packages[index];
  const updated: BroadbandPackage = {
    ...prev,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  db.packages[index] = updated;
  saveDatabase(db);

  logAudit(
    'ADMIN_UPDATED_PACKAGE',
    'BroadbandPackage',
    id,
    { previous: prev, updated },
    actor,
    ipAddress
  );

  return updated;
}

export function deletePackage(
  id: string,
  actor?: { id: string; email: string },
  ipAddress?: string
): boolean {
  const db = getDatabase();
  const index = db.packages.findIndex((p) => p.id === id);
  if (index === -1) return false;

  const removed = db.packages.splice(index, 1)[0];
  saveDatabase(db);

  logAudit(
    'ADMIN_DELETED_PACKAGE',
    'BroadbandPackage',
    id,
    { name: removed.name },
    actor,
    ipAddress
  );

  return true;
}

// -------------------------------------------------------------
// Services
// -------------------------------------------------------------

/**
 * Normalizes a possibly-legacy service row into the current ServiceItem
 * shape. Legacy rows used `isActive`/`features` and had no featured/publish
 * or SEO fields; this guarantees defaults so public/SEO layers never choke.
 */
export function normalizeServiceRow(row: any): ServiceItem {
  const now = new Date().toISOString();
  const legacyActive = (row as any).isActive === false ? false : true;
  const isPublished = (row as any).isPublished === true ? true : legacyActive;
  return {
    id: String(row.id || generateEntityId('srv')),
    title: String(row.title || ''),
    slug: String(row.slug || ''),
    category: (row.category as string) || 'networking',
    shortDescription: String(row.shortDescription || ''),
    fullDescription: String(row.fullDescription || ''),
    iconName: String(row.iconName || 'Zap'),
    features: Array.isArray(row.features)
      ? row.features.filter((f: unknown): f is string => typeof f === 'string')
      : [],
    capabilities: Array.isArray(row.capabilities)
      ? row.capabilities.filter((c: unknown): c is string => typeof c === 'string')
      : Array.isArray(row.features)
        ? row.features.filter((f: unknown): f is string => typeof f === 'string')
        : [],
    badge: row.badge || undefined,
    imageUrl: row.imageUrl || undefined,
    imageAlt: row.imageAlt || undefined,
    ctaLabel: row.ctaLabel || undefined,
    whatsappMessage: row.whatsappMessage || undefined,
    isFeatured: Boolean(row.isFeatured),
    isPublished,
    displayOrder: Number(row.displayOrder) || 0,
    seoTitle: row.seoTitle || undefined,
    seoDescription: row.seoDescription || undefined,
    seoKeywords: Array.isArray(row.seoKeywords)
      ? row.seoKeywords.filter((k: unknown): k is string => typeof k === 'string')
      : undefined,
    canonicalUrl: row.canonicalUrl || undefined,
    socialImage: row.socialImage || undefined,
    robotsIndex: row.robotsIndex === false ? false : true,
    robotsFollow: row.robotsFollow === false ? false : true,
    previousSlugs: Array.isArray(row.previousSlugs)
      ? row.previousSlugs.filter((p: unknown): p is string => typeof p === 'string')
      : undefined,
    publishedAt: row.publishedAt || (isPublished ? row.createdAt || now : undefined),
    createdAt: row.createdAt || now,
    updatedAt: row.updatedAt || now,
  };
}

export function getServices(activeOnly = false): ServiceItem[] {
  const db = getDatabase();
  let services = (db.services || []).map(normalizeServiceRow);
  if (activeOnly) {
    services = services.filter((s) => s.isPublished);
  }
  return services.sort((a, b) => a.displayOrder - b.displayOrder);
}

/** Published services that are also featured, ordered by sort_order. */
export function getFeaturedServices(): ServiceItem[] {
  return getServices(true).filter((s) => s.isFeatured);
}

export function getServiceById(id: string): ServiceItem | undefined {
  const db = getDatabase();
  const row = (db.services || []).find((s) => s.id === id);
  return row ? normalizeServiceRow(row) : undefined;
}

export function getServiceBySlug(
  slug: string,
  activeOnly = true
): ServiceItem | undefined {
  const db = getDatabase();
  const row = (db.services || []).find((s) => {
    if (s.slug === slug) return true;
    return Array.isArray(s.previousSlugs) && s.previousSlugs.includes(slug);
  });
  if (!row) return undefined;
  const service = normalizeServiceRow(row);
  if (activeOnly && !service.isPublished) return undefined;
  return service;
}

/** Returns the canonical (current) slug for a given slug, honouring redirects. */
export function getServiceCanonicalSlug(slug: string): string | undefined {
  const service = getServiceBySlug(slug, false);
  return service?.slug;
}

export function createService(
  serviceData: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>,
  actor?: { id: string; email: string },
  ipAddress?: string
): ServiceItem {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = generateEntityId('srv');
  const isPublished = Boolean(serviceData.isPublished);
  const newService: ServiceItem = normalizeServiceRow({
    ...serviceData,
    id,
    publishedAt: isPublished ? serviceData.publishedAt || now : undefined,
    createdAt: now,
    updatedAt: now,
  });

  db.services.push(newService);
  saveDatabase(db);

  logAudit(
    'ADMIN_CREATED_SERVICE',
    'ServiceItem',
    id,
    { title: newService.title, category: newService.category },
    actor,
    ipAddress
  );

  return newService;
}

export function updateService(
  id: string,
  updates: Partial<ServiceItem>,
  actor?: { id: string; email: string },
  ipAddress?: string
): ServiceItem | null {
  const db = getDatabase();
  const index = db.services.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const prev = normalizeServiceRow(db.services[index]);
  const now = new Date().toISOString();

  const merged = { ...prev, ...updates, updatedAt: now };

  // If becoming published (or staying published) and no publish date, set it.
  if (merged.isPublished && !merged.publishedAt) {
    merged.publishedAt = now;
  }
  // If a published service changes slug, preserve the old slug for redirects.
  if (updates.slug && updates.slug !== prev.slug && prev.isPublished) {
    const prevList = prev.previousSlugs || [];
    if (!prevList.includes(prev.slug)) {
      merged.previousSlugs = [...prevList, prev.slug];
    }
  }

  const updated = normalizeServiceRow(merged);
  db.services[index] = updated;
  saveDatabase(db);

  logAudit(
    'ADMIN_UPDATED_SERVICE',
    'ServiceItem',
    id,
    { previous: prev, updated },
    actor,
    ipAddress
  );

  return updated;
}

/** Soft-delete: marks a service inactive/unpublished and removes it from public surfaces. */
export function softDeleteService(
  id: string,
  actor?: { id: string; email: string },
  ipAddress?: string
): ServiceItem | null {
  const db = getDatabase();
  const index = db.services.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const prev = normalizeServiceRow(db.services[index]);
  db.services[index] = normalizeServiceRow({
    ...prev,
    isPublished: false,
    isFeatured: false,
    updatedAt: new Date().toISOString(),
  });
  saveDatabase(db);

  logAudit(
    'ADMIN_DELETED_SERVICE',
    'ServiceItem',
    id,
    { title: prev.title, softDelete: true },
    actor,
    ipAddress
  );

  return db.services[index];
}

export function deleteService(
  id: string,
  actor?: { id: string; email: string },
  ipAddress?: string
): boolean {
  const db = getDatabase();
  const index = db.services.findIndex((s) => s.id === id);
  if (index === -1) return false;

  const removed = normalizeServiceRow(db.services.splice(index, 1)[0]);
  saveDatabase(db);

  logAudit(
    'ADMIN_DELETED_SERVICE',
    'ServiceItem',
    id,
    { title: removed.title, softDelete: false },
    actor,
    ipAddress
  );

  return true;
}

// -------------------------------------------------------------
// Shop Products (Fiber & Networking Equipment)
// -------------------------------------------------------------

export function getShopProducts(activeOnly = false): ShopProduct[] {
  const db = getDatabase();
  let products = [...(db.shopProducts || [])];
  if (activeOnly) {
    products = products.filter((p) => p.isActive);
  }
  return products.sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getShopProductById(id: string): ShopProduct | undefined {
  const db = getDatabase();
  return (db.shopProducts || []).find((p) => p.id === id);
}

export function createShopProduct(
  productData: Omit<ShopProduct, 'id' | 'createdAt' | 'updatedAt'>,
  actor?: { id: string; email: string },
  ipAddress?: string
): ShopProduct {
  const db = getDatabase();
  if (!db.shopProducts) db.shopProducts = [];
  const now = new Date().toISOString();
  const id = generateEntityId('shop');
  const newProduct: ShopProduct = {
    ...productData,
    id,
    createdAt: now,
    updatedAt: now,
  };

  db.shopProducts.push(newProduct);
  saveDatabase(db);

  logAudit(
    'ADMIN_CREATED_SHOP_PRODUCT',
    'ShopProduct',
    id,
    { name: newProduct.name, category: newProduct.category, price: newProduct.pricePkr },
    actor,
    ipAddress
  );

  return newProduct;
}

export function updateShopProduct(
  id: string,
  updates: Partial<ShopProduct>,
  actor?: { id: string; email: string },
  ipAddress?: string
): ShopProduct | null {
  const db = getDatabase();
  if (!db.shopProducts) db.shopProducts = [];
  const index = db.shopProducts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const prev = db.shopProducts[index];
  const updated: ShopProduct = {
    ...prev,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  db.shopProducts[index] = updated;
  saveDatabase(db);

  logAudit(
    'ADMIN_UPDATED_SHOP_PRODUCT',
    'ShopProduct',
    id,
    { previous: prev, updated },
    actor,
    ipAddress
  );

  return updated;
}

export function deleteShopProduct(
  id: string,
  actor?: { id: string; email: string },
  ipAddress?: string
): boolean {
  const db = getDatabase();
  if (!db.shopProducts) db.shopProducts = [];
  const index = db.shopProducts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  const removed = db.shopProducts.splice(index, 1)[0];
  saveDatabase(db);

  logAudit(
    'ADMIN_DELETED_SHOP_PRODUCT',
    'ShopProduct',
    id,
    { name: removed.name },
    actor,
    ipAddress
  );

  return true;
}

// -------------------------------------------------------------
// Contact Submissions
// -------------------------------------------------------------

export function getContactSubmissions(): ContactSubmission[] {
  const db = getDatabase();
  return [...db.contactSubmissions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getContactSubmissionById(id: string): ContactSubmission | undefined {
  const db = getDatabase();
  return db.contactSubmissions.find((s) => s.id === id);
}

export function createContactSubmission(
  subData: Omit<ContactSubmission, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ipAddress?: string
): ContactSubmission {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = generateEntityId('sub');
  const newSub: ContactSubmission = {
    ...subData,
    id,
    status: 'new',
    ipAddress,
    createdAt: now,
    updatedAt: now,
  };

  db.contactSubmissions.unshift(newSub);
  saveDatabase(db);

  logAudit(
    'PUBLIC_CONTACT_SUBMISSION',
    'ContactSubmission',
    id,
    { fullName: newSub.fullName, subject: newSub.subject, type: newSub.inquiryType },
    undefined,
    ipAddress
  );

  return newSub;
}

export function updateContactSubmissionStatus(
  id: string,
  status: ContactSubmission['status'],
  internalNotes?: string,
  assignedToStaff?: string,
  actor?: { id: string; email: string },
  ipAddress?: string
): ContactSubmission | null {
  const db = getDatabase();
  const index = db.contactSubmissions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const prev = db.contactSubmissions[index];
  const updated: ContactSubmission = {
    ...prev,
    status,
    internalNotes: internalNotes !== undefined ? internalNotes : prev.internalNotes,
    assignedToStaff: assignedToStaff !== undefined ? assignedToStaff : prev.assignedToStaff,
    updatedAt: new Date().toISOString(),
  };

  db.contactSubmissions[index] = updated;
  saveDatabase(db);

  logAudit(
    'ADMIN_UPDATED_CONTACT_SUBMISSION',
    'ContactSubmission',
    id,
    { previousStatus: prev.status, newStatus: status, assignedTo: assignedToStaff },
    actor,
    ipAddress
  );

  return updated;
}

export function deleteContactSubmission(
  id: string,
  actor?: { id: string; email: string },
  ipAddress?: string
): boolean {
  const db = getDatabase();
  const index = db.contactSubmissions.findIndex((s) => s.id === id);
  if (index === -1) return false;

  const deleted = db.contactSubmissions[index];
  db.contactSubmissions.splice(index, 1);
  saveDatabase(db);

  logAudit(
    'ADMIN_DELETED_CONTACT_SUBMISSION',
    'ContactSubmission',
    id,
    { fullName: deleted.fullName, subject: deleted.subject },
    actor,
    ipAddress
  );

  return true;
}

// -------------------------------------------------------------
// Shop Inquiries & Orders
// -------------------------------------------------------------

export function getShopOrders(): ShopInquiryOrder[] {
  const db = getDatabase();
  return [...(db.shopOrders || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getShopOrderById(id: string): ShopInquiryOrder | undefined {
  const db = getDatabase();
  return (db.shopOrders || []).find((o) => o.id === id);
}

export function createShopOrder(
  orderData: Omit<ShopInquiryOrder, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>,
  ipAddress?: string
): ShopInquiryOrder {
  const db = getDatabase();
  if (!db.shopOrders) db.shopOrders = [];
  const now = new Date().toISOString();
  const id = generateEntityId('ord_shop');
  const orderNumber = generateOrderNumber(new Date().getFullYear());

  const newOrder: ShopInquiryOrder = {
    ...orderData,
    id,
    orderNumber,
    status: 'pending',
    ipAddress,
    createdAt: now,
    updatedAt: now,
  };

  db.shopOrders.unshift(newOrder);
  saveDatabase(db);

  logAudit(
    'PUBLIC_SHOP_ORDER_SUBMISSION',
    'ShopInquiryOrder',
    id,
    { orderNumber, customerName: newOrder.customerName, product: newOrder.productName },
    undefined,
    ipAddress
  );

  return newOrder;
}

export function updateShopOrderStatus(
  id: string,
  status: ShopInquiryOrder['status'],
  quotedAmountPkr?: number,
  internalNotes?: string,
  assignedToStaff?: string,
  actor?: { id: string; email: string },
  ipAddress?: string
): ShopInquiryOrder | null {
  const db = getDatabase();
  if (!db.shopOrders) db.shopOrders = [];
  const index = db.shopOrders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const prev = db.shopOrders[index];
  const updated: ShopInquiryOrder = {
    ...prev,
    status,
    quotedAmountPkr: quotedAmountPkr !== undefined ? quotedAmountPkr : prev.quotedAmountPkr,
    internalNotes: internalNotes !== undefined ? internalNotes : prev.internalNotes,
    assignedToStaff: assignedToStaff !== undefined ? assignedToStaff : prev.assignedToStaff,
    updatedAt: new Date().toISOString(),
  };

  db.shopOrders[index] = updated;
  saveDatabase(db);

  logAudit(
    'ADMIN_UPDATED_SHOP_ORDER',
    'ShopInquiryOrder',
    id,
    { orderNumber: prev.orderNumber, previousStatus: prev.status, newStatus: status, quotedAmount: quotedAmountPkr },
    actor,
    ipAddress
  );

  return updated;
}

export function deleteShopOrder(
  id: string,
  actor?: { id: string; email: string },
  ipAddress?: string
): boolean {
  const db = getDatabase();
  if (!db.shopOrders) db.shopOrders = [];
  const index = db.shopOrders.findIndex((o) => o.id === id);
  if (index === -1) return false;

  const deleted = db.shopOrders.splice(index, 1)[0];
  saveDatabase(db);

  logAudit(
    'ADMIN_DELETED_SHOP_ORDER',
    'ShopInquiryOrder',
    id,
    { orderNumber: deleted.orderNumber, customerName: deleted.customerName },
    actor,
    ipAddress
  );

  return true;
}

// -------------------------------------------------------------
// Admin Users & RBAC
// -------------------------------------------------------------

export function getAdminUsers(): AdminUser[] {
  const db = getDatabase();
  return db.users.map((u) => {
    const { passwordHash, ...safeUser } = u;
    return { ...safeUser, passwordHash: '' };
  });
}

export function getAdminUserWithHash(email: string): AdminUser | undefined {
  const db = getDatabase();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getAdminUserById(id: string): AdminUser | undefined {
  const db = getDatabase();
  return db.users.find((u) => u.id === id);
}

/**
 * Resolves the admin account (server-side source of truth: the on-disk DB)
 * linked to a Supabase Auth user UUID via `authUserId`.
 */
export function getAdminUserBySupabaseUserId(uuid: string): AdminUser | undefined {
  const db = getDatabase();
  return db.users.find((u) => u.authUserId === uuid);
}

export function createAdminUser(
  userData: { name: string; email: string; passwordHash: string; role: AdminUser['role'] },
  actor?: { id: string; email: string },
  ipAddress?: string
): AdminUser {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = generateEntityId('usr');

  const newUser: AdminUser = {
    id,
    name: userData.name,
    email: userData.email.toLowerCase(),
    passwordHash: userData.passwordHash,
    role: userData.role,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  db.users.push(newUser);
  saveDatabase(db);

  logAudit(
    'ADMIN_CREATED_USER',
    'AdminUser',
    id,
    { email: newUser.email, role: newUser.role },
    actor,
    ipAddress
  );

  logSecurityEvent(
    'USER_CREATED',
    'INFO',
    `New admin user ${newUser.email} created with role ${newUser.role}`,
    actor,
    ipAddress
  );

  const { passwordHash, ...safe } = newUser;
  return { ...safe, passwordHash: '' };
}

export function updateAdminUser(
  id: string,
  updates: Partial<Pick<AdminUser, 'name' | 'role' | 'isActive' | 'passwordHash'>>,
  actor?: { id: string; email: string },
  ipAddress?: string
): AdminUser | null {
  const db = getDatabase();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  const prev = db.users[index];
  const updated: AdminUser = {
    ...prev,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  db.users[index] = updated;
  saveDatabase(db);

  if (updates.role && updates.role !== prev.role) {
    logSecurityEvent(
      'USER_ROLE_CHANGED',
      'WARNING',
      `User ${prev.email} role changed from ${prev.role} to ${updates.role}`,
      actor,
      ipAddress
    );
  }

  if (updates.isActive !== undefined && updates.isActive !== prev.isActive) {
    logSecurityEvent(
      'USER_DISABLED',
      'WARNING',
      `User ${prev.email} active status changed to ${updates.isActive}`,
      actor,
      ipAddress
    );
  }

  logAudit(
    'ADMIN_UPDATED_USER',
    'AdminUser',
    id,
    { email: prev.email, role: updated.role, isActive: updated.isActive },
    actor,
    ipAddress
  );

  const { passwordHash, ...safe } = updated;
  return { ...safe, passwordHash: '' };
}

export function deleteAdminUser(
  id: string,
  actor?: { id: string; email: string },
  ipAddress?: string
): boolean {
  const db = getDatabase();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return false;

  const deleted = db.users.splice(index, 1)[0];
  saveDatabase(db);

  logSecurityEvent(
    'USER_DELETED',
    'CRITICAL',
    `Admin user ${deleted.email} (${deleted.role}) was deleted`,
    actor,
    ipAddress
  );

  logAudit(
    'ADMIN_DELETED_USER',
    'AdminUser',
    id,
    { email: deleted.email, role: deleted.role },
    actor,
    ipAddress
  );

  return true;
}

export function getAdminUserAppearance(
  id: string
): AdminAppearancePreferences {
  const user = getAdminUserById(id);
  return user?.appearance ?? DEFAULT_ADMIN_APPEARANCE;
}

export function updateAdminUserAppearance(
  id: string,
  appearance: Partial<AdminAppearancePreferences>,
  actor?: { id: string; email: string },
  ipAddress?: string
): AdminAppearancePreferences | null {
  const db = getDatabase();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  const prev = db.users[index];
  const merged: AdminAppearancePreferences = {
    ...getAdminUserAppearance(id),
    ...appearance,
  };

  const updated: AdminUser = {
    ...prev,
    appearance: merged,
    updatedAt: new Date().toISOString(),
  };

  db.users[index] = updated;
  saveDatabase(db);

  logAudit(
    'ADMIN_UPDATED_APPEARANCE',
    'AdminUser',
    id,
    { email: prev.email, appearance: merged },
    actor,
    ipAddress
  );

  return merged;
}

// -------------------------------------------------------------
// Sessions
// -------------------------------------------------------------

export function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): AdminSession {
  const db = getDatabase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const token = generateSessionToken();

  const session: AdminSession = {
    id: generateEntityId('sid'),
    userId,
    token,
    ipAddress,
    userAgent,
    expiresAt,
    createdAt: now.toISOString(),
  };

  db.sessions.push(session);

  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.lastLoginAt = now.toISOString();
  }

  saveDatabase(db);
  return session;
}

export function getSession(token: string): { session: AdminSession; user: AdminUser } | null {
  const db = getDatabase();
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    revokeSession(token);
    return null;
  }

  const user = db.users.find((u) => u.id === session.userId);
  if (!user || !user.isActive) {
    revokeSession(token);
    return null;
  }

  return { session, user };
}

export function revokeSession(token: string, actor?: { id: string; email: string }, ipAddress?: string): boolean {
  const db = getDatabase();
  const index = db.sessions.findIndex((s) => s.token === token);
  if (index === -1) return false;

  const removed = db.sessions.splice(index, 1)[0];
  saveDatabase(db);

  logSecurityEvent(
    'SESSION_REVOKED',
    'INFO',
    `Session revoked for user ID ${removed.userId}`,
    actor,
    ipAddress
  );

  return true;
}

export function revokeAllUserSessions(userId: string, actor?: { id: string; email: string }, ipAddress?: string): void {
  const db = getDatabase();
  db.sessions = db.sessions.filter((s) => s.userId !== userId);
  saveDatabase(db);

  logSecurityEvent(
    'SESSION_REVOKED',
    'WARNING',
    `All active sessions revoked for user ID ${userId}`,
    actor,
    ipAddress
  );
}

// -------------------------------------------------------------
// Activity, Audit & Security Logs
// -------------------------------------------------------------

export function getAuditLogs(limit?: number): AuditLog[] {
  const db = getDatabase();
  return limit ? db.auditLogs.slice(0, limit) : db.auditLogs;
}

export function getSecurityEvents(limit?: number): SecurityEvent[] {
  const db = getDatabase();
  return limit ? db.securityEvents.slice(0, limit) : db.securityEvents;
}

// -------------------------------------------------------------
// Dashboard Metrics
// -------------------------------------------------------------

export function getDashboardMetrics() {
  const db = getDatabase();

  const totalPackages = db.packages.length;
  const activePackages = db.packages.filter((p) => p.isActive).length;

  const totalServices = db.services.length;
  const activeServices = db.services.filter(
    (s) => (s as any).isPublished !== false && (s as any).isActive !== false
  ).length;

  const totalShopProducts = (db.shopProducts || []).length;
  const lowStockShopProducts = (db.shopProducts || []).filter(
    (p) => p.stockStatus === 'low_stock' || p.stockQuantity < 10
  ).length;

  const newContactSubmissions = db.contactSubmissions.filter((s) => s.status === 'new').length;
  const totalContactSubmissions = db.contactSubmissions.length;

  const pendingShopOrders = (db.shopOrders || []).filter((o) => o.status === 'pending').length;
  const totalShopOrders = (db.shopOrders || []).length;

  const totalAdmins = db.users.filter((u) => u.isActive).length;

  const recentSecurityAlerts = db.securityEvents.filter((s) => s.severity === 'WARNING' || s.severity === 'CRITICAL').length;

  return {
    totalPackages,
    activePackages,
    totalServices,
    activeServices,
    totalShopProducts,
    lowStockShopProducts,
    newContactSubmissions,
    totalContactSubmissions,
    pendingShopOrders,
    totalShopOrders,
    totalAdmins,
    recentSecurityAlerts,
    recentAuditLogs: db.auditLogs.slice(0, 10),
    recentSecurityEvents: db.securityEvents.slice(0, 10),
    recentSubmissions: db.contactSubmissions.slice(0, 5),
    recentOrders: (db.shopOrders || []).slice(0, 5),
  };
}
