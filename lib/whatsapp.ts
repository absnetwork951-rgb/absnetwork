/**
 * WhatsApp click-to-chat inquiry helper shared by the public Shop Product
 * Cards and Package Cards.
 *
 * Uses the standard wa.me link so WhatsApp Web (desktop) or the WhatsApp
 * app/handler (mobile) is opened depending on the device — no custom chat
 * system and nothing is stored.
 */

export const WHATSAPP_NUMBER = '923224180930';

/**
 * Builds a wa.me click-to-chat URL with a properly URL-encoded message.
 * Only publicly-visible product/package information should ever be placed in
 * the message — never secrets, tokens, or credentials.
 */
export function createWhatsAppInquiryUrl(message: string): string {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}
