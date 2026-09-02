export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CONTENT_MANAGER'
  | 'SALES_MANAGER'
  | 'SUPPORT_AGENT'
  | 'SECURITY_AUDITOR';

export type AdminThemeMode = 'light' | 'dark' | 'system';
export type AdminAccentPreset = 'blue' | 'indigo' | 'violet' | 'emerald' | 'rose' | 'amber';
export type AdminDensity = 'comfortable' | 'compact' | 'spacious';
export type AdminRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type AdminMotion = 'reduced' | 'balanced' | 'full';

export interface AdminAppearancePreferences {
  mode: AdminThemeMode;
  accent: AdminAccentPreset;
  density: AdminDensity;
  radius: AdminRadius;
  motion: AdminMotion;
}

export const DEFAULT_ADMIN_APPEARANCE: AdminAppearancePreferences = {
  mode: 'system',
  accent: 'blue',
  density: 'comfortable',
  radius: 'lg',
  motion: 'balanced',
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  /** Per-admin UI appearance preferences (theme, accent, density, radius, motion). */
  appearance?: AdminAppearancePreferences;
  /** Supabase Auth user UUID when this admin authenticates via Supabase Auth. */
  authUserId?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
}

export interface BroadbandPackage {
  id: string;
  name: string;
  slug: string;
  category: 'residential' | 'business' | 'gaming' | 'enterprise';
  speedMbps: number;
  uploadSpeedMbps?: number;
  pricePkr: number;
  priceType?: 'fixed' | 'contact';
  priceLabel?: string;
  billingPeriod: string;
  installationFeePkr: number;
  dataLimit: string;
  features: string[];
  shortDescription?: string;
  routerIncluded: boolean;
  routerDetails?: string;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ServiceCategorySlug =
  | 'networking'
  | 'internet'
  | 'cisco'
  | 'mikrotik'
  | 'servers'
  | 'it-support'
  | 'cybersecurity'
  | 'wireless'
  | 'cabling'
  | 'cctv'
  | 'digital-services';

export interface ServiceCategoryConfig {
  slug: ServiceCategorySlug | string;
  label: string;
  iconName?: string;
  /** Legacy categories inherited from the earlier CMS shape. */
  legacy?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  category: ServiceCategorySlug | string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  features: string[];
  capabilities?: string[];
  /** Alternate titles/aliases for the card (e.g. short display title). */
  badge?: string;
  /** Public visual image. Falls back to a branded placeholder when empty. */
  imageUrl?: string;
  imageAlt?: string;
  /** Call-to-action label shown on the card / detail page. */
  ctaLabel?: string;
  /** Prefilled WhatsApp message for this service. */
  whatsappMessage?: string;
  isFeatured: boolean;
  /** Published services are publicly visible; drafts are admin-only. */
  isPublished: boolean;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  socialImage?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  /** Historical slugs that permanently redirect to the current slug. */
  previousSlugs?: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  /** @deprecated use isPublished */
  isActive?: boolean;
}

export type ShopProductCategory =
  | 'network_cables'
  | 'fiber_optics'
  | 'fiber_accessories'
  | 'routers'
  | 'network_switches'
  | 'optical_devices'
  | 'network_accessories'
  | 'tools_testing'
  | 'rack_cabinet'
  | 'other';

export interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  category: ShopProductCategory;
  brand: string;
  model: string;
  sku?: string;
  powerRatingWatts?: number;
  capacityAh?: number;
  pricePkr: number;
  salePricePkr?: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order' | 'pre_order';
  stockQuantity: number;
  warrantyYears: number;
  shortDescription: string;
  fullDescription: string;
  specifications: Record<string, string>;
  features: string[];
  isFeatured: boolean;
  isActive: boolean;
  images: string[];
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoverageArea {
  id: string;
  city: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmission {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  inquiryType: 'general' | 'sales' | 'new_connection' | 'package_inquiry' | 'technical_support' | 'billing';
  packageInterest?: string;
  message: string;
  status: 'new' | 'in_review' | 'contacted' | 'resolved' | 'spam' | 'archived';
  assignedToStaff?: string;
  internalNotes?: string;
  adminNotes?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopInquiryOrder {
  id: string;
  orderNumber: string;
  productId?: string;
  productName?: string;
  items?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    pricePkr: number;
  }>;
  quantity: number;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  notes?: string;
  estimatedTotalPkr?: number;
  quotedAmountPkr?: number;
  status:
    | 'pending'
    | 'contacted'
    | 'quoted'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'pending_feasibility'
    | 'survey_booked'
    | 'quote_sent'
    | 'approved'
    | 'in_installation';
  adminNotes?: string;
  assignedToStaff?: string;
  internalNotes?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  userEmail?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface SecurityEvent {
  id: string;
  eventType:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'LOGOUT'
    | 'UNAUTHORIZED_ACCESS'
    | 'PERMISSION_DENIED'
    | 'PASSWORD_CHANGED'
    | 'USER_CREATED'
    | 'USER_ROLE_CHANGED'
    | 'USER_DISABLED'
    | 'USER_DELETED'
    | 'SESSION_REVOKED'
    | 'SUSPICIOUS_REQUEST'
    | 'RATE_LIMITED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SiteSettings {
  companyName: string;
  shortName: string;
  legalRegistration: string;
  tagline: string;
  phone: string;
  supportPhone: string;
  whatsapp: string;
  email: string;
  salesEmail: string;
  supportEmail: string;
  address: string;
  city: string;
  businessHours: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  heroHeadline: string;
  heroSubheadline: string;
  footerNotice: string;
  shopBannerText: string;
  statsFiberCoverageKm: number;
  statsActiveSubscribers: number;
  statsUptimeGuarantee: string;
  statsShopProductCount: number;
  updatedAt: string;
}

export interface DatabaseSchema {
  settings: SiteSettings;
  users: AdminUser[];
  sessions: AdminSession[];
  packages: BroadbandPackage[];
  services: ServiceItem[];
  shopProducts: ShopProduct[];
  coverageAreas?: CoverageArea[];
  contactSubmissions: ContactSubmission[];
  shopOrders: ShopInquiryOrder[];
  auditLogs: AuditLog[];
  securityEvents: SecurityEvent[];
}
