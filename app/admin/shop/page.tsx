import React from 'react';
import { getShopProducts } from '@/lib/db';
import { requirePermission } from '@/lib/auth/guards';
import ShopManagerClient from '@/components/admin/ShopManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminShopPage() {
  const user = await requirePermission('manage_shop_products');

  const products = getShopProducts();

  return <ShopManagerClient initialProducts={products} />;
}
