import { test } from '@playwright/test';

test('debug partition', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel(/Email/i).first().fill('admin@absnetwork.pk');
  await page.getByLabel(/Password/i).first().fill('AdminPassword@2026!');
  await page.getByRole('button', { name: /sign in/i }).first().click();
  await page.waitForTimeout(2500);

  const cookies = await page.context().cookies();
  console.log('COOKIES=' + JSON.stringify(cookies, null, 0));

  const token = cookies.find((c) => c.name === 'abs_admin_session_token')?.value;

  const r1 = await page.request.get('http://localhost:3000/admin/dashboard', { maxRedirects: 0 });
  console.log('JAR_DASH=' + r1.status() + ' loc=' + (r1.headers()['location'] || ''));

  const r2 = await page.request.get('http://localhost:3000/admin/dashboard', {
    maxRedirects: 0,
    headers: { Cookie: 'abs_admin_session_token=' + token },
  });
  console.log('EXPLICIT_DASH=' + r2.status() + ' loc=' + (r2.headers()['location'] || ''));

  const r3 = await page.request.get('http://localhost:3000/api/__probe', { maxRedirects: 0 }).catch((e) => null);
  console.log('PROBE=' + (r3 ? r3.status() : 'ERR'));
});