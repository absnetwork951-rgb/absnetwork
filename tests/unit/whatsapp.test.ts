import { describe, it, expect } from 'vitest';
import {
  WHATSAPP_NUMBER,
  createWhatsAppInquiryUrl,
} from '@/lib/whatsapp';

describe('WhatsApp click-to-chat inquiry helper', () => {
  it('uses the exact ABS Network WhatsApp number (no +, spaces, parens, dashes)', () => {
    expect(WHATSAPP_NUMBER).toBe('923224180930');
    expect(WHATSAPP_NUMBER).not.toMatch(/[+()\s-]/);
  });

  it('builds a wa.me URL with the correct phone parameter', () => {
    const url = createWhatsAppInquiryUrl('Hi ABS Network');
    expect(url.startsWith('https://wa.me/923224180930?text=')).toBe(true);
  });

  it('URL-encodes the inquiry message correctly', () => {
    const url = createWhatsAppInquiryUrl(
      'Hi ABS Network, I am interested in ABS Router (PKR 6,999). Details?'
    );
    expect(url).toContain(encodeURIComponent('PKR 6,999'));
    expect(url).toContain('%20');
    expect(url).toBe(
      'https://wa.me/923224180930?text=Hi%20ABS%20Network%2C%20I%20am%20interested%20in%20ABS%20Router%20(PKR%206%2C999).%20Details%3F'
    );
  });
});
