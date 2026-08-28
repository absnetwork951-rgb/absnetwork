import { BroadbandPackage } from './types';

const CONTACT_PRICE_LABEL = 'Please contact us for rates.';
const TAX_SUFFIX = '+ TAX';

export function isContactPricing(pkg: Pick<BroadbandPackage, 'priceType' | 'pricePkr'>): boolean {
  if (pkg.priceType === 'fixed') return false;
  if (pkg.priceType === 'contact') return true;
  return pkg.pricePkr <= 0;
}

function formatPkr(amount: number): string {
  return `PKR ${amount.toLocaleString()}`;
}

export function formatPricing(label: string): string {
  const price = label.toUpperCase().startsWith('PKR') && !label.toUpperCase().includes('+ TAX')
    ? `${label} ${TAX_SUFFIX}`
    : label;
  return price;
}

export function getPackagePriceText(pkg: Pick<BroadbandPackage, 'priceType' | 'pricePkr' | 'priceLabel'>): string {
  if (isContactPricing(pkg)) {
    return pkg.priceLabel || CONTACT_PRICE_LABEL;
  }
  if (pkg.priceLabel) {
    return formatPricing(pkg.priceLabel);
  }
  return `${formatPkr(pkg.pricePkr)} ${TAX_SUFFIX}`;
}

export function getPackageInstallationNote(pkg: Pick<BroadbandPackage, 'installationFeePkr'>): string {
  return pkg.installationFeePkr === 0 ? 'Free installation' : `Installation ${formatPkr(pkg.installationFeePkr)}`;
}