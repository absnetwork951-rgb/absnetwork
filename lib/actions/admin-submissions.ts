'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAdmin, getClientIp } from '../auth/session';
import { hasPermission } from '../auth/rbac';
import { updateContactSubmissionStatus } from '../db';
import { ContactSubmission } from '../db/types';

export async function updateSubmissionStatusAction(
  id: string,
  status: ContactSubmission['status'],
  internalNotes?: string,
  assignedToStaff?: string
) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_contact_submissions')) {
    return { success: false, error: 'Unauthorized: You do not have permission to manage inquiries.' };
  }

  const ip = await getClientIp();
  const updated = updateContactSubmissionStatus(
    id,
    status,
    internalNotes,
    assignedToStaff,
    { id: current.user.id, email: current.user.email },
    ip
  );

  revalidatePath('/admin/submissions');
  revalidatePath('/admin/contact-submissions');
  revalidatePath('/admin/dashboard');

  return { success: true, submission: updated };
}

export async function deleteSubmissionAction(id: string) {
  const current = await getCurrentAdmin();
  if (!current || !hasPermission(current.user.role, 'manage_contact_submissions')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete inquiries.' };
  }

  const { deleteContactSubmission } = await import('../db');
  const ip = await getClientIp();
  deleteContactSubmission(id, { id: current.user.id, email: current.user.email }, ip);

  revalidatePath('/admin/submissions');
  revalidatePath('/admin/contact-submissions');
  revalidatePath('/admin/dashboard');

  return { success: true };
}
