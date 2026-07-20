import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const evidenceDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'test-results',
  'evidence',
);

async function setLocale(page: Page, locale: 'en' | 'es') {
  await page.addInitScript((code) => {
    window.localStorage.setItem('ttsetupbuilder.locale', code);
  }, locale);
}

async function fullPageShot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(evidenceDir, name),
    fullPage: true,
  });
}

test.describe('Visual evidence screenshots (local only)', () => {
  test('capture home, prasidha ITTF, builder', async ({ page }) => {
    // --- Home EN ---
    await setLocale(page, 'en');
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
    await fullPageShot(page, '01-home-en.png');

    // --- Home ES (toggle) ---
    await page.getByRole('group', { name: /Language|Idioma/i }).getByRole('button', { name: 'ES' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await fullPageShot(page, '02-home-es.png');

    // --- Prasidha Action EN ---
    await page.getByRole('group', { name: /Language|Idioma/i }).getByRole('button', { name: 'EN' }).click();
    await page.goto('/products/prasidha-action');
    await expect(page.getByRole('heading', { name: /Prasidha Action/i })).toBeVisible({
      timeout: 15_000,
    });
    const noticeEn = page.getByRole('status', {
      name: /homologación ITTF|ITTF approval/i,
    });
    await expect(noticeEn).toBeVisible();
    await expect(noticeEn).toContainText(/not approved|No homologada|ApprovalStatus/i);
    await fullPageShot(page, '03-prasidha-action-ittf-en.png');

    // --- Prasidha Action ES (Spanish ITTF / "goma") ---
    await page.getByRole('group', { name: /Language|Idioma/i }).getByRole('button', { name: 'ES' }).click();
    await expect(noticeEn).toContainText(/goma|No homologada/i);
    await fullPageShot(page, '04-prasidha-action-ittf-es.png');

    // --- Builder empty ---
    await page.goto('/builder');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Loading|Cargando/i)).toHaveCount(0, { timeout: 20_000 });
    await fullPageShot(page, '05-builder-empty.png');

    // --- Builder with Donic Blues T1 (approved listing checklist) ---
    await page.goto('/builder');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Loading|Cargando/i)).toHaveCount(0, { timeout: 20_000 });

    const bladeList = page.locator('aside ul').first();
    await expect(bladeList.getByRole('button').first()).toBeVisible({ timeout: 15_000 });
    await bladeList.getByRole('button').first().click();

    const handleSection = page.locator('aside section').filter({
      hasText: /Handle|Tomada|mango/i,
    });
    await expect(handleSection.getByRole('button').first()).toBeVisible({ timeout: 10_000 });
    await handleSection.getByRole('button').first().click();

    const fhSection = page.locator('aside section').filter({
      hasText: /Right rubber|Goma derecha/i,
    });
    await fhSection.getByRole('button').first().click();
    const fhSearch = fhSection.locator('input[type="search"]');
    await expect(fhSearch).toBeVisible({ timeout: 15_000 });
    await fhSearch.fill('Blues T1');
    const bluesBtn = fhSection
      .locator('ul button')
      .filter({ hasText: /Blues T1/i })
      .first();
    await expect(bluesBtn).toBeVisible({ timeout: 15_000 });
    await bluesBtn.click();

    const builderListing = page.getByRole('status').filter({
      hasText: /21-043|Blues T1|Homologada|ITTF-approved|Listado ITTF/i,
    });
    await expect(builderListing.first()).toBeVisible({ timeout: 10_000 });
    await expect(builderListing.first()).toContainText(/21-043/);
    await expect(builderListing.first()).toContainText(/Red|Negro|Black|hoja|sheet|esponja|sponge/i);
    await fullPageShot(page, '06-builder-blues-t1-ittf-listing.png');

    // Complete BH with another rubber so ready-setup preview notice appears
    const bhSection = page.locator('aside section').filter({
      hasText: /Left rubber|Goma izquierda/i,
    });
    await bhSection.getByRole('button').first().click();
    const bhSearch = bhSection.locator('input[type="search"]');
    await expect(bhSearch).toBeVisible({ timeout: 15_000 });
    await bhSearch.fill('Donic Coppa');
    const coppaBtn = bhSection.locator('ul button').filter({ hasText: /Donic Coppa/i }).first();
    await expect(coppaBtn).toBeVisible({ timeout: 15_000 });
    await coppaBtn.click();

    const previewNotice = page.locator('[data-ittf-placement="preview"]');
    await expect(previewNotice).toBeVisible({ timeout: 10_000 });
    await expect(previewNotice).toContainText(/21-043|Blues T1|Coppa|No homologada|not approved/i);
    await fullPageShot(page, '07-builder-blues-t1-ready-setup.png');

    // Product detail for Blues T1
    await page.goto('/products/donic-blues-t1');
    await expect(page.getByRole('heading', { name: /Blues T1/i })).toBeVisible({
      timeout: 15_000,
    });
    const detailNotice = page.getByRole('status', { name: /homologación ITTF|ITTF approval/i });
    await expect(detailNotice).toBeVisible();
    await expect(detailNotice).toContainText(/21-043/);
    await expect(detailNotice).toContainText(/goma|rubber|esponja|sponge|hoja|sheet/i);
    await fullPageShot(page, '08-donic-blues-t1-detail-es.png');
  });
});
