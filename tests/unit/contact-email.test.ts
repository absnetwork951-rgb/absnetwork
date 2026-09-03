import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { ContactSchema } from '@/lib/validation/contact';
import {
  buildContactEmailSubject,
  buildContactEmailText,
  buildContactEmailHtml,
  type ContactEmailData,
} from '@/lib/email/template';
import { getSmtpConfig, isSmtpConfigured } from '@/lib/email/config';

vi.mock('server-only', () => ({}));

const SMTP_KEYS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'CONTACT_RECEIVER',
];
const originalEnv: Record<string, string | undefined> = {};

beforeAll(() => {
  for (const key of SMTP_KEYS) originalEnv[key] = process.env[key];
});

afterAll(() => {
  for (const key of SMTP_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

function setSmtpEnv() {
  process.env.SMTP_HOST = 'mail.absnetwork.com.pk';
  process.env.SMTP_PORT = '587';
  process.env.SMTP_SECURE = 'false';
  process.env.SMTP_USER = 'info@absnetwork.com.pk';
  process.env.SMTP_PASSWORD = 'not-a-real-password';
  process.env.CONTACT_RECEIVER = 'ops@absnetwork.com.pk';
}

function clearSmtpEnv() {
  for (const key of SMTP_KEYS) delete process.env[key];
}

const sampleData: ContactEmailData = {
  submissionId: 'CS-2026-0001',
  fullName: 'Ali Raza',
  email: 'ali.raza@example.com',
  phone: '+92 300 1234567',
  subject: 'New home connection in Bahria Town',
  inquiryType: 'new_connection',
  packageInterest: '35 Mbps',
  message: 'Please install a fiber connection at my new house.',
};

describe('ContactSchema validation (SEC-009 input limits)', () => {
  const validInput = () => ({
    fullName: 'Test User',
    phone: '+923001234567',
    email: 'user@example.com',
    subject: 'New connection query',
    inquiryType: 'general' as const,
    packageInterest: '10 Mbps',
    message: 'I would like a new fiber connection for my apartment.',
  });

  it('accepts a well-formed submission', () => {
    const result = ContactSchema.safeParse(validInput());
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email address', () => {
    const input = validInput();
    input.email = 'not-an-email';
    expect(ContactSchema.safeParse(input).success).toBe(false);
  });

  it('rejects empty name / message and rejects overlong fields', () => {
    const empty = validInput();
    empty.fullName = '   ';
    expect(ContactSchema.safeParse(empty).success).toBe(false);

    const long = validInput();
    long.message = 'x'.repeat(4001);
    expect(ContactSchema.safeParse(long).success).toBe(false);

    const longEmail = validInput();
    longEmail.email = `${'a'.repeat(130)}@example.com`;
    expect(ContactSchema.safeParse(longEmail).success).toBe(false);
  });

  it('honeypot field defaults to empty and tolerates spam value', () => {
    const result = ContactSchema.safeParse({ ...validInput(), website: 'http://spam.site' });
    expect(result.success).toBe(true);
    expect(result.success && result.data.website).toBe('http://spam.site');
  });
});

describe('Contact email templates (SEC-005 output encoding)', () => {
  it('builds a recognizable subject line', () => {
    const subject = buildContactEmailSubject(sampleData);
    expect(subject).toBe('[ABS Network] Contact inquiry: New home connection in Bahria Town');
  });

  it('HTML-escapes user-provided values before interpolation', () => {
    const messy = {
      ...sampleData,
      message: `Message with <script>alert(1)</script> and "quotes" & 'apostrophes'.`,
      fullName: 'Name <b>bold</b>',
    };
    const html = buildContactEmailHtml(messy);
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;b&gt;bold&lt;/b&gt;');
    expect(html).toContain('&quot;quotes&quot;');
    expect(html).toContain('&amp;');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('includes every contact field and never injects the recipient address', () => {
    const html = buildContactEmailHtml(sampleData);
    for (const needle of [
      'CS-2026-0001',
      'Ali Raza',
      'ali.raza@example.com',
      '+92 300 1234567',
      'new connection',
      'Please install a fiber connection',
    ]) {
      expect(html).toContain(needle);
    }
    // The site's hardcoded recipient must never be authored by visitor input.
    expect(html).not.toContain('ops@absnetwork.com.pk');

    const text = buildContactEmailText(sampleData);
    expect(text).toContain('Ali Raza');
    expect(text).toContain('Please install a fiber connection');
  });
});

describe('SMTP config resolution', () => {
  beforeEach(() => clearSmtpEnv());

  it('returns null when any required variable is missing', () => {
    expect(getSmtpConfig()).toBe(null);
    expect(isSmtpConfigured()).toBe(false);

    setSmtpEnv();
    delete process.env.SMTP_PASSWORD;
    expect(getSmtpConfig()).toBe(null);
    expect(isSmtpConfigured()).toBe(false);
  });

  it('infers secure=false for plain ports unless SMTP_SECURE is explicit', () => {
    setSmtpEnv();
    process.env.SMTP_PORT = '587';
    delete process.env.SMTP_SECURE;
    const config = getSmtpConfig()!;
    expect(config.host).toBe('mail.absnetwork.com.pk');
    expect(config.port).toBe(587);
    expect(config.secure).toBe(false);
  });

  it('defaults port 465 to secure=true', () => {
    setSmtpEnv();
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_SECURE;
    const config = getSmtpConfig()!;
    expect(config.port).toBe(465);
    expect(config.secure).toBe(true);
  });

  it('never exposes the SMTP password in the resolved config', () => {
    setSmtpEnv();
    const config = getSmtpConfig()!;
    expect('password' in config).toBe(false);
    expect(JSON.stringify(config)).not.toContain('not-a-real-password');
  });
});

describe('sendContactEmail transport', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    setSmtpEnv();
  });

  it('sends strictly to the configured recipient with replyTo = visitor email', async () => {
    const sendMail = vi.fn().mockResolvedValue({ accepted: ['ops@absnetwork.com.pk'] });
    const createTransport = vi.fn().mockReturnValue({ sendMail });
    vi.doMock('nodemailer', () => ({ default: { createTransport } }));

    const { sendContactEmail } = await import('@/lib/email/transporter');
    await expect(sendContactEmail(sampleData)).resolves.toMatchObject({
      accepted: ['ops@absnetwork.com.pk'],
    });

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'mail.absnetwork.com.pk',
        port: 587,
        secure: false,
        tls: { rejectUnauthorized: false },
      }),
    );
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(2);

    const msg = sendMail.mock.calls[0][0];
    expect(msg.to).toBe('ops@absnetwork.com.pk');
    expect(msg.replyTo).toBe('ali.raza@example.com');
    expect(msg.from).toContain('info@absnetwork.com.pk');
    expect(msg.html).toContain('New contact inquiry received');
    expect(msg.text).toContain('CS-2026-0001');

    const customerMsg = sendMail.mock.calls[1][0];
    expect(customerMsg.to).toBe('ali.raza@example.com');
    expect(customerMsg.subject).toContain('Thank you for contacting ABS Network');
  });

  it('throws a safe error when SMTP is not configured', async () => {
    clearSmtpEnv();
    vi.doMock('nodemailer', () => ({ default: { createTransport: vi.fn() } }));

    const { sendContactEmail } = await import('@/lib/email/transporter');
    await expect(sendContactEmail(sampleData)).rejects.toThrow(/SMTP_ERROR_NOT_CONFIGURED/);
  });
});