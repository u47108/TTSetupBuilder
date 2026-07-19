import sharp from 'sharp';

/** Catalog display size — photography-first without huge Magento “full” masters. */
export const CATALOG_MAX_WIDTH = 720;
export const CATALOG_JPEG_QUALITY = 72;

export type OptimizeImageResult = {
  buffer: Buffer;
  contentType: 'image/jpeg';
  extension: '.jpg';
  width: number;
  height: number;
};

/**
 * Downscale + re-encode to JPEG for owned catalog storage (ADR-008 derivatives).
 */
export async function optimizeCatalogImage(input: Buffer): Promise<OptimizeImageResult> {
  const image = sharp(input, { failOn: 'none' }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? CATALOG_MAX_WIDTH;

  const pipeline =
    width > CATALOG_MAX_WIDTH
      ? image.resize({
          width: CATALOG_MAX_WIDTH,
          withoutEnlargement: true,
          fit: 'inside',
        })
      : image;

  const buffer = await pipeline
    .jpeg({ quality: CATALOG_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  const outMeta = await sharp(buffer).metadata();

  return {
    buffer,
    contentType: 'image/jpeg',
    extension: '.jpg',
    width: outMeta.width ?? CATALOG_MAX_WIDTH,
    height: outMeta.height ?? 0,
  };
}
