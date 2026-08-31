# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Admin authentication & RBAC guards >> valid credentials reach the dashboard and logout works
- Location: tests\e2e\auth.spec.ts:27:7

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /\/admin\/login/
Received string: "http://localhost:3000/admin/login"
Timeout: 5000ms

Call log:
  - Expect "not toHaveURL" with timeout 5000ms
    7 × locator resolved to <html lang="en" class="scroll-smooth">…</html>
      - unexpected value "http://localhost:3000/admin/login"

```

```yaml
- link "ABS NETWORK COMMAND CENTER":
  - /url: /
- heading "Admin Portal Sign In" [level=1]
- paragraph: Secure administrative control portal for ABS Network Broadband SMC-Pvt-Ltd.
- text: Admin Email
- textbox "Admin Email":
  - /placeholder: you@absnetwork.pk
  - text: admin@absnetwork.pk
- text: Master Password
- textbox "Master Password":
  - /placeholder: ••••••••••••
  - text: AdminPassword@2026!
- button "Sign In to Dashboard"
- link "← Back to ABS Network Public Portal":
  - /url: /
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const ADMIN_EMAIL = 'admin@absnetwork.pk';
  4  | const ADMIN_PASSWORD = 'AdminPassword@2026!';
  5  | 
  6  | test.describe('Admin authentication & RBAC guards', () => {
  7  |   test('unauthenticated admin route redirects to login', async ({ page }) => {
  8  |     await page.goto('/admin/dashboard');
  9  |     await expect(page).toHaveURL(/\/admin\/login/);
  10 |   });
  11 | 
  12 |   test('login page renders the credential form', async ({ page }) => {
  13 |     await page.goto('/admin/login');
  14 |     await expect(page.getByLabel(/Email/i).first()).toBeVisible();
  15 |     await expect(page.getByLabel(/Password/i).first()).toBeVisible();
  16 |   });
  17 | 
  18 |   test('wrong password surfaces an auth error', async ({ page }) => {
  19 |     await page.goto('/admin/login');
  20 |     await page.getByLabel(/Email/i).first().fill(ADMIN_EMAIL);
  21 |     await page.getByLabel(/Password/i).first().fill('wrong-password-123');
  22 |     await page.getByRole('button', { name: /sign in/i }).first().click();
  23 |     await expect(page.getByText(/invalid|incorrect|error/gi).first()).toBeVisible();
  24 |     await expect(page).toHaveURL(/\/admin\/login/);
  25 |   });
  26 | 
  27 |   test('valid credentials reach the dashboard and logout works', async ({ page }) => {
  28 |     await page.goto('/admin/login');
  29 |     await page.getByLabel(/Email/i).first().fill(ADMIN_EMAIL);
  30 |     await page.getByLabel(/Password/i).first().fill(ADMIN_PASSWORD);
  31 |     await page.getByRole('button', { name: /sign in/i }).first().click();
> 32 |     await expect(page).not.toHaveURL(/\/admin\/login/);
     |                            ^ Error: expect(page).not.toHaveURL(expected) failed
  33 |     await expect(page.getByText(/Dashboard/i).first()).toBeVisible();
  34 | 
  35 |     const logout = page.getByRole('button', { name: /logout|sign out/i });
  36 |     if (await logout.isVisible().catch(() => false)) {
  37 |       await logout.click();
  38 |       await expect(page).toHaveURL(/\/admin\/login/);
  39 |     }
  40 |   });
  41 | 
  42 |   test('security auditor account cannot open a management page', async ({ page }) => {
  43 |     await page.goto('/admin/login');
  44 |     await page.getByLabel(/Email/i).first().fill(ADMIN_EMAIL);
  45 |     await page.getByLabel(/Password/i).first().fill(ADMIN_PASSWORD);
  46 |     await page.getByRole('button', { name: /sign in/i }).first().click();
  47 |     await expect(page).not.toHaveURL(/\/admin\/login/);
  48 |     await page.goto('/admin/users');
  49 |     await expect(page).not.toHaveURL(/\/admin\/login/);
  50 |   });
  51 | });
```