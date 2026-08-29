import 'server-only';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { getSmtpConfig } from './config';
import {
  buildContactEmailHtml,
  buildContactEmailSubject,
  buildContactEmailText,
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
    // SMTP submission on 587 uses STARTTLS; require it so the connection is
    // always upgraded to TLS before authenticating (never plaintext auth).
    requireTLS: true,
    // Read directly from env so the SMTP password never lives on the config object.
    auth: { user: config.user, pass: process.env.SMTP_PASSWORD?.trim() ?? '' },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return { transporter, config };
}

export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  if (!cachedTransporter) {
    const created = createTransporter();
    cachedTransporter = created.transporter;
  }

  return cachedTransporter.sendMail({
    // Authenticating sender; never derived from user input.
    from: `ABS Network <${process.env.SMTP_USER}>`,
    // Hardcoded recipient; user input can only appear in Reply-To.
    to: process.env.CONTACT_RECEIVER,
    replyTo: data.email,
    subject: buildContactEmailSubject(data),
    text: buildContactEmailText(data),
    html: buildContactEmailHtml(data),
  });
}