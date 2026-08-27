'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';
import { updateShopOrderStatus } from '../db';
import { ShopInquiryOrder } from '../db/types';

export async function updateOrderStatusAction(
  id: string,
  status: ShopInquiryOrder['status'],
  adminNotes?: string,
  quotedAmountPkr?: number,
  assignedToStaff?: string
) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_orders')) {
    return { success: false, error: 'Unauthorized: You do not have permission to manage orders.' };
  }

  const ip = await getClientIp();
  const updated = updateShopOrderStatus(
    id,
    status,
    quotedAmountPkr,
    adminNotes,
    assignedToStaff,
    { id: current.user.id, email: current.user.email },
    ip
  );

  revalidatePath('/admin/orders');
  revalidatePath('/admin/dashboard');

  return { success: true, order: updated };
}

export async function deleteOrderAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_orders')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete orders.' };
  }

  const { deleteShopOrder } = await import('../db');
  const ip = await getClientIp();
  deleteShopOrder(id, { id: current.user.id, email: current.user.email }, ip);

  revalidatePath('/admin/orders');
  revalidatePath('/admin/dashboard');

  return { success: true };
}
