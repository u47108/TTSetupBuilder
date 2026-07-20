/**
 * Guard checks for blade-safe catalog image optimization.
 * Run: pnpm --filter @ttsetupbuilder/scrapers exec tsx src/pipeline/optimizeImage.guard.ts
 */
import sharp from 'sharp';
import {
  allowKnockoutForCategory,
  optimizeCatalogImage,
} from './optimizeImage.js';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

/** Pale wood rectangle on transparent canvas (CDN-style cutout). */
async function paleWoodOnAlpha(): Promise<Buffer> {
  const size = 120;
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const inWood = x >= 30 && x < 90 && y >= 20 && y < 100;
      if (inWood) {
        // Light wood tones — historically eaten by fringe scrub
        rgba[i] = 235;
        rgba[i + 1] = 220;
        rgba[i + 2] = 190;
        rgba[i + 3] = 255;
      } else {
        rgba[i] = 255;
        rgba[i + 1] = 255;
        rgba[i + 2] = 255;
        rgba[i + 3] = 0;
      }
    }
  }
  return sharp(rgba, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toBuffer();
}

async function countOpaque(buffer: Buffer): Promise<number> {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let opaque = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! >= 200) opaque += 1;
  }
  // JPEG has no alpha — count non-near-white pixels instead
  if (info.channels < 4 || opaque === info.width * info.height) {
    const rgb = await sharp(buffer).removeAlpha().raw().toBuffer({
      resolveWithObject: true,
    });
    let woodish = 0;
    for (let i = 0; i < rgb.data.length; i += 3) {
      const r = rgb.data[i]!;
      const g = rgb.data[i + 1]!;
      const b = rgb.data[i + 2]!;
      if (!(r >= 250 && g >= 250 && b >= 250)) woodish += 1;
    }
    return woodish;
  }
  return opaque;
}

async function main(): Promise<void> {
  assert(allowKnockoutForCategory('blade') === false, 'blades must disable knockout');
  assert(allowKnockoutForCategory('rubber') === true, 'rubbers may knockout');

  const cutout = await paleWoodOnAlpha();
  const before = await countOpaque(cutout);

  const withKnock = await optimizeCatalogImage(cutout, { allowKnockout: true });
  // No studio plate corners → must not emit shredded WebP alpha
  assert(withKnock.knockedOutBackground === false, 'cutout must not trigger studio knockout');
  assert(withKnock.extension === '.jpg', `expected JPEG, got ${withKnock.extension}`);

  const noKnock = await optimizeCatalogImage(cutout, { allowKnockout: false });
  assert(noKnock.extension === '.jpg', 'blade path must be JPEG');
  assert(noKnock.knockedOutBackground === false, 'blade path must not knockout');
  const after = await countOpaque(noKnock.buffer);
  // Flatten keeps the wood body — should not lose most pixels to scrub
  assert(after >= before * 0.85, `wood pixels lost: before=${before} after=${after}`);

  console.info('optimizeImage.guard: ok');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
