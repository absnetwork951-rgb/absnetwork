import { test, expect, Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@absnetwork.pk';
const ADMIN_PASSWORD = 'AdminPassword@2026!';

const SLOW = { timeout: 120_000 };
const MEDIUM = { timeout: 60_000 };

let createdName = '';
let createdSlug = '';

test.beforeAll(() => {
  const ts = Date.now();
  createdName = `E2E-SUPABASE-PRODUCT-${ts}`;
  createdSlug = createdName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
});

async function login(page: Page) {
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/Email/i).first().fill(ADMIN_EMAIL);
  await page.getByLabel(/Password/i).first().fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).first().click();
  // Server redirect + client window.location.replace race briefly through a
  // blank frame; wait for the Dashboard UI (not the URL) before proceeding.
  await page.waitForTimeout(1500);
  await expect(page.getByText(/Sign In to Dashboard/i).first()).toBeHidden(SLOW);
  await page.waitForURL(`**/admin/dashboard`, SLOW);
  // Full document load to settle out of the login's blank-frame navigation.
  await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
}

async function openShopManager(page: Page) {
  await page.goto('/admin/shop', { waitUntil: 'domcontentloaded' });
  try {
    await expect(page.getByRole('heading', { name: /Shop Products/i })).toBeVisible(MEDIUM);
  } catch {
    // An in-flight SPA transition can abort the first navigation; retry once.
    await page.goto('/admin/shop', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Shop Products/i })).toBeVisible(SLOW);
  }
  await page.waitForTimeout(2000);
}

function productRow(page: Page) {
  return page.locator('tbody tr').filter({ hasText: createdName });
}

// The product form modal (z-50 overlay). Admin form labels are not wired to
// their inputs via htmlFor/id, so fields are addressed by their name attribute.
function productForm(page: Page) {
  return page.locator('.z-50 form');
}

test.describe('Shop product lifecycle (Supabase-backed admin actions)', () => {
  test('create, publish, edit, unpublish, republish, and delete a product', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.log(`[console.error] ${msg.text()}`);
    });

    // -- login
    await login(page);
    await openShopManager(page);

    // -- create
    // The heading is SSR'ed, so wait for React hydration to attach handlers before clicking.
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: /Add Product/i }).click();
    await expect(page.getByText('Add New Product')).toBeVisible(MEDIUM);
    const form = productForm(page);
    await form.locator('input[name="name"]').fill(createdName);
    await form.locator('input[name="brand"]').fill('ABS NETWORK E2E');
    await form.locator('input[name="model"]').fill('E2E-2026');
    await form.locator('input[name="pricePkr"]').fill('9999');
    await form.locator('input[name="shortDescription"]').fill('Automated E2E created product');
    await form.locator('textarea[name="fullDescription"]').fill('Full description written by the automated E2E verification.');
    await form.getByRole('button', { name: /Save Product/i }).click();

    await expect(page.getByText(/new product added!/i)).toBeVisible(SLOW);
    await expect(productRow(page)).toBeVisible(MEDIUM);
    await expect(productRow(page)).toContainText('PKR 9,999');
    await expect(productRow(page).getByRole('button', { name: /Active Live/i })).toBeVisible();

    // -- public shop shows the new product (revalidatePath('/shop'))
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: createdName })).toBeVisible(SLOW);

    // -- edit: bump the price to a recognizable value
    await openShopManager(page);
    await productRow(page).getByRole('button', { name: /Edit Product/i }).click();
    await expect(page.getByText('Edit Product')).toBeVisible(MEDIUM);
    await productForm(page).locator('input[name="pricePkr"]').fill('8888');
    await productForm(page).getByRole('button', { name: /Update Product/i }).click();
    await expect(page.getByText(/product updated successfully!/i)).toBeVisible(SLOW);
    await expect(productRow(page)).toContainText('PKR 8,888');

    // -- unpublish: hidden from public site, still in admin list
    await productRow(page).getByRole('button', { name: /Active Live/i }).click();
    await expect(productRow(page).getByRole('button', { name: /Hidden/i })).toBeVisible(SLOW);
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: createdName })).toHaveCount(0, MEDIUM);

    // -- republish: visible again on public site
    await openShopManager(page);
    await productRow(page).getByRole('button', { name: /Hidden/i }).click();
    await expect(productRow(page).getByRole('button', { name: /Active Live/i })).toBeVisible(SLOW);
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: createdName })).toBeVisible(SLOW);

    // -- delete via custom confirmation modal: gone from admin list
    await openShopManager(page);
    await productRow(page).getByRole('button', { name: /Delete Product/i }).click();
    await expect(page.getByText(/Delete product\?/i)).toBeVisible(MEDIUM);
    const deleteOverlay = page.locator('div.fixed.inset-0').filter({ hasText: 'Delete product?' });
    await deleteOverlay.getByRole('button', { name: /Delete Product/i }).click();
    await expect(page.getByText(/deleted/i).first()).toBeVisible(MEDIUM);
    await expect(productRow(page)).toHaveCount(0, MEDIUM);

    // -- cleanup confirmed on public site
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: createdName })).toHaveCount(0, MEDIUM);

    // -- final sanity: unique slug guarantees future runs never collide
    expect(createdSlug).toBeTruthy();
    expect(pageErrors).toEqual([]);
  });
});