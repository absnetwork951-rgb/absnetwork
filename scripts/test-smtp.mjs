import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const val = rest.join('=').replace(/^["']|["']$/g, '');
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = val.trim();
    }
  }
}

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const secure = process.env.SMTP_SECURE === 'true';
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;
const receiver = process.env.CONTACT_RECEIVER;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  requireTLS: true,
  auth: { user, pass },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

async function run() {
  try {
    console.log('Verifying with requireTLS: true...');
    await transporter.verify();
    console.log('✅ Verify OK!');

    console.log('Sending sample contact form submission email...');
    const info = await transporter.sendMail({
      from: `ABS Network <${user}>`,
      to: receiver,
      replyTo: 'customer@gmail.com',
      subject: '[ABS Network] Contact inquiry: Test Subject from Form',
      text: 'Full Name: Customer Test\nPhone: 03001234567\nMessage: Testing form submission email delivery',
      html: '<h3>New contact inquiry received</h3><p><b>Name:</b> Customer Test</p><p><b>Message:</b> Testing form submission email delivery</p>',
    });
    console.log('✅ Form Inquiry Email Sent! ID:', info.messageId);
    console.log('Delivered to destination:', receiver);
  } catch (err) {
    console.error('❌ Error sending form inquiry email:', err);
  }
}

run();
