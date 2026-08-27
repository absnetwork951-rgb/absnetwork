const fs = require('fs');
const has = (f, s) => fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes(s);
const checks = {
  guardsFile: fs.existsSync('lib/auth/guards.ts'),
  requireSessionInGuards: has('lib/auth/guards.ts', 'export async function requireSession'),
  requirePermissionInGuards: has('lib/auth/guards.ts', 'export async function requirePermission'),
  allPagesUseGuard: ['packages', 'services', 'shop', 'orders', 'submissions', 'users', 'settings', 'audit-logs']
    .every((m) => has('app/admin/' + m + '/page.tsx', 'requirePermission') || has('app/admin/' + m + '/page.tsx', 'notFound')),
  dashboardUseRequireSession: has('app/admin/dashboard/page.tsx', 'requireSession'),
  honeypotContactAction: has('lib/actions/public-forms.ts', 'parsed.data.website'),
  honeypotShopAction: has('lib/actions/public-forms.ts', 'parsed.data.website'),
  honeyContactForm: has('components/public/ContactForm.tsx', 'name="website"'),
  honeyShopModal: has('components/public/ShopInquiryModal.tsx', 'name="website"'),
  ipRateLimit: has('lib/auth/session.ts', 'checkIpRateLimit'),
  noAdminContactSubmissionsRevalidate: !has('lib/actions/public-forms.ts', '/admin/contact-submissions'),
  worksRevalidatePath: has('lib/actions/public-forms.ts', "revalidatePath('/admin/submissions')"),
  seedTypoFixed: !has('lib/db/seed.ts', 'VIP VIP'),
};
fs.writeFileSync('fixcheck2.txt', JSON.stringify(checks, null, 1));