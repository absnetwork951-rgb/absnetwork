import { test } from '@playwright/test';

test('diag: session lookup after login', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel(/Email/i).first().fill('admin@absnetwork.pk');
  await page.getByLabel(/Password/i).first().fill('AdminPassword@2026!');
  await page.getByRole('button', { name: /sign in/i }).first().click();
  await page.waitForTimeout(2500);

  const jar = await page.context().cookies();
  console.log('JAR=' + JSON.stringify(jar.map((c) => ({ n: c.name, v: c.value.slice(0, 20) }))));

  const rD = await page.request.get('http://localhost:3210/api/__diag');
  console.log('DIAG_STATUS=' + rD.status());
  console.log('DIAG=' + (await rD.text()));

  const rDash = await page.request.get('http://localhost:3210/admin/dashboard', { maxRedirects: 0 });
  console.log('DASH=' + rDash.status() + ' loc=' + (rDash.headers()['location'] || ''));

  const rDash2 = await page.request.get('http://localhost:3210/admin/login', { maxRedirects: 0 });
  console.log('LOGIN_PAGE=' + rDash2.status());
});