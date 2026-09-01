import { test, expect, Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@absnetwork.pk';
const ADMIN_PASSWORD = 'AdminPassword@2026!';

const SLOW = { timeout: 120_000 };
const MEDIUM = { timeout: 60_000 };

// The 26 initial Lahore areas required by the coverage task.
const EXPECTED_AREAS = [
  'Nisbet Road',
  'Qilla Gujjar Singh',
  'McLeod Road',
  'Montgomery Road',
  'Royal Park',
  'Beadon Road',
  'Mall Road',
  'Hall Road',
  'Shimla Hill',
  'Nicolson Road',
  'Karim Park',
  'Saggian Pull',
  'Band Road',
  'Azadi Chowk',
  'Ravi Road',
  'Badami Bagh',
  'Mochi Gate',
  'Guwalmandi',
  'Ameen Park',
  'Shah Alam Market',
  'Lohari Gate',
  'Bhatti Gate',
  'Mori Gate',
  'Taxali Gate',
  'Shahdara',
  'Islampura',
];

test.describe.configure({ mode: 'serial' });

async function areaCombobox(page: Page) {
  const input = page.getByLabel('Area');
  await expect(input).toBeEnabled({ timeout: MEDIUM.timeout });
  await input.focus();
  return input;
}

async function openSuggestions(page: Page) {
  await areaCombobox(page);
  const listbox = page.locator('#coverage-suggestions');
  await expect(listbox).toBeVisible({ timeout: MEDIUM.timeout });
  return listbox;
}

test.describe('Homepage Coverage / Check Availability', () => {
  test('coverage section exists directly below Why Choose with a searchable checker', async ({ page }) => {
    await page.goto('/');
    const why = page.getByRole('heading', { name: /Why Choose/i }).first();
    await expect(why).toBeVisible(SLOW);

    const heading = page.getByRole('heading', { name: /Check Availability/i }).first();
    await expect(heading).toBeVisible(SLOW);
    const whyBox = await why.boundingBox();
    const covBox = await heading.boundingBox();
    expect((covBox as any).y).toBeGreaterThan((whyBox as any).y);

    await expect(page.getByLabel('Select your area')).toBeVisible();
    await expect(page.getByLabel('Area')).toBeVisible();
    await expect(page.getByRole('button', { name: /Check Availability/i })).toBeVisible();
  });

  test('dropdown lists all 26 areas from Supabase with no duplicates', async ({ page }) => {
    await page.goto('/');
    const listbox = await openSuggestions(page);

    const options = listbox.locator('[role="option"]');
    const names = await options.allInnerTexts();
    const trimmed = names.map((n) => n.trim()).filter(Boolean);

    expect(trimmed).toHaveLength(EXPECTED_AREAS.length);
    expect(new Set(trimmed).size).toBe(trimmed.length);
    expect(trimmed.slice().sort()).toEqual([...EXPECTED_AREAS].sort());
  });

  test('partial area search shows suggestions and selecting Hall Road checks availability', async ({ page }) => {
    await page.goto('/');
    const input = await areaCombobox(page);

    await input.fill('hall');
    const hallOption = page.getByRole('option', { name: /Hall Road/i });
    await expect(hallOption).toBeVisible(MEDIUM);
    await hallOption.click();

    await expect(input).toHaveValue('Hall Road');
    await page.getByRole('button', { name: /Check Availability/i }).click();
    await expect(page.getByText(/available in Hall Road/i)).toBeVisible(MEDIUM);
  });

  test('invalid area shows the not-listed message', async ({ page }) => {
    await page.goto('/');
    const input = await areaCombobox(page);

    await input.fill('Defence Phase 8');
    await page.getByRole('button', { name: /Check Availability/i }).click();
    await expect(page.getByText(/not currently listed/i)).toBeVisible(MEDIUM);
  });

  test('clear button resets the selection and keeps submit disabled', async ({ page }) => {
    await page.goto('/');
    const checkButton = page.getByRole('button', { name: /Check Availability/i });
    const input = page.getByLabel('Area');

    await expect(input).toBeEnabled(MEDIUM);
    await expect(checkButton).toBeDisabled();
    await input.fill('Hall Road');
    await expect(checkButton).toBeEnabled();

    await page.getByLabel('Clear area').click();
    await expect(input).toHaveValue('');
    await expect(checkButton).toBeDisabled();
  });

  test('responsive 1024x768 and mobile: coverage visible, no horizontal overflow', async ({ page }) => {
    for (const viewport of [{ width: 1024, height: 768 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await expect(page.getByRole('heading', { name: /Check Availability/i })).toBeVisible(SLOW);
      await expect(page.getByLabel('Area')).toBeVisible();

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    }
  });
});

test.describe('Admin coverage lifecycle (Supabase-backed admin actions)', () => {
  async function login(page: Page) {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByLabel(/Email/i).first().fill(ADMIN_EMAIL);
    await page.getByLabel(/Password/i).first().fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForTimeout(1500);
    await expect(page.getByText(/Sign In to Dashboard/i).first()).toBeHidden(SLOW);
    await page.waitForURL(`**/admin/dashboard`, SLOW);
  }

  let ts = '';

  test.beforeAll(() => {
    ts = String(Date.now()).slice(-6);
  });

  test('admin can add, edit, and delete a coverage area reflected on the public dropdown', async ({ page }) => {
    const createdName = `DHA Phase 5-${ts}`;
    const editedName = `DHA Phase 6-${ts}`;
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await login(page);

    // -- add
    await page.goto('/admin/coverage', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Coverage Areas' })).toBeVisible(MEDIUM);
    const row = () => page.locator('tbody tr').filter({ hasText: createdName });

    await page.getByRole('button', { name: /Add Coverage Area/i }).click();
    await expect(page.getByText('Add Coverage Area')).toBeVisible(MEDIUM);
    const form = page.locator('form').last();
    await form.locator('input[name="name"]').fill(createdName);
    await form.locator('input[name="city"]').fill('Lahore');
    await form.getByRole('button', { name: /Save Area/i }).click();

    await expect(page.getByText(/coverage area added!/i)).toBeVisible(SLOW);
    await expect(row()).toBeVisible(MEDIUM);
    await expect(row()).toContainText('Lahore');

    // -- appears on the public dropdown (revalidatePath('/'))
    await page.goto('/');
    await openSuggestions(page);
    await page.getByLabel('Area').fill(createdName);
    await expect(page.getByRole('option', { name: createdName })).toBeVisible(MEDIUM);

    // -- duplicate rejected (client + server duplicate guard)
    await page.goto('/admin/coverage', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Coverage Areas' })).toBeVisible(MEDIUM);
    await page.getByRole('button', { name: /Add Coverage Area/i }).click();
    await page.locator('form').last().locator('input[name="name"]').fill('Hall Road');
    await page.locator('form').last().locator('input[name="city"]').fill('Lahore');
    await page.locator('form').last().getByRole('button', { name: /Save Area/i }).click();
    await expect(page.getByText(/already exists in this city/i)).toBeVisible(MEDIUM);

    // -- edit
    await page.goto('/admin/coverage', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Coverage Areas' })).toBeVisible(MEDIUM);
    const editRow = page.locator('tbody tr').filter({ hasText: createdName });
    await editRow.getByRole('button', { name: /Edit Coverage Area/i }).click();
    await expect(page.getByText('Edit Coverage Area')).toBeVisible(MEDIUM);
    await page.locator('form').last().locator('input[name="name"]').fill(editedName);
    await page.locator('form').last().getByRole('button', { name: /Update Area/i }).click();
    await expect(page.getByText(/coverage area updated!/i)).toBeVisible(SLOW);
    await expect(page.locator('tbody tr').filter({ hasText: editedName })).toBeVisible(MEDIUM);

    // -- renamed area reflects on the public dropdown
    await page.goto('/');
    await openSuggestions(page);
    await page.getByLabel('Area').fill(editedName);
    await expect(page.getByRole('option', { name: editedName })).toBeVisible(MEDIUM);
    await expect(page.getByRole('option', { name: createdName })).toHaveCount(0);

    // -- delete
    await page.goto('/admin/coverage', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Coverage Areas' })).toBeVisible(MEDIUM);
    await page.locator('tbody tr').filter({ hasText: editedName }).getByRole('button', { name: /Delete Coverage Area/i }).click();
    await expect(page.getByText(/Are you sure you want to delete this coverage area/i)).toBeVisible(MEDIUM);
    await page.getByRole('button', { name: /Delete Area/i }).click();
    await expect(page.getByText(/deleted\./i).first()).toBeVisible(SLOW);
    await expect(page.locator('tbody tr').filter({ hasText: editedName })).toHaveCount(0, MEDIUM);

    // -- gone from the public dropdown
    await page.goto('/');
    await openSuggestions(page);
    await page.getByLabel('Area').fill(editedName);
    await expect(page.getByRole('option', { name: editedName })).toHaveCount(0);
    await page.getByRole('button', { name: /Check Availability/i }).click();
    await expect(page.getByText(/not currently listed/i)).toBeVisible(MEDIUM);

    expect(pageErrors).toEqual([]);
  });
});