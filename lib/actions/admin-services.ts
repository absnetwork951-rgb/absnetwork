'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  softDeleteService,
  deleteService as hardDeleteService,
} from '../db';
import type { ServiceItem } from '../db/types';
import { getAssignableCategorySlugs } from '../db/service-categories';
import { slugify } from '../seo';

const ServiceSchema = z.object({
  title: z.string().min(2, 'Service title is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  category: z.string().refine(
    (v) => getAssignableCategorySlugs().includes(v),
    { message: 'Please choose a valid service category' }
  ),
  shortDescription: z.string().min(10, 'Short description is required (min 10 chars)'),
  fullDescription: z.string().min(20, 'Full description is required (min 20 chars)'),
  iconName: z.string().default('Zap'),
  badge: z.string().optional(),
  capabilities: z.array(z.string()),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  ctaLabel: z.string().optional(),
  whatsappMessage: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  displayOrder: z.coerce.number().default(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional(),
  socialImage: z.string().optional(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
  previousSlugs: z.array(z.string()).optional(),
});

type ServiceInput = z.infer<typeof ServiceSchema>;

function revalidateAll() {
  revalidatePath('/services');
  revalidatePath('/');
  revalidatePath('/admin/services');
  revalidatePath('/admin/dashboard');
  revalidatePath('/sitemap.xml');
  revalidatePath('/llms.txt');
  revalidatePath('/llms-full.txt');
}

function toInput(formData: FormData): ServiceInput {
  const list = (key: string) =>
    (formData.get(key)?.toString() || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

  const boolField = (key: string) =>
    formData.get(key) === 'true' || formData.get(key) === 'on';

  const title = formData.get('title')?.toString().trim() || '';
  const rawSlug = formData.get('slug')?.toString().trim() || '';
  const slug = rawSlug || slugify(title);

  const raw: Record<string, unknown> = {
    title,
    slug,
    category: formData.get('category')?.toString() || '',
    shortDescription: formData.get('shortDescription')?.toString().trim() || '',
    fullDescription: formData.get('fullDescription')?.toString().trim() || '',
    iconName: formData.get('iconName')?.toString().trim() || 'Zap',
    badge: formData.get('badge')?.toString().trim() || undefined,
    capabilities: list('capabilities'),
    imageUrl: formData.get('imageUrl')?.toString().trim() || '',
    imageAlt: formData.get('imageAlt')?.toString().trim() || undefined,
    ctaLabel: formData.get('ctaLabel')?.toString().trim() || undefined,
    whatsappMessage: formData.get('whatsappMessage')?.toString().trim() || undefined,
    isFeatured: boolField('isFeatured'),
    isPublished: boolField('isPublished'),
    displayOrder: Number(formData.get('displayOrder')) || 0,
    seoTitle: formData.get('seoTitle')?.toString().trim() || undefined,
    seoDescription: formData.get('seoDescription')?.toString().trim() || undefined,
    seoKeywords: list('seoKeywords'),
    canonicalUrl: formData.get('canonicalUrl')?.toString().trim() || '',
    socialImage: formData.get('socialImage')?.toString().trim() || '',
    robotsIndex: formData.get('robotsIndex') !== 'false',
    robotsFollow: formData.get('robotsFollow') !== 'false',
  };

  // Normalize empty optional strings to undefined before validation.
  ['imageUrl', 'canonicalUrl', 'socialImage', 'badge', 'imageAlt', 'ctaLabel', 'whatsappMessage', 'seoTitle', 'seoDescription'].forEach(
    (k) => {
      if (raw[k] === '') raw[k] = undefined;
    }
  );

  return ServiceSchema.parse(raw);
}

export async function saveServiceAction(formData: FormData) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_services')) {
    return { success: false, error: 'Unauthorized: You do not have permission to manage services.' };
  }

  const id = formData.get('id')?.toString().trim();
  const ip = await getClientIp();

  let input: ServiceInput;
  try {
    input = toInput(formData);
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : 'Validation error';
    return { success: false, error: message || 'Validation error' };
  }

  // Reject duplicate slugs against other services.
  const existing = getServices(false);
  const slugTaken = existing.some((s) => s.slug === input.slug && s.id !== id);
  if (slugTaken) {
    return { success: false, error: 'Another service already uses this slug. Please choose a unique slug.' };
  }

  try {
    if (id) {
      const updated = updateService(
        id,
        input as Partial<ServiceItem>,
        { id: current.user.id, email: current.user.email },
        ip
      );
      if (!updated) return { success: false, error: 'Service not found' };
      revalidateAll();
      return { success: true, service: updated };
    }

    const created = createService(
      input as Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>,
      { id: current.user.id, email: current.user.email },
      ip
    );
    revalidateAll();
    return { success: true, service: created };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save service',
    };
  }
}

export async function deleteServiceAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_services')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete services.' };
  }

  const ip = await getClientIp();
  const existing = getServiceById(id);
  if (!existing) return { success: false, error: 'Service not found' };

  // Prefer soft delete to preserve URLs/SEO history; hard delete only for drafts.
  const wasPublished = existing.isPublished;
  if (wasPublished) {
    softDeleteService(id, { id: current.user.id, email: current.user.email }, ip);
  } else {
    hardDeleteService(id, { id: current.user.id, email: current.user.email }, ip);
  }

  revalidateAll();
  return { success: true };
}

export async function toggleServicePublishedAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_services')) {
    return { success: false, error: 'Unauthorized: You do not have permission to edit services.' };
  }
  const srv = getServiceById(id);
  if (!srv) return { success: false, error: 'Service not found' };
  const updated = updateService(
    id,
    { isPublished: !srv.isPublished },
    { id: current.user.id, email: current.user.email },
    await getClientIp()
  );
  if (!updated) return { success: false, error: 'Service not found' };
  revalidateAll();
  return { success: true, service: updated };
}

export async function toggleServiceFeaturedAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_services')) {
    return { success: false, error: 'Unauthorized: You do not have permission to edit services.' };
  }
  const srv = getServiceById(id);
  if (!srv) return { success: false, error: 'Service not found' };
  const updated = updateService(
    id,
    { isFeatured: !srv.isFeatured },
    { id: current.user.id, email: current.user.email },
    await getClientIp()
  );
  if (!updated) return { success: false, error: 'Service not found' };
  revalidateAll();
  return { success: true, service: updated };
}

export async function reorderServiceAction(id: string, displayOrder: number) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_services')) {
    return { success: false, error: 'Unauthorized: You do not have permission to edit services.' };
  }
  const updated = updateService(
    id,
    { displayOrder },
    { id: current.user.id, email: current.user.email },
    await getClientIp()
  );
  if (!updated) return { success: false, error: 'Service not found' };
  revalidateAll();
  return { success: true, service: updated };
}

/** Lightweight fetch for the admin list (full normalized data incl. drafts). */
export async function adminGetServices(): Promise<ServiceItem[]> {
  return getServices(false);
}
