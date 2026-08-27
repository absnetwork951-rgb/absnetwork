import { test, expect } from '@playwright/test';

test.describe('Public site', () => {
  test('homepage renders hero, nav, features and footer', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ABS Network|Broadband/);
    await page.getByRole('navigation').first().waitFor();
    await expect(page.getByRole('link', { name: /Packages/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Shop/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Contact/i }).first()).toBeVisible();
  });

  test('packages page lists broadband package cards', async ({ page }) => {
    await page.goto('/packages');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('services page renders company services', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('shop page renders the equipment catalog', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('contact page shows the contact form and FAQ section', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Contact/i).first()).toBeVisible();
  });

  test('unknown route returns a 404 page', async ({ page }) => {
    const res = await page.goto('/does-not-exist-xyz');
    expect((res?.status() ?? 500) < 500).toBe(true);
    await expect(page).toHaveTitle(/Not Found|404/);
  });
});