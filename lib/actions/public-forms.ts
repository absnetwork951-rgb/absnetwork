'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createContactSubmission, createShopOrder } from '../db';
import { getClientIp } from '../auth/session';
import { ContactSchema } from '../validation/contact';
import { isSmtpConfigured } from '../email/config';
import { sendContactEmail } from '../email/transporter';

/**
 * Minimal in-memory rate limit for the public contact form (per IP).
 * The honeypot stops naive bots; the limiter throttles scripts that replay
 * valid submissions to flood the admin inbox via the SMTP endpoint.
 */
const CONTACT_RATE_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_RATE_MAX = 20;
const contactRateHits = new Map<string, number[]>();

function isContactRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (contactRateHits.get(ip) || []).filter((ts) => now - ts < CONTACT_RATE_WINDOW_MS);
  if (recent.length >= CONTACT_RATE_MAX) {
    contactRateHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  contactRateHits.set(ip, recent);
  return false;
}

export async function submitContactForm(formData: FormData) {
  try {
    const rawData = {
      fullName: formData.get('fullName')?.toString().trim() || '',
      phone: formData.get('phone')?.toString().trim() || '',
      email: formData.get('email')?.toString().trim() || '',
      subject: formData.get('subject')?.toString().trim() || '',
      inquiryType: (formData.get('inquiryType')?.toString().trim() || 'general') as any,
      packageInterest: formData.get('packageInterest')?.toString().trim() || undefined,
      message: formData.get('message')?.toString().trim() || '',
      website: formData.get('website')?.toString().trim() || '',
    };

    const parsed = ContactSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation failed. Please check form entries.',
      };
    }

    // SEC-006: silently drop bot submissions without storing them.
    if (parsed.data.website) {
      return {
        success: true,
        message: 'Thank you! Your inquiry has been received by ABS Network.',
      };
    }

    const ip = await getClientIp();

    if (isContactRateLimited(ip)) {
      return {
        success: false,
        error: 'Too many submissions from this device. Please wait a while and try again.',
      };
    }

    const submission = createContactSubmission(parsed.data, ip);

    // Deliver to the ABS Network inbox via SMTP if configured.
    // The submission is always saved in the database first.
    const smtpConfigured = isSmtpConfigured();
    if (smtpConfigured) {
      try {
        await sendContactEmail({
          submissionId: submission.id,
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          subject: parsed.data.subject,
          inquiryType: parsed.data.inquiryType,
          packageInterest: parsed.data.packageInterest,
          message: parsed.data.message,
        });
      } catch (err) {
        // Log error but do not fail the user's form submission since data is stored.
        console.error('Contact email delivery notification failed (submission saved):', err instanceof Error ? err.message : 'unknown error');
      }
    }

    revalidatePath('/admin/submissions');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      message: 'Thank you! Your inquiry has been received by ABS Network. Our support & sales team will contact you shortly.',
      submissionId: submission.id,
    };
  } catch (error) {
    console.error('Contact submission error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while sending your message. Please call our 24/7 helpline.',
    };
  }
}

const ShopInquirySchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(2, 'Product or package name is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1').default(1),
  customerName: z.string().min(2, 'Your name is required'),
  phone: z.string().min(8, 'Phone number is required'),
  email: z.string().email('Valid email address is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Delivery/Installation address is required'),
  notes: z.string().optional(),
  estimatedTotalPkr: z.coerce.number().optional(),
  // Honeypot (SEC-006): hidden from humans, bots auto-fill it.
  website: z.string().optional().default(''),
});

export async function submitShopInquiry(formData: FormData) {
  try {
    const rawData = {
      productId: formData.get('productId')?.toString().trim() || undefined,
      productName: formData.get('productName')?.toString().trim() || '',
      quantity: Number(formData.get('quantity')) || 1,
      customerName: formData.get('customerName')?.toString().trim() || '',
      phone: formData.get('phone')?.toString().trim() || '',
      email: formData.get('email')?.toString().trim() || '',
      city: formData.get('city')?.toString().trim() || '',
      address: formData.get('address')?.toString().trim() || '',
      notes: formData.get('notes')?.toString().trim() || undefined,
      estimatedTotalPkr: Number(formData.get('estimatedTotalPkr')) || undefined,
      website: formData.get('website')?.toString().trim() || '',
    };

    const parsed = ShopInquirySchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Please fill in all required fields.',
      };
    }

    // SEC-006: silently drop bot submissions without storing them.
    if (parsed.data.website) {
      return {
        success: true,
        message: 'Your order inquiry has been booked. Our team will contact you shortly.',
      };
    }

    const ip = await getClientIp();
    const order = createShopOrder(parsed.data, ip);

    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      message: `Your order inquiry has been booked! Reference #${order.orderNumber}. Our team will contact you to finalize details.`,
      orderNumber: order.orderNumber,
    };
  } catch (error) {
    console.error('Shop inquiry submission error:', error);
  return {
    success: false,
    error: 'Failed to process inquiry. Please reach us directly via WhatsApp or Phone.',
    };
  }
}
