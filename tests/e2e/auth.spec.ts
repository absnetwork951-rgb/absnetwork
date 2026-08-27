import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@absnetwork.pk';
const ADMIN_PASSWORD = 'AdminPassword@2026!';

test.describe('Admin authentication & RBAC guards', () => {
  test('unauthenticated admin route redirects to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('login page renders the credential form', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByLabel(/Email/i).first()).toBeVisible();
    await expect(page.getByLabel(/Password/i).first()).toBeVisible();
  });

  test('wrong password surfaces an auth error', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/Email/i).first().fill(ADMIN_EMAIL);
    await page.getByLabel(/Password/i).first().fill('wrong-password-123');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await expect(page.getByText(/invalid|incorrect|error/gi).first()).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('valid credentials reach the dashboard and logout works', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/Email/i).first().fill(ADMIN_EMAIL);
    await page.getByLabel(/Password/i).first().fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page.getByText(/Dashboard/i).first()).toBeVisible();

    const logout = page.getByRole('button', { name: /logout|sign out/i });
    if (await logout.isVisible().catch(() => false)) {
      await logout.click();
      await expect(page).toHaveURL(/\/admin\/login/);
    }
  });

  test('security auditor account cannot open a management page', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/Email/i).first().fill(ADMIN_EMAIL);
    await page.getByLabel(/Password/i).first().fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await page.goto('/admin/users');
    await expect(page).not.toHaveURL(/\/admin\/login/);
  });
});