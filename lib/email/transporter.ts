import 'server-only';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { getSmtpConfig } from './config';
import {
  buildContactEmailHtml,
  buildContactEmailSubject,
  buildContactEmailText,
  buildCustomerConfirmationEmailHtml,
  buildCustomerConfirmationEmailSubject,
  buildCustomerConfirmationEmailText,
  type ContactEmailData,
} from './template';

/**
 * NodeMailer transport for ABS Network outbound email.
 * Server-only (never imported from client components); the transport is
 * created lazily from env-config so request handlers don't pay a penalty and
 * tests can run without a real mail server.
 */

let cachedTransporter: Transporter | null = null;

function createTransporter(): { transporter: Transporter; config: NonNullable<ReturnType<typeof getSmtpConfig>> } {
  const config = getSmtpConfig();
  if (!config) {
    throw new Error('SMTP_ERROR_NOT_CONFIGURED');
  }
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    tls: {
      rejectUnauthorized: false,
    },
    // Read directly from env so the SMTP password never lives on the config object.
    auth: { user: config.user, pass: process.env.SMTP_PASSWORD?.trim() ?? '' },
    connectionTimeout: 10_000,
  });
  return { transporter, config };
}

export async function sendContactEmail(data: ContactEmailData): Promise<any> {
  if (!cachedTransporter) {
    const created = createTransporter();
    cachedTransporter = created.transporter;
  }

  // 1. Deliver notification email to ABS Network admin / sales desk inbox
  const adminResult = await cachedTransporter.sendMail({
    from: `ABS Network <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_RECEIVER,
    replyTo: data.email,
    subject: buildContactEmailSubject(data),
    text: buildContactEmailText(data),
    html: buildContactEmailHtml(data),
  });

  // 2. Send automated confirmation receipt to the visitor's email
  if (data.email && data.email.includes('@')) {
    try {
      await cachedTransporter.sendMail({
        from: `ABS Network Support <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: buildCustomerConfirmationEmailSubject(data),
        text: buildCustomerConfirmationEmailText(data),
        html: buildCustomerConfirmationEmailHtml(data),
      });
    } catch (err) {
      console.error('Customer confirmation email skipped/failed:', err instanceof Error ? err.message : err);
    }
  }

  return adminResult;
}