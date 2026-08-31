import React from 'react';
import { getAllShopProducts } from '@/lib/supabase-shop';
import { requirePermission } from '@/lib/auth/guards';
import ShopManagerClient from '@/components/admin/ShopManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminShopPage() {
  const user = await requirePermission('manage_shop_products');

  const products = await getAllShopProducts();

  return <ShopManagerClient initialProducts={products} />;
}
