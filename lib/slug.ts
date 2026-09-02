/**
 * Slug generation helper for ABS Network
 * Safe to import in both Server and Client components.
 */
export function slugify(value: string): string {
  const slug = (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'service';
}
