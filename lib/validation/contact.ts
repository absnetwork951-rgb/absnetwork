import { z } from 'zod';

/**
 * Server-side validation contract for the public contact form.
 * Single source of truth: reused by the server action that persists and
 * emails the inquiry, and by unit tests. Prevents empty/malformed values,
 * excessively long input, and arbitrary recipient/header injection.
 */

export const INQUIRY_TYPES = [
  'general',
  'sales',
  'new_connection',
  'package_inquiry',
  'technical_support',
  'billing',
] as const;

const NAME_MAX = 100;
const PHONE_MAX = 32;
const EMAIL_MAX = 120;
const SUBJECT_MAX = 200;
const PACKAGE_INTEREST_MAX = 200;
const MESSAGE_MAX = 4000;

export const ContactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Name is required (minimum 2 characters)')
    .max(NAME_MAX, 'Name is too long'),
  phone: z
    .string()
    .trim()
    .min(8, 'Valid phone number is required')
    .max(PHONE_MAX, 'Phone number is too long'),
  email: z
    .string()
    .trim()
    .min(3, 'Valid email address is required')
    .max(EMAIL_MAX, 'Email address is too long')
    .email('Valid email address is required'),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject is required')
    .max(SUBJECT_MAX, 'Subject is too long'),
  inquiryType: z.enum(INQUIRY_TYPES),
  packageInterest: z
    .string()
    .trim()
    .max(PACKAGE_INTEREST_MAX, 'Package/product reference is too long')
    .optional(),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(MESSAGE_MAX, 'Message is too long'),
  // Honeypot (SEC-006): hidden from humans, bots auto-fill it.
  website: z.string().optional().default(''),
});

export type ContactInput = z.infer<typeof ContactSchema>;