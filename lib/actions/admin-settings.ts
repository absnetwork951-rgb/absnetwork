'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';
import { logAudit } from '../db';
import {
  getSupabaseSettings,
  updateSupabaseSettings,
} from '../supabase-cms';

const SettingsSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  shortName: z.string().min(2, 'Short name is required'),
  legalRegistration: z.string().min(2, 'Legal registration is required'),
  tagline: z.string().min(5, 'Tagline is required'),
  phone: z.string().min(5, 'Phone is required'),
  supportPhone: z.string().min(5, 'Support phone is required'),
  whatsapp: z.string().min(5, 'WhatsApp is required'),
  email: z.string().email('Valid email is required'),
  salesEmail: z.string().email('Valid sales email is required'),
  supportEmail: z.string().email('Valid support email is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  businessHours: z.string().min(5, 'Business hours is required'),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  heroHeadline: z.string().min(5, 'Hero headline is required'),
  heroSubheadline: z.string().min(10, 'Hero subheadline is required'),
  footerNotice: z.string().min(5, 'Footer notice is required'),
  shopBannerText: z.string().min(5, 'Shop banner text is required'),
  statsFiberCoverageKm: z.coerce.number().min(0),
  statsActiveSubscribers: z.coerce.number().min(0),
  statsUptimeGuarantee: z.string().min(1),
  statsShopProductCount: z.coerce.number().min(0),
});

export async function updateSettingsAction(formData: FormData) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_settings')) {
    return { success: false, error: 'Unauthorized: You do not have permission to manage site settings.' };
  }

  const rawData = {
    companyName: formData.get('companyName')?.toString().trim(),
    shortName: formData.get('shortName')?.toString().trim(),
    legalRegistration: formData.get('legalRegistration')?.toString().trim(),
    tagline: formData.get('tagline')?.toString().trim(),
    phone: formData.get('phone')?.toString().trim(),
    supportPhone: formData.get('supportPhone')?.toString().trim(),
    whatsapp: formData.get('whatsapp')?.toString().trim(),
    email: formData.get('email')?.toString().trim(),
    salesEmail: formData.get('salesEmail')?.toString().trim(),
    supportEmail: formData.get('supportEmail')?.toString().trim(),
    address: formData.get('address')?.toString().trim(),
    city: formData.get('city')?.toString().trim(),
    businessHours: formData.get('businessHours')?.toString().trim(),
    facebookUrl: formData.get('facebookUrl')?.toString().trim() || undefined,
    instagramUrl: formData.get('instagramUrl')?.toString().trim() || undefined,
    linkedinUrl: formData.get('linkedinUrl')?.toString().trim() || undefined,
    twitterUrl: formData.get('twitterUrl')?.toString().trim() || undefined,
    heroHeadline: formData.get('heroHeadline')?.toString().trim(),
    heroSubheadline: formData.get('heroSubheadline')?.toString().trim(),
    footerNotice: formData.get('footerNotice')?.toString().trim(),
    shopBannerText: formData.get('shopBannerText')?.toString().trim(),
    statsFiberCoverageKm: Number(formData.get('statsFiberCoverageKm')) || 850,
    statsActiveSubscribers: Number(formData.get('statsActiveSubscribers')) || 28500,
    statsUptimeGuarantee: formData.get('statsUptimeGuarantee')?.toString() || '99.98%',
    statsShopProductCount: Number(formData.get('statsShopProductCount')) || 0,
  };

  const parsed = SettingsSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  const ip = await getClientIp();

  let updated;
  try {
    updated = await updateSupabaseSettings(parsed.data);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update settings',
    };
  }

  logAudit(
    'ADMIN_UPDATED_SETTINGS',
    'SiteSettings',
    'global',
    { statsFiberCoverageKm: updated.statsFiberCoverageKm, companyName: updated.companyName },
    { id: current.user.id, email: current.user.email },
    ip
  );

  revalidatePath('/');
  revalidatePath('/packages');
  revalidatePath('/services');
  revalidatePath('/contact');
  revalidatePath('/shop');
  revalidatePath('/admin/settings');
  revalidatePath('/admin/dashboard');

  return { success: true, settings: updated };
}

export async function updateSiteSettingsAction(formData: FormData) {
  return updateSettingsAction(formData);
}