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

export function buildCustomerConfirmationEmailSubject(data: ContactEmailData): string {
  return `Thank you for contacting ABS Network [Ref: ${data.submissionId}]`;
}

export function buildCustomerConfirmationEmailText(data: ContactEmailData): string {
  const lines = [
    `Dear ${data.fullName},`,
    '',
    `Thank you for reaching out to ABS Network Broadband. We have received your inquiry (Ticket Reference: ${data.submissionId}).`,
    '',
    `--- Inquiry Summary ---`,
    `Subject: ${data.subject}`,
    `Department: ${prettifyInquiryType(data.inquiryType)}`,
  ];
  if (data.packageInterest) lines.push(`Package / Product: ${data.packageInterest}`);
  lines.push(
    `Your Message: ${data.message}`,
    '',
    `Our NOC support and sales desk team typically reviews and responds within 15-30 minutes during operating hours.`,
    '',
    `If you need immediate assistance, you can also reach us directly:`,
    `Helpline: +92 322 4180930`,
    `WhatsApp: +92 322 4180930`,
    `Website: https://absnetwork.com.pk`,
    '',
    `Warm regards,`,
    `ABS Network Support Team`,
  );
  return lines.join('\n');
}

export function buildCustomerConfirmationEmailHtml(data: ContactEmailData): string {
  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#0F172A;background:#F8FAFC;padding:24px">',
    '  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden">',
    '    <div style="background:#2563EB;color:#FFFFFF;padding:20px 24px">',
    '      <h1 style="margin:0;font-size:20px;font-weight:700">Inquiry Received</h1>',
    '      <p style="margin:6px 0 0;font-size:13px;opacity:0.95">ABS Network Broadband Support & Sales Desk</p>',
    '    </div>',
    '    <div style="padding:24px">',
    `      <p style="font-size:15px;margin:0 0 16px">Dear <strong>${escapeHtml(data.fullName)}</strong>,</p>`,
    '      <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 16px">',
    `        Thank you for contacting ABS Network. We have successfully received your request and assigned ticket reference <strong style="color:#2563EB">#${escapeHtml(data.submissionId)}</strong>. Our team will contact you shortly.`,
    '      </p>',
    '      <div style="background:#F1F5F9;border-radius:8px;padding:16px;margin:20px 0;font-size:13px">',
    `        <div style="margin-bottom:8px"><strong>Subject:</strong> ${escapeHtml(data.subject)}</div>`,
    `        <div style="margin-bottom:8px"><strong>Department:</strong> ${escapeHtml(prettifyInquiryType(data.inquiryType))}</div>`,
    data.packageInterest ? `<div style="margin-bottom:8px"><strong>Package / Item:</strong> ${escapeHtml(data.packageInterest)}</div>` : '',
    `        <div><strong>Your Message:</strong><br><span style="color:#475569;white-space:pre-wrap">${escapeHtml(data.message)}</span></div>`,
    '      </div>',
    '      <p style="font-size:13px;color:#64748B;line-height:1.5;margin:20px 0 0">',
    '        Need instant support? Call or WhatsApp our 24/7 helpline at <strong>+92 322 4180930</strong>.',
    '      </p>',
    '    </div>',
    '    <div style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:14px 24px;font-size:12px;color:#94A3B8;text-align:center">',
    '      © ABS Network Broadband SMC-Pvt-Ltd. All rights reserved.',
    '    </div>',
    '  </div>',
    '</div>',
  ].join('\n');
}