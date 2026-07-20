/**
 * Guard checks for VP Sport brand + name normalization.
 * Run: pnpm --filter @ttsetupbuilder/scrapers exec tsx src/sources/createVpsportJumpsellerSource.guard.ts
 */
import {
  normalizeVpsportProductName,
  VPSPORT_BRAND_ID,
} from './createVpsportJumpsellerSource.js';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function main(): void {
  assert(VPSPORT_BRAND_ID === 'butterfly', 'VP Sport brand must be butterfly');

  assert(
    normalizeVpsportProductName('Goma Dignics 05') === 'Dignics 05',
    'strip Goma prefix from rubber names',
  );
  assert(
    normalizeVpsportProductName('Goma ZYRE 03') === 'ZYRE 03',
    'preserve rubber line casing after Goma strip',
  );
  assert(
    normalizeVpsportProductName('Madero Viscaria ALC') === 'Viscaria ALC',
    'strip Madero prefix from blade names',
  );
  assert(
    normalizeVpsportProductName('Viscaria ALC') === 'Viscaria ALC',
    'leave unprefixed names unchanged',
  );

  console.info('createVpsportJumpsellerSource.guard: ok');
}

main();
