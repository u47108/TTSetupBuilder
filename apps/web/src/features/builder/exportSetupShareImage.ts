import type { BladeHandleType, CatalogProduct } from '@ttsetupbuilder/types';

export type SetupSharePayload = {
  playerPhotoUrl: string | null;
  playerName: string;
  playerPhotoZoom: number;
  playerPhotoOffsetX: number;
  playerPhotoOffsetY: number;
  blade: CatalogProduct;
  bladeHandle: BladeHandleType | null;
  fh: CatalogProduct;
  bh: CatalogProduct;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
    img.src = src;
  });
}

function primarySrc(product: CatalogProduct): string | null {
  return product.images.find((image) => image.isPrimary)?.src ?? product.images[0]?.src ?? null;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
) {
  const cover = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const scale = cover * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const maxOx = Math.max(0, (dw - w) / 2);
  const maxOy = Math.max(0, (dh - h) / 2);
  const dx = x + (w - dw) / 2 + offsetX * maxOx;
  const dy = y + (h - dh) / 2 + offsetY * maxOy;
  ctx.drawImage(img, dx, dy, dw, dh);
}

type StudioBgMode = 'white' | 'black';

function nearWhite(r: number, g: number, b: number, threshold = 220) {
  return r >= threshold && g >= threshold && b >= threshold;
}

function nearBlack(r: number, g: number, b: number, threshold = 36) {
  return r <= threshold && g <= threshold && b <= threshold;
}

function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Knock out studio white/black plates; scrub milky white fringe for dark UI.
 */
function knockoutStudioBgToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const cctx = c.getContext('2d');
  if (!cctx) return c;
  cctx.drawImage(img, 0, 0);
  const imageData = cctx.getImageData(0, 0, c.width, c.height);
  const d = imageData.data;
  const w = c.width;
  const h = c.height;
  const sample = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return [d[i]!, d[i + 1]!, d[i + 2]!, d[i + 3]!] as const;
  };
  const corners = [
    sample(2, 2),
    sample(w - 3, 2),
    sample(2, h - 3),
    sample(w - 3, h - 3),
  ];
  const opaqueCorners = corners.filter(([, , , a]) => a >= 200);
  const whiteCorners = opaqueCorners.filter(([r, g, b]) => nearWhite(r, g, b)).length;
  const blackCorners = opaqueCorners.filter(([r, g, b]) => nearBlack(r, g, b)).length;

  let mode: StudioBgMode | null = null;
  if (opaqueCorners.length >= 3) {
    if (whiteCorners >= 3) mode = 'white';
    else if (blackCorners >= 3) mode = 'black';
  }

  const matches = (mode: StudioBgMode, r: number, g: number, b: number) =>
    mode === 'white'
      ? nearWhite(r, g, b, 215) || luminance(r, g, b) >= 232
      : nearBlack(r, g, b);

  if (mode) {
    const pixelCount = w * h;
    const visited = new Uint8Array(pixelCount);
    const queue = new Int32Array(pixelCount);
    let head = 0;
    let tail = 0;

    const enqueueIfBg = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const idx = y * w + x;
      if (visited[idx]) return;
      const i = idx * 4;
      if (d[i + 3]! < 8) {
        visited[idx] = 1;
        return;
      }
      if (!matches(mode, d[i]!, d[i + 1]!, d[i + 2]!)) return;
      visited[idx] = 1;
      queue[tail++] = idx;
    };

    for (let x = 0; x < w; x += 1) {
      enqueueIfBg(x, 0);
      enqueueIfBg(x, h - 1);
    }
    for (let y = 0; y < h; y += 1) {
      enqueueIfBg(0, y);
      enqueueIfBg(w - 1, y);
    }

    while (head < tail) {
      const idx = queue[head++]!;
      const x = idx % w;
      const y = (idx / w) | 0;
      const i = idx * 4;
      const r = d[i]!;
      const g = d[i + 1]!;
      const b = d[i + 2]!;
      if (mode === 'white') {
        const dist = Math.hypot(255 - r, 255 - g, 255 - b);
        d[i + 3] = dist < 48 || luminance(r, g, b) >= 225 ? 0 : dist < 72 ? 120 : 0;
      } else {
        const dist = Math.hypot(r, g, b);
        d[i + 3] = dist < 36 ? 0 : dist < 60 ? Math.round(((dist - 36) / 24) * 200) : 0;
      }
      enqueueIfBg(x + 1, y);
      enqueueIfBg(x - 1, y);
      enqueueIfBg(x, y + 1);
      enqueueIfBg(x, y - 1);
    }
  }

  // Scrub milky fringe (partial alpha + light, or light next to holes).
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3]!;
    if (a === 0 || a === 255) continue;
    if (luminance(d[i]!, d[i + 1]!, d[i + 2]!) >= 200 || nearWhite(d[i]!, d[i + 1]!, d[i + 2]!, 200)) {
      d[i + 3] = 0;
    }
  }
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const idx = y * w + x;
      const i = idx * 4;
      if (d[i + 3]! < 200) continue;
      if (!(nearWhite(d[i]!, d[i + 1]!, d[i + 2]!, 210) || luminance(d[i]!, d[i + 1]!, d[i + 2]!) >= 230)) {
        continue;
      }
      const neighbors = [d[(idx - 1) * 4 + 3]!, d[(idx + 1) * 4 + 3]!, d[(idx - w) * 4 + 3]!, d[(idx + w) * 4 + 3]!];
      if (neighbors.some((a) => a < 40)) d[i + 3] = 0;
    }
  }

  cctx.putImageData(imageData, 0, 0);
  return c;
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const iw = img instanceof HTMLCanvasElement ? img.width : img.naturalWidth;
  const ih = img instanceof HTMLCanvasElement ? img.height : img.naturalHeight;
  const scale = Math.min(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawContainKnockoutWhite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  drawContain(ctx, knockoutStudioBgToCanvas(img), x, y, w, h);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

async function drawRubberTile(
  ctx: CanvasRenderingContext2D,
  label: string,
  product: CatalogProduct,
  x: number,
  y: number,
  size: number,
) {
  roundRect(ctx, x, y, size, size, 18);
  ctx.fillStyle = '#12161e';
  ctx.fill();
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.28)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const src = primarySrc(product);
  if (src) {
    try {
      const img = await loadImage(src);
      ctx.save();
      roundRect(ctx, x + 10, y + 28, size - 20, size - 48, 12);
      ctx.clip();
      drawContain(ctx, img, x + 10, y + 28, size - 20, size - 48);
      ctx.restore();
    } catch {
      // skip
    }
  }

  ctx.fillStyle = '#2dd4bf';
  ctx.font = '700 16px system-ui, sans-serif';
  ctx.fillText(label.toUpperCase(), x + 14, y + 22);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText(truncate(ctx, product.name, size - 24), x + 14, y + size - 12);
}

/**
 * Landscape share card inspired by pro-player setup posters:
 * portrait left · blade + rubbers right · equipment list bottom.
 */
export async function exportSetupShareImage(payload: SetupSharePayload): Promise<Blob> {
  const width = 1600;
  const height = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');

  // Background
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#07090d');
  bg.addColorStop(0.5, '#0c1016');
  bg.addColorStop(1, '#10151d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Accent washes (teal, not brand-pink copy)
  const washL = ctx.createRadialGradient(280, 420, 40, 280, 420, 520);
  washL.addColorStop(0, 'rgba(45, 212, 191, 0.12)');
  washL.addColorStop(1, 'rgba(45, 212, 191, 0)');
  ctx.fillStyle = washL;
  ctx.fillRect(0, 0, width, height);

  const washR = ctx.createRadialGradient(1180, 280, 20, 1180, 280, 420);
  washR.addColorStop(0, 'rgba(56, 189, 248, 0.10)');
  washR.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = washR;
  ctx.fillRect(0, 0, width, height);

  // —— Left: player portrait (full-bleed panel) ——
  const panelW = 620;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, panelW, height);
  ctx.clip();

  if (payload.playerPhotoUrl) {
    try {
      const playerImg = await loadImage(payload.playerPhotoUrl);
      drawCover(
        ctx,
        playerImg,
        0,
        0,
        panelW,
        height,
        payload.playerPhotoZoom,
        payload.playerPhotoOffsetX,
        payload.playerPhotoOffsetY,
      );
    } catch {
      ctx.fillStyle = '#151a22';
      ctx.fillRect(0, 0, panelW, height);
    }
  } else {
    ctx.fillStyle = '#151a22';
    ctx.fillRect(0, 0, panelW, height);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 28px system-ui, sans-serif';
    ctx.fillText('Sube tu foto', 210, height / 2);
  }

  // Gradient fade into equipment panel
  const fade = ctx.createLinearGradient(panelW - 160, 0, panelW, 0);
  fade.addColorStop(0, 'rgba(7, 9, 13, 0)');
  fade.addColorStop(1, 'rgba(7, 9, 13, 0.92)');
  ctx.fillStyle = fade;
  ctx.fillRect(panelW - 160, 0, 160, height);

  // Bottom vignette on portrait
  const vignette = ctx.createLinearGradient(0, height - 280, 0, height);
  vignette.addColorStop(0, 'rgba(7, 9, 13, 0)');
  vignette.addColorStop(1, 'rgba(7, 9, 13, 0.75)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, height - 280, panelW, 280);
  ctx.restore();

  // Player name over portrait (reference style)
  const displayName = payload.playerName.trim() || 'Mi setup';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 64px system-ui, sans-serif';
  const nameLines = splitName(displayName);
  let nameY = 78;
  for (const line of nameLines) {
    ctx.fillText(truncate(ctx, line, panelW - 80), 40, nameY);
    nameY += 68;
  }
  ctx.fillStyle = '#2dd4bf';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText('SETUP', 40, nameY + 8);

  // —— Right: equipment stage ——
  const stageX = panelW + 36;
  const stageW = width - stageX - 48;

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 18px system-ui, sans-serif';
  ctx.fillText('TTSETUPBUILDER', stageX, 48);

  // Large blade (center of right stage)
  const bladeBoxX = stageX;
  const bladeBoxY = 80;
  const bladeBoxW = stageW - 220;
  const bladeBoxH = 560;

  roundRect(ctx, bladeBoxX, bladeBoxY, bladeBoxW, bladeBoxH, 24);
  ctx.fillStyle = '#12161e';
  ctx.fill();

  const bladeSrc = primarySrc(payload.blade);
  if (bladeSrc) {
    try {
      const bladeImg = await loadImage(bladeSrc);
      drawContainKnockoutWhite(
        ctx,
        bladeImg,
        bladeBoxX + 24,
        bladeBoxY + 24,
        bladeBoxW - 48,
        bladeBoxH - 48,
      );
    } catch {
      // skip
    }
  }

  // Rubber tiles stacked (forehand / backhand) — like reference
  const rubberSize = 190;
  const rubberX = bladeBoxX + bladeBoxW + 18;
  await drawRubberTile(ctx, 'Forehand', payload.fh, rubberX, bladeBoxY + 40, rubberSize);
  await drawRubberTile(ctx, 'Backhand', payload.bh, rubberX, bladeBoxY + 40 + rubberSize + 24, rubberSize);

  // Equipment list
  const listY = 700;
  const handle = payload.bladeHandle ? ` · ${payload.bladeHandle}` : '';
  const lines: Array<{ label: string; value: string }> = [
    { label: 'Blade', value: `${payload.blade.name}${handle}` },
    { label: 'Forehand', value: payload.fh.name },
    { label: 'Backhand', value: payload.bh.name },
  ];

  let ly = listY;
  for (const line of lines) {
    ctx.fillStyle = '#2dd4bf';
    ctx.beginPath();
    ctx.arc(stageX + 8, ly - 6, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.fillText(line.label.toUpperCase(), stageX + 28, ly);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = '600 28px system-ui, sans-serif';
    ctx.fillText(truncate(ctx, line.value, stageW - 40), stageX + 28, ly + 34);
    ly += 72;
  }

  // Footer mark
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 16px system-ui, sans-serif';
  ctx.fillText('ttsetupbuilder', width - 200, height - 28);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('No se pudo generar la imagen'));
      else resolve(blob);
    }, 'image/png');
  });
}

/** Prefer two-line name when it looks like "Fan Zhendong". */
function splitName(name: string): string[] {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return [parts[0]!, parts.slice(1).join(' ')];
  }
  return [name];
}

export async function downloadSetupShareImage(payload: SetupSharePayload): Promise<void> {
  const blob = await exportSetupShareImage(payload);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const slug = (payload.playerName.trim() || 'setup')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  anchor.href = url;
  anchor.download = `ttsetup-${slug || 'setup'}.png`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function shareSetupShareImage(
  payload: SetupSharePayload,
): Promise<'shared' | 'downloaded'> {
  const blob = await exportSetupShareImage(payload);
  const file = new File([blob], 'ttsetup-share.png', { type: 'image/png' });

  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare?.({ files: [file] })
  ) {
    await navigator.share({
      title: payload.playerName.trim() || 'Mi setup',
      text: `${payload.blade.name} · ${payload.fh.name} · ${payload.bh.name}`,
      files: [file],
    });
    return 'shared';
  }

  await downloadSetupShareImage(payload);
  return 'downloaded';
}
