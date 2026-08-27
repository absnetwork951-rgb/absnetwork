import React from 'react';
import { getShopOrders } from '@/lib/db';
import { requirePermission } from '@/lib/auth/guards';
import OrdersManagerClient from '@/components/admin/OrdersManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const user = await requirePermission('manage_orders');

  const orders = getShopOrders();

  return <OrdersManagerClient initialOrders={orders} />;
}
