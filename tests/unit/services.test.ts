import { describe, it, expect } from 'vitest';
import {
  SERVICES_DATA,
  SERVICE_CATEGORIES,
  HOMEPAGE_FEATURED_SERVICES,
  WHY_CHOOSE_US_ITEMS,
  PROCESS_STEPS,
} from '@/data/services-data';
import { getWhatsAppLink, ABS_WHATSAPP_NUMBER } from '@/lib/whatsapp';

describe('Services Data & Configuration', () => {
  it('contains all required categories in tab navigation', () => {
    const categoryIds = SERVICE_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain('all');
    expect(categoryIds).toContain('networking');
    expect(categoryIds).toContain('internet');
    expect(categoryIds).toContain('cisco');
    expect(categoryIds).toContain('mikrotik');
    expect(categoryIds).toContain('servers');
    expect(categoryIds).toContain('it-support');
    expect(categoryIds).toContain('cybersecurity');
    expect(categoryIds).toContain('wireless');
    expect(categoryIds).toContain('cabling');
    expect(categoryIds).toContain('cctv');
    expect(categoryIds).toContain('digital-services');
  });

  it('has valid service items with required capabilities and image paths', () => {
    expect(SERVICES_DATA.length).toBeGreaterThanOrEqual(12);
    SERVICES_DATA.forEach((service) => {
      expect(service.title).toBeTruthy();
      expect(service.shortDescription).toBeTruthy();
      expect(service.capabilities.length).toBeGreaterThanOrEqual(3);
      expect(service.image).toBeTruthy();
      expect(service.whatsappMessage).toBeTruthy();
      expect(service.cardCtaText).toBeTruthy();

      // Check WhatsApp link generation for each service
      const waUrl = getWhatsAppLink(service.whatsappMessage);
      expect(waUrl.startsWith(`https://wa.me/${ABS_WHATSAPP_NUMBER}?text=`)).toBe(true);
    });
  });

  it('contains 8 featured services for the homepage section', () => {
    expect(HOMEPAGE_FEATURED_SERVICES.length).toBe(8);
    HOMEPAGE_FEATURED_SERVICES.forEach((service) => {
      expect(service.title).toBeTruthy();
      expect(service.capabilities.length).toBeGreaterThanOrEqual(2);
      const waUrl = getWhatsAppLink(service.whatsappMessage);
      expect(waUrl.startsWith(`https://wa.me/${ABS_WHATSAPP_NUMBER}?text=`)).toBe(true);
    });
  });

  it('has 6 Why Choose Us items and 4 Process steps', () => {
    expect(WHY_CHOOSE_US_ITEMS.length).toBe(6);
    expect(PROCESS_STEPS.length).toBe(4);
  });
});
