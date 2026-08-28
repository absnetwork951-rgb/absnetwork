/**
 * Plain-text + HTML rendering for contact-inquiry emails. All user-provided
 * content is HTML-escaped before interpolation so a visitor can never inject
 * markup into the mail the admin team receives (SEC-005: output encoding).
 */

export interface ContactEmailData {
  submissionId: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  inquiryType: string;
  packageInterest?: string;
  message: string;
}

const NEVER = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => NEVER[ch as keyof typeof NEVER]);
}

function prettifyInquiryType(value: string): string {
  return value.replace(/_/g, ' ');
}

export function buildContactEmailSubject(data: ContactEmailData): string {
  const subject = data.subject.trim();
  return `[ABS Network] Contact inquiry${subject ? `: ${subject}` : ''}`;
}

export function buildContactEmailText(data: ContactEmailData): string {
  const lines = [
    `New contact inquiry received (Ref: ${data.submissionId})`,
    '',
    `Full Name:      ${data.fullName}`,
    `Email:          ${data.email}`,
    `Phone:          ${data.phone}`,
    `Inquiry Type:   ${prettifyInquiryType(data.inquiryType)}`,
    `Subject:        ${data.subject}`,
  ];
  if (data.packageInterest) lines.push(`Package / Product: ${data.packageInterest}`);
  lines.push(
    '',
    'Message / Address:',
    data.message,
    '',
    'Reply to the visitor directly on this email thread.',
  );
  return lines.join('\n');
}

export function buildContactEmailHtml(data: ContactEmailData): string {
  const fields: Array<[string, string]> = [
    ['Reference', data.submissionId],
    ['Full Name', data.fullName],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Inquiry Type', prettifyInquiryType(data.inquiryType)],
    ['Subject', data.subject],
  ];
  if (data.packageInterest) fields.push(['Package / Product', data.packageInterest]);
  fields.push(['Message / Address', data.message]);

  const rows = fields
    .map(
      ([label, value]) =>
        `<tr>` +
        `<td style="padding:10px 14px;color:#0F172A;background:#F1F5F9;font-weight:600;white-space:nowrap;border:1px solid #E2E8F0">${escapeHtml(label)}</td>` +
        `<td style="padding:10px 14px;color:#334155;border:1px solid #E2E8F0;white-space:pre-wrap">${escapeHtml(value)}</td>` +
        `</tr>`,
    )
    .join('\n');

  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#0F172A;background:#F8FAFC;padding:24px">',
    '  <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden">',
    '    <div style="background:#2563EB;color:#FFFFFF;padding:18px 24px">',
    '      <h1 style="margin:0;font-size:18px">New contact inquiry received</h1>',
    '      <p style="margin:4px 0 0;font-size:13px;opacity:0.9">',
    `        This is an automated notification from the ABS Network website.`,
    '      </p>',
    '    </div>',
    '    <table style="width:100%;border-collapse:collapse;font-size:14px">',
    rows,
    '    </table>',
    '  </div>',
    '</div>',
  ].join('\n');
}