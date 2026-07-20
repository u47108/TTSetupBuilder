import sharp from 'sharp';

/** Catalog display size — photography-first without huge Magento “full” masters. */
export const CATALOG_MAX_WIDTH = 720;
export const CATALOG_JPEG_QUALITY = 72;
export const CATALOG_WEBP_QUALITY = 80;

export type OptimizeImageResult = {
  buffer: Buffer;
  contentType: 'image/jpeg' | 'image/webp';
  extension: '.jpg' | '.webp';
  width: number;
  height: number;
  knockedOutWhite: boolean;
};

function isNearWhite(r: number, g: number, b: number, threshold = 242): boolean {
  return r >= threshold && g >= threshold && b >= threshold;
}

/**
 * Studio product shots (blades on white) → transparent WebP.
 * Colorful packaging (most rubbers) keeps JPEG when corners are not white.
 */
async function maybeKnockoutWhiteBackground(
  rgba: Buffer,
  width: number,
  height: number,
): Promise<Buffer | null> {
  const channels = 4;
  const sample = (x: number, y: number) => {
    const i = (y * width + x) * channels;
    return [rgba[i]!, rgba[i + 1]!, rgba[i + 2]!] as const;
  };

  const corners = [
    sample(2, 2),
    sample(width - 3, 2),
    sample(2, height - 3),
    sample(width - 3, height - 3),
  ];
  const whiteCorners = corners.filter(([r, g, b]) => isNearWhite(r, g, b)).length;
  if (whiteCorners < 3) return null;

  for (let i = 0; i < rgba.length; i += channels) {
    const r = rgba[i]!;
    const g = rgba[i + 1]!;
    const b = rgba[i + 2]!;
    const dist = Math.hypot(255 - r, 255 - g, 255 - b);
    if (dist < 26) {
      rgba[i + 3] = 0;
    } else if (dist < 52) {
      rgba[i + 3] = Math.round(((dist - 26) / 26) * 255);
    }
  }

  return sharp(rgba, { raw: { width, height, channels: 4 } })
    .webp({ quality: CATALOG_WEBP_QUALITY, alphaQuality: 90 })
    .toBuffer();
}

/**
 * Downscale + re-encode for owned catalog storage (ADR-008).
 * Knockouts near-white studio backgrounds to alpha (WebP) when detected.
 */
export async function optimizeCatalogImage(input: Buffer): Promise<OptimizeImageResult> {
  const image = sharp(input, { failOn: 'none' }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? CATALOG_MAX_WIDTH;

  const resized =
    width > CATALOG_MAX_WIDTH
      ? image.resize({
          width: CATALOG_MAX_WIDTH,
          withoutEnlargement: true,
          fit: 'inside',
        })
      : image;

  const { data, info } = await resized.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.from(data);
  const knocked = await maybeKnockoutWhiteBackground(rgba, info.width, info.height);

  if (knocked) {
    const outMeta = await sharp(knocked).metadata();
    return {
      buffer: knocked,
      contentType: 'image/webp',
      extension: '.webp',
      width: outMeta.width ?? info.width,
      height: outMeta.height ?? info.height,
      knockedOutWhite: true,
    };
  }

  const buffer = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .jpeg({ quality: CATALOG_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  const outMeta = await sharp(buffer).metadata();

  return {
    buffer,
    contentType: 'image/jpeg',
    extension: '.jpg',
    width: outMeta.width ?? info.width,
    height: outMeta.height ?? info.height,
    knockedOutWhite: false,
  };
}
