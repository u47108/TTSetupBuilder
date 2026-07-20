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
  /** True when studio white/black plate was removed to alpha. */
  knockedOutBackground: boolean;
  /** @deprecated Use knockedOutBackground */
  knockedOutWhite: boolean;
};

type BgMode = 'white' | 'black';

function isNearWhite(r: number, g: number, b: number, threshold = 220): boolean {
  return r >= threshold && g >= threshold && b >= threshold;
}

function isNearBlack(r: number, g: number, b: number, threshold = 36): boolean {
  return r <= threshold && g <= threshold && b <= threshold;
}

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function matchesBg(mode: BgMode, r: number, g: number, b: number): boolean {
  if (mode === 'white') {
    // Generous match so JPEG halos around the subject get flooded.
    return isNearWhite(r, g, b, 215) || luminance(r, g, b) >= 232;
  }
  return isNearBlack(r, g, b);
}

/**
 * Hard-clear plate pixels; keep a short soft band only for anti-alias.
 * Soft white fringe looks jagged on dark UI — prefer transparent over milky edges.
 */
function alphaForBgPixel(mode: BgMode, r: number, g: number, b: number): number {
  if (mode === 'white') {
    const dist = Math.hypot(255 - r, 255 - g, 255 - b);
    if (dist < 48 || luminance(r, g, b) >= 225) return 0;
    if (dist < 72) return Math.round(((dist - 48) / 24) * 180);
    return 255;
  }
  const dist = Math.hypot(r, g, b);
  if (dist < 36) return 0;
  if (dist < 60) return Math.round(((dist - 36) / 24) * 200);
  return 255;
}

function detectStudioBackground(
  rgba: Buffer,
  width: number,
  height: number,
): BgMode | null {
  const channels = 4;
  const sample = (x: number, y: number) => {
    const i = (y * width + x) * channels;
    return [rgba[i]!, rgba[i + 1]!, rgba[i + 2]!, rgba[i + 3]!] as const;
  };

  const corners = [
    sample(2, 2),
    sample(width - 3, 2),
    sample(2, height - 3),
    sample(width - 3, height - 3),
  ];

  // Skip already-transparent corners (re-optimize of WebP) — RGB is often 0,0,0.
  const opaqueCorners = corners.filter(([, , , a]) => a >= 200);
  if (opaqueCorners.length < 3) return null;

  const whiteCorners = opaqueCorners.filter(([r, g, b]) => isNearWhite(r, g, b, 220)).length;
  const blackCorners = opaqueCorners.filter(([r, g, b]) => isNearBlack(r, g, b)).length;

  if (whiteCorners >= 3) return 'white';
  if (blackCorners >= 3) return 'black';
  return null;
}

/** Clear milky / jagged white fringe left by soft knockout or JPEG. */
function scrubWhiteFringe(rgba: Buffer, width: number, height: number): boolean {
  const channels = 4;
  let changed = false;

  // Pass 1: any light pixel with partial alpha → fully transparent.
  for (let i = 0; i < rgba.length; i += channels) {
    const a = rgba[i + 3]!;
    if (a === 0 || a === 255) continue;
    const r = rgba[i]!;
    const g = rgba[i + 1]!;
    const b = rgba[i + 2]!;
    if (luminance(r, g, b) >= 200 || isNearWhite(r, g, b, 200)) {
      rgba[i + 3] = 0;
      changed = true;
    }
  }

  // Pass 2: opaque near-white next to transparent → clear (1px matte erode).
  const toClear: number[] = [];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const idx = y * width + x;
      const i = idx * channels;
      if (rgba[i + 3]! < 200) continue;
      const r = rgba[i]!;
      const g = rgba[i + 1]!;
      const b = rgba[i + 2]!;
      if (!(isNearWhite(r, g, b, 210) || luminance(r, g, b) >= 230)) continue;
      const neighbors = [
        rgba[((idx - 1) * channels) + 3]!,
        rgba[((idx + 1) * channels) + 3]!,
        rgba[((idx - width) * channels) + 3]!,
        rgba[((idx + width) * channels) + 3]!,
      ];
      if (neighbors.some((a) => a < 40)) toClear.push(i);
    }
  }
  for (const i of toClear) {
    rgba[i + 3] = 0;
    changed = true;
  }

  return changed;
}

function floodFillKnockout(
  rgba: Buffer,
  width: number,
  height: number,
  mode: BgMode,
): void {
  const channels = 4;
  const pixelCount = width * height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const enqueueIfBg = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * channels;
    if (rgba[i + 3]! < 8) {
      visited[idx] = 1;
      return;
    }
    if (!matchesBg(mode, rgba[i]!, rgba[i + 1]!, rgba[i + 2]!)) return;
    visited[idx] = 1;
    queue[tail++] = idx;
  };

  for (let x = 0; x < width; x += 1) {
    enqueueIfBg(x, 0);
    enqueueIfBg(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueueIfBg(0, y);
    enqueueIfBg(width - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++]!;
    const x = idx % width;
    const y = (idx / width) | 0;
    const i = idx * channels;
    rgba[i + 3] = alphaForBgPixel(mode, rgba[i]!, rgba[i + 1]!, rgba[i + 2]!);

    enqueueIfBg(x + 1, y);
    enqueueIfBg(x - 1, y);
    enqueueIfBg(x, y + 1);
    enqueueIfBg(x, y - 1);
  }

  // Soft fringe for black only (dark handles must stay); white uses scrub instead.
  if (mode === 'black') {
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const idx = y * width + x;
        if (visited[idx]) continue;
        const i = idx * channels;
        if (rgba[i + 3]! === 0) continue;
        if (!isNearBlack(rgba[i]!, rgba[i + 1]!, rgba[i + 2]!, 48)) continue;
        const nearKnocked =
          visited[idx - 1] ||
          visited[idx + 1] ||
          visited[idx - width] ||
          visited[idx + width];
        if (nearKnocked) {
          rgba[i + 3] = alphaForBgPixel('black', rgba[i]!, rgba[i + 1]!, rgba[i + 2]!);
        }
      }
    }
  }
}

function isLowChroma(r: number, g: number, b: number, maxDelta = 36): boolean {
  return Math.max(r, g, b) - Math.min(r, g, b) <= maxDelta;
}

/**
 * Retail white-plate cutouts often leave a dark matte ring on the silhouette
 * (black “contour” between pale wood and #fff). Clear only near-black/gray
 * pixels that touch the white plate — interior print and blue handle stay.
 */
function scrubDarkMatteFringe(rgba: Buffer, width: number, height: number): boolean {
  if (detectStudioBackground(rgba, width, height) !== 'white') return false;

  const channels = 4;
  const pixelCount = width * height;
  const isBg = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const enqueueWhite = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (isBg[idx]) return;
    const i = idx * channels;
    if (!isNearWhite(rgba[i]!, rgba[i + 1]!, rgba[i + 2]!, 242)) return;
    isBg[idx] = 1;
    queue[tail++] = idx;
  };

  for (let x = 0; x < width; x += 1) {
    enqueueWhite(x, 0);
    enqueueWhite(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueueWhite(0, y);
    enqueueWhite(width - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++]!;
    const x = idx % width;
    const y = (idx / width) | 0;
    enqueueWhite(x + 1, y);
    enqueueWhite(x - 1, y);
    enqueueWhite(x, y + 1);
    enqueueWhite(x, y - 1);
  }

  if (tail < Math.floor(pixelCount * 0.05)) return false;

  const touchesBg = (idx: number, radius = 1) => {
    const x = idx % width;
    const y = (idx / width) | 0;
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (isBg[ny * width + nx]) return true;
      }
    }
    return false;
  };

  const isMatteFringe = (r: number, g: number, b: number, lumMax: number, chromaMax: number) => {
    const lum = luminance(r, g, b);
    if (lum > lumMax) return false;
    if (!isLowChroma(r, g, b, chromaMax)) return false;
    return true;
  };

  let changed = false;
  // Expand outward from the white plate: hard matte → soft ring → near-edge grey.
  const passes: Array<{ lumMax: number; chromaMax: number; radius: number }> = [
    { lumMax: 85, chromaMax: 45, radius: 1 },
    { lumMax: 120, chromaMax: 32, radius: 1 },
    { lumMax: 100, chromaMax: 28, radius: 2 },
  ];

  for (const pass of passes) {
    const toClear: number[] = [];
    for (let idx = 0; idx < pixelCount; idx += 1) {
      if (isBg[idx]) continue;
      if (!touchesBg(idx, pass.radius)) continue;
      const i = idx * channels;
      if (!isMatteFringe(rgba[i]!, rgba[i + 1]!, rgba[i + 2]!, pass.lumMax, pass.chromaMax)) {
        continue;
      }
      toClear.push(i);
    }
    for (const i of toClear) {
      rgba[i] = 255;
      rgba[i + 1] = 255;
      rgba[i + 2] = 255;
      rgba[i + 3] = 255;
      isBg[(i / channels) | 0] = 1;
      changed = true;
    }
  }

  return changed;
}

/**
 * Studio product shots on white or black plates → transparent WebP.
 * White/black: flood-fill from edges; fringe scrub only after a real plate knockout.
 *
 * Do **not** scrub when no studio plate is detected: pale wood next to existing
 * alpha (CDN cutouts / prior WebP) gets shredded into jagged holes on dark UI.
 */
async function maybeKnockoutStudioBackground(
  rgba: Buffer,
  width: number,
  height: number,
): Promise<{ buffer: Buffer; knocked: boolean } | null> {
  const mode = detectStudioBackground(rgba, width, height);
  if (!mode) return null;

  floodFillKnockout(rgba, width, height, mode);
  scrubWhiteFringe(rgba, width, height);

  const buffer = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .webp({ quality: CATALOG_WEBP_QUALITY, alphaQuality: 100 })
    .toBuffer();

  return { buffer, knocked: true };
}

export type OptimizeCatalogImageOptions = {
  /**
   * Studio white/black → transparent WebP.
   * Disable for blades: pale wood is near-white and gets eaten by flood-fill + fringe scrub.
   * Default true only inside this function; callers that download by category must
   * pass `allowKnockoutForCategory(category)` (blades → false).
   */
  allowKnockout?: boolean;
};

/** Blades keep the studio plate as JPEG — never WebP alpha knockout. */
export function allowKnockoutForCategory(category: string): boolean {
  return category !== 'blade';
}

/**
 * Downscale + re-encode for owned catalog storage (ADR-008).
 * Knockouts studio white/black backgrounds to alpha (WebP) when detected —
 * unless `allowKnockout: false` (blades → JPEG ≤720, plate kept).
 */
export async function optimizeCatalogImage(
  input: Buffer,
  options: OptimizeCatalogImageOptions = {},
): Promise<OptimizeImageResult> {
  const allowKnockout = options.allowKnockout !== false;
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

  // Blades: never knockout — wood edges ≈ studio white → shredded alpha on dark UI.
  // Still scrub retail dark matte rings on white plates (black contour artifacts).
  if (!allowKnockout) {
    const { data, info } = await resized
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const rgba = Buffer.from(data);
    scrubDarkMatteFringe(rgba, info.width, info.height);

    const buffer = await sharp(rgba, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: CATALOG_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
    const outMeta = await sharp(buffer).metadata();
    return {
      buffer,
      contentType: 'image/jpeg',
      extension: '.jpg',
      width: outMeta.width ?? CATALOG_MAX_WIDTH,
      height: outMeta.height ?? CATALOG_MAX_WIDTH,
      knockedOutBackground: false,
      knockedOutWhite: false,
    };
  }

  const { data, info } = await resized.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.from(data);
  const knocked = await maybeKnockoutStudioBackground(rgba, info.width, info.height);

  if (knocked) {
    const outMeta = await sharp(knocked.buffer).metadata();
    return {
      buffer: knocked.buffer,
      contentType: 'image/webp',
      extension: '.webp',
      width: outMeta.width ?? info.width,
      height: outMeta.height ?? info.height,
      knockedOutBackground: true,
      knockedOutWhite: true,
    };
  }

  const buffer = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: CATALOG_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  const outMeta = await sharp(buffer).metadata();

  return {
    buffer,
    contentType: 'image/jpeg',
    extension: '.jpg',
    width: outMeta.width ?? info.width,
    height: outMeta.height ?? info.height,
    knockedOutBackground: false,
    knockedOutWhite: false,
  };
}
