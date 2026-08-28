/**
 * Server-only SMTP configuration, isolated from the rest of the app so it can
 * be unit-tested without pulling in `nodemailer`/`server-only`.
 *
 * No secrets are hardcoded here — everything comes from environment
 * variables set on the server / in `.env.local`. `NEXT_PUBLIC_*` is never
 * used for SMTP settings.
 */

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  /** Authenticating sender address (also used as the From header). */
  user: string;
  /** Deliveries are addressed only to this hardcoded recipient. */
  receiver: string;
}

const DEFAULT_PORT = 465;

function isConfigured(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();
  const receiver = process.env.CONTACT_RECEIVER?.trim();

  // All four are required before we consider SMTP "enabled". An incomplete
  // config simply means email delivery is skipped (form still saves data).
  if (!host || !user || !password || !receiver) return null;

  const rawPort = process.env.SMTP_PORT?.trim();
  const parsedPort = rawPort ? Number(rawPort) : Number.NaN;
  const port = Number.isFinite(parsedPort) ? parsedPort : DEFAULT_PORT;

  const secureFlag = process.env.SMTP_SECURE?.trim();
  // Explicit `SMTP_SECURE=true|false` wins; otherwise infer from the port.
  const secure =
    secureFlag === 'true'
      ? true
      : secureFlag === 'false'
        ? false
        : port === 465;

  return { host, port, secure, user, receiver };
}

/** True only when a full, usable SMTP configuration exists. */
export function isSmtpConfigured(): boolean {
  return getSmtpConfig() !== null;
}