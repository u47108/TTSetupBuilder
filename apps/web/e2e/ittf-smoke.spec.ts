import { expect, test } from '@playwright/test';

test.describe('ITTF approval smoke', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('prasidha-action shows not-approved ITTF notice', async ({ page }) => {
    await page.goto('/products/prasidha-action');
    await expect(page.getByRole('heading', { name: /Prasidha Action/i })).toBeVisible({
      timeout: 15_000,
    });
    const notice = page.getByRole('status', {
      name: /homologación ITTF|ITTF approval/i,
    });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(/No homologada|not approved|ApprovalStatus/i);
  });

  test('prasidha-830 shows not-approved ITTF notice', async ({ page }) => {
    await page.goto('/products/prasidha-830');
    await expect(page.getByRole('heading', { name: /Prasidha 830/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole('status', { name: /homologación ITTF|ITTF approval/i }),
    ).toBeVisible();
  });
});
