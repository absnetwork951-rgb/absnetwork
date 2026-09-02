/**
 * WhatsApp Deep-Link Utility for ABS Network
 * Standard contact WhatsApp number: +92 322 4180930
 */

export const WHATSAPP_NUMBER = '923224180930';
export const ABS_WHATSAPP_NUMBER = WHATSAPP_NUMBER;
export const ABS_WHATSAPP_DISPLAY = '+92 322 4180930';

/**
 * Generates a direct WhatsApp link with prefilled and safely URL-encoded text.
 * @param message The prefilled prompt message
 * @param phone Optional phone number override (defaults to 923224180930)
 */
export function getWhatsAppLink(message: string, phone: string = WHATSAPP_NUMBER): string {
  const sanitizedPhone = phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message.trim());
  return `https://wa.me/${sanitizedPhone}?text=${encodedMessage}`;
}

/**
 * Alias for getWhatsAppLink to support existing codebase callers and unit tests.
 */
export function createWhatsAppInquiryUrl(message: string, phone: string = WHATSAPP_NUMBER): string {
  return getWhatsAppLink(message, phone);
}

export const PREFILLED_MESSAGES = {
  generalConsultation:
    'Hello ABS Network, I would like to schedule a free technical consultation for our IT and networking infrastructure.',
  networking:
    'Hello ABS Network, I am interested in your Network Infrastructure services. I would like to discuss my requirements.',
  cisco:
    'Hello ABS Network, I am interested in Cisco networking services.',
  mikrotik:
    'Hello ABS Network, I am interested in MikroTik configuration and networking services.',
  windowsServer:
    'Hello ABS Network, I am interested in Windows Server and Active Directory services.',
  linuxServer:
    'Hello ABS Network, I am interested in Linux Server Administration services.',
  officeIt:
    'Hello ABS Network, I need technical IT support for my office.',
  cybersecurity:
    'Hello ABS Network, I am interested in your network security and cybersecurity services.',
  wireless:
    'Hello ABS Network, I am interested in your Enterprise Wi-Fi and Wireless Solutions.',
  cabling:
    'Hello ABS Network, I am interested in Structured Cabling and physical network infrastructure.',
  cctv:
    'Hello ABS Network, I am interested in CCTV and security surveillance infrastructure.',
  digitalServices:
    'Hello ABS Network, I am interested in Web & Digital Solutions (Web Development, UI/UX, Custom Software).',
  managedIt:
    'Hello ABS Network, I am interested in Managed IT & Network Support for my organization.',
};
