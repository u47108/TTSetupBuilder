import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const evidenceDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'test-results',
  'evidence',
  'viscaria-zyre',
);

async function setLocaleEs(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('ttsetupbuilder.locale', 'es');
  });
}

async function waitForCatalog(page: Page) {
  await page.goto('/builder');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Loading|Cargando/i)).toHaveCount(0, { timeout: 20_000 });
}

async function pickProduct(
  page: Page,
  sectionPattern: RegExp,
  query: string,
  accessibleName: RegExp,
) {
  const section = page.locator('aside section').filter({ hasText: sectionPattern });
  const openSearch = section.getByRole('button', { name: /buscar|search|Abrir|Open/i });
  if (await openSearch.isVisible().catch(() => false)) {
    await openSearch.click();
  } else {
    await section.getByRole('button').first().click();
  }
  const search = section.locator('input[type="search"]');
  await expect(search).toBeVisible({ timeout: 15_000 });
  await search.fill(query);
  const productBtn = section.getByRole('button', { name: accessibleName }).first();
  await expect(productBtn).toBeVisible({ timeout: 15_000 });
  await productBtn.click();
}

async function searchWithoutSelecting(page: Page, sectionPattern: RegExp, query: string) {
  const section = page.locator('aside section').filter({ hasText: sectionPattern });
  const openSearch = section.getByRole('button', { name: /buscar|search|Abrir|Open/i });
  if (await openSearch.isVisible().catch(() => false)) {
    await openSearch.click();
  } else {
    await section.getByRole('button').first().click();
  }
  const search = section.locator('input[type="search"]');
  await expect(search).toBeVisible({ timeout: 15_000 });
  await search.fill(query);
  return section;
}

test.describe('Viscaria Alc + Zyre 03 ITTF (ES)', () => {
  test('FH homologada 14-049; duplicado Goma Zyre 03 eliminado del catálogo', async ({ page }) => {
    await setLocaleEs(page);
    await waitForCatalog(page);

    await pickProduct(page, /Madera|Blade|1 ·/i, 'Viscaria Alc', /^Viscaria Alc viscaria$/i);
    await page.getByRole('button', { name: /ST · Recta|ST\b/i }).click();

    await pickProduct(
      page,
      /Goma derecha|Right rubber|3 ·/i,
      'ZYRE 03',
      /^Butterfly ZYRE 03 butterfly$/i,
    );

    const fhNotice = page.locator('[data-ittf-placement="palette"] li').filter({
      hasText: /Derecha ·.*ZYRE 03/i,
    });
    await expect(fhNotice).toBeVisible({ timeout: 10_000 });
    await expect(fhNotice).toContainText(/Homologada por la ITTF/i);
    await expect(fhNotice).toContainText(/14-049/);
    await expect(page.locator('img[src="/catalog/8e86c058516be6bd.webp"]').first()).toBeVisible();

    await page.screenshot({
      path: path.join(evidenceDir, '01-fh-zyre-approved.png'),
      fullPage: true,
    });

    const bhSection = await searchWithoutSelecting(
      page,
      /Goma izquierda|Left rubber|4 ·/i,
      'Goma Zyre 03',
    );
    await expect(bhSection.getByRole('button', { name: /^Goma Zyre 03/i })).toHaveCount(0);
    await expect(bhSection.getByRole('button', { name: /^Butterfly ZYRE 03 butterfly$/i })).toBeVisible();

    await page.screenshot({
      path: path.join(evidenceDir, '02-bh-goma-zyre-removed.png'),
      fullPage: true,
    });

    await pickProduct(
      page,
      /Goma izquierda|Left rubber|4 ·/i,
      'Rakza 9',
      /^Yasaka Rakza 9 yasaka$/i,
    );

    const bhNotice = page.locator('[data-ittf-placement="palette"] li').filter({
      hasText: /Izquierda ·.*Rakza 9/i,
    });
    await expect(bhNotice).toBeVisible();
    await expect(bhNotice).toContainText(/No figura en la lista ITTF/i);

    const previewNotice = page.locator('[data-ittf-placement="preview"]');
    await expect(previewNotice).toBeVisible({ timeout: 10_000 });
    await expect(previewNotice).toContainText(/14-049/);
    await expect(previewNotice).toContainText(/No figura en la lista ITTF/i);

    await page.screenshot({
      path: path.join(evidenceDir, '03-builder-complete.png'),
      fullPage: true,
    });
  });
});
