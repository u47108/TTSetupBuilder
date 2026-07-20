import type { CatalogProduct, IttfApprovalInfo, IttfApprovalStatus } from '@ttsetupbuilder/types';
import { normalizeEquipmentCode } from './snapshot.js';
import type { IttfRacketCoveringRow as Row, IttfSnapshotDocument } from './types.js';

export { normalizeEquipmentCode } from './snapshot.js';

function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^goma\s+/i, '')
    .replace(/^rubber\s+/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function tokenSet(value: string): Set<string> {
  return new Set(normalizeText(value).split(' ').filter(Boolean));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function brandNameKey(brand: string, name: string): string {
  return `${normalizeText(brand)}||${normalizeText(name)}`;
}

export function deriveApprovalStatus(
  row: Row,
  now = new Date(),
): { status: IttfApprovalStatus; reason: string } {
  const code = normalizeEquipmentCode(row.EquipmentCode);
  if (row.ApprovalStatus === false) {
    return { status: 'not_approved', reason: 'ApprovalStatus=false' };
  }
  if (!code) {
    return { status: 'not_approved', reason: 'missing EquipmentCode' };
  }
  if (row.ExpiresOn) {
    const expires = new Date(row.ExpiresOn);
    if (!Number.isNaN(expires.getTime()) && expires.getTime() < now.getTime()) {
      return { status: 'expired', reason: `ExpiresOn=${row.ExpiresOn}` };
    }
  }
  if (row.IsActive === false) {
    return { status: 'inactive', reason: 'IsActive=false' };
  }
  return { status: 'approved', reason: 'active approved covering' };
}

export type MatchResult = {
  row: Row | null;
  method: NonNullable<IttfApprovalInfo['matchMethod']>;
  score?: number;
};

export function matchCatalogRubber(
  product: CatalogProduct,
  snapshot: IttfSnapshotDocument,
  indexes?: {
    byCode: Map<string, Row>;
    byBrandName: Map<string, Row>;
    rows: Row[];
  },
): MatchResult {
  const byCode = indexes?.byCode ?? buildCodeIndex(snapshot.items);
  const byBrandName = indexes?.byBrandName ?? buildBrandNameIndex(snapshot.items);
  const rows = indexes?.rows ?? snapshot.items;

  const explicitCode =
    normalizeEquipmentCode(product.ittfApproval?.equipmentCode) ??
    normalizeEquipmentCode(
      typeof (product as { equipmentCode?: string }).equipmentCode === 'string'
        ? (product as { equipmentCode?: string }).equipmentCode
        : null,
    );
  if (explicitCode && byCode.has(explicitCode)) {
    return { row: byCode.get(explicitCode)!, method: 'equipmentCode' };
  }

  const brandHint = product.brandId.replace(/-/g, ' ');
  const exactKey = brandNameKey(brandHint, product.name);
  const exact = byBrandName.get(exactKey);
  if (exact) {
    return { row: exact, method: 'brandNameExact' };
  }

  // Also try stripping leading brand from product.name (e.g. "Andro Blowfish")
  const nameNorm = normalizeText(product.name);
  const brandNorm = normalizeText(brandHint);
  if (nameNorm.startsWith(`${brandNorm} `)) {
    const stripped = nameNorm.slice(brandNorm.length).trim();
    const strippedHit = byBrandName.get(`${brandNorm}||${stripped}`);
    if (strippedHit) {
      return { row: strippedHit, method: 'brandNameExact' };
    }
  }

  let best: { row: Row; score: number } | null = null;
  const productTokens = tokenSet(`${brandHint} ${product.name}`);
  for (const row of rows) {
    if (normalizeText(row.BrandName) !== brandNorm && !nameNorm.includes(normalizeText(row.BrandName))) {
      // Prefer same brand; still allow weak cross-brand only if name strongly overlaps
    }
    const rowTokens = tokenSet(`${row.BrandName} ${row.EquipmentName}`);
    const score = jaccard(productTokens, rowTokens);
    const sameBrand = normalizeText(row.BrandName) === brandNorm || nameNorm.startsWith(normalizeText(row.BrandName));
    const adjusted = sameBrand ? score + 0.15 : score;
    if (!best || adjusted > best.score) {
      best = { row, score: adjusted };
    }
  }

  if (best && best.score >= 0.72) {
    return { row: best.row, method: 'brandNameFuzzy', score: best.score };
  }

  return { row: null, method: 'none' };
}

export function buildCodeIndex(rows: Row[]): Map<string, Row> {
  const map = new Map<string, Row>();
  for (const row of rows) {
    const code = normalizeEquipmentCode(row.EquipmentCode);
    if (code) map.set(code, row);
  }
  return map;
}

export function buildBrandNameIndex(rows: Row[]): Map<string, Row> {
  const map = new Map<string, Row>();
  for (const row of rows) {
    map.set(brandNameKey(row.BrandName, row.EquipmentName), row);
  }
  return map;
}

export function annotateRubberProduct(
  product: CatalogProduct,
  snapshot: IttfSnapshotDocument,
  snapshotDate: string,
  indexes?: Parameters<typeof matchCatalogRubber>[2],
): CatalogProduct {
  if (product.category !== 'rubber') {
    return product;
  }

  const checkedAt = new Date().toISOString();
  const match = matchCatalogRubber(product, snapshot, indexes);
  if (!match.row) {
    return {
      ...product,
      ittfApproval: {
        status: 'not_found',
        matchMethod: 'none',
        snapshotDate,
        checkedAt,
        reason: 'no brand+name match in ITTF racket coverings snapshot',
      },
    };
  }

  const derived = deriveApprovalStatus(match.row);
  const code = normalizeEquipmentCode(match.row.EquipmentCode) ?? undefined;

  return {
    ...product,
    ittfApproval: {
      status: derived.status,
      equipmentCode: code,
      matchedName: match.row.EquipmentName,
      matchedBrand: match.row.BrandName,
      matchMethod: match.method,
      snapshotDate,
      checkedAt,
      reason: derived.reason,
    },
  };
}

export function annotateCatalogRubbers(
  products: CatalogProduct[],
  snapshot: IttfSnapshotDocument,
  snapshotDate: string,
): { products: CatalogProduct[]; stats: Record<IttfApprovalStatus, number> } {
  const indexes = {
    byCode: buildCodeIndex(snapshot.items),
    byBrandName: buildBrandNameIndex(snapshot.items),
    rows: snapshot.items,
  };
  const stats: Record<IttfApprovalStatus, number> = {
    approved: 0,
    not_found: 0,
    not_approved: 0,
    expired: 0,
    inactive: 0,
  };

  const next = products.map((product) => {
    if (product.category !== 'rubber') return product;
    const annotated = annotateRubberProduct(product, snapshot, snapshotDate, indexes);
    const status = annotated.ittfApproval?.status;
    if (status) stats[status] += 1;
    return annotated;
  });

  return { products: next, stats };
}

/** Re-export for fixtures / callers. */
export type { IttfRacketCoveringRow } from './types.js';
export type { IttfSnapshotDocument } from './types.js';
