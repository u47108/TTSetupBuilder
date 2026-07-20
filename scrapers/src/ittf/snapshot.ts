import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { writeJsonFile } from '../pipeline/writeJson.js';
import {
  ITTF_DIFF_FIELDS,
  type IttfDiffChange,
  type IttfDiffReport,
  type IttfRacketCoveringRow,
  type IttfSnapshotDocument,
} from './types.js';

export function snapshotsDir(packageRoot: string): string {
  return path.join(packageRoot, 'data', 'ittf', 'snapshots');
}

export function reportsDir(packageRoot: string): string {
  return path.join(packageRoot, 'data', 'ittf', 'reports');
}

export function snapshotPathForDate(packageRoot: string, date: string): string {
  return path.join(snapshotsDir(packageRoot), `${date}.json`);
}

/** Calendar date YYYY-MM-DD in local timezone (for nightly filenames). */
export function localSnapshotDate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function stableKey(row: IttfRacketCoveringRow): string {
  const code = normalizeEquipmentCode(row.EquipmentCode);
  if (code) return `code:${code}`;
  return `id:${row.EquipmentRacketCoveringId}`;
}

export function normalizeEquipmentCode(code: string | null | undefined): string | null {
  if (code == null) return null;
  const trimmed = code.trim();
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'null') return null;
  return trimmed;
}

export async function saveSnapshot(
  packageRoot: string,
  snapshot: IttfSnapshotDocument,
  date = localSnapshotDate(),
): Promise<string> {
  const filePath = snapshotPathForDate(packageRoot, date);
  await writeJsonFile(filePath, snapshot);
  return filePath;
}

export async function loadSnapshot(
  packageRoot: string,
  date: string,
): Promise<IttfSnapshotDocument | null> {
  try {
    const raw = await readFile(snapshotPathForDate(packageRoot, date), 'utf8');
    return JSON.parse(raw) as IttfSnapshotDocument;
  } catch {
    return null;
  }
}

export async function listSnapshotDates(packageRoot: string): Promise<string[]> {
  try {
    const entries = await readdir(snapshotsDir(packageRoot));
    return entries
      .filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name))
      .map((name) => name.replace(/\.json$/, ''))
      .sort();
  } catch {
    return [];
  }
}

export async function findPreviousSnapshotDate(
  packageRoot: string,
  currentDate: string,
): Promise<string | null> {
  const dates = await listSnapshotDates(packageRoot);
  const earlier = dates.filter((date) => date < currentDate);
  return earlier.at(-1) ?? null;
}

function indexByKey(items: IttfRacketCoveringRow[]): Map<string, IttfRacketCoveringRow> {
  const map = new Map<string, IttfRacketCoveringRow>();
  for (const item of items) {
    map.set(stableKey(item), item);
  }
  return map;
}

export function diffSnapshots(
  previous: IttfSnapshotDocument | null,
  current: IttfSnapshotDocument,
  currentDate: string,
  previousDate: string | null,
): IttfDiffReport {
  const prevMap = indexByKey(previous?.items ?? []);
  const currMap = indexByKey(current.items);
  const changes: IttfDiffChange[] = [];

  for (const [key, item] of currMap) {
    const before = prevMap.get(key);
    if (!before) {
      changes.push({ kind: 'NEW', code: key, item });
      continue;
    }
    const fields = ITTF_DIFF_FIELDS.flatMap((field) => {
      const from = before[field] ?? null;
      const to = item[field] ?? null;
      if (String(from) === String(to)) return [];
      return [{ field, from, to }];
    });
    if (fields.length > 0) {
      changes.push({ kind: 'CHANGED', code: key, item, previous: before, fields });
    }
  }

  for (const [key, item] of prevMap) {
    if (!currMap.has(key)) {
      changes.push({ kind: 'REMOVED', code: key, item });
    }
  }

  const newCount = changes.filter((c) => c.kind === 'NEW').length;
  const removedCount = changes.filter((c) => c.kind === 'REMOVED').length;
  const changedCount = changes.filter((c) => c.kind === 'CHANGED').length;

  return {
    version: 1,
    comparedAt: new Date().toISOString(),
    previousDate,
    currentDate,
    summary: {
      previousCount: previous?.count ?? 0,
      currentCount: current.count,
      new: newCount,
      removed: removedCount,
      changed: changedCount,
    },
    changes,
  };
}

export async function writeDiffReport(
  packageRoot: string,
  report: IttfDiffReport,
  currentDate: string,
): Promise<string> {
  const filePath = path.join(reportsDir(packageRoot), `${currentDate}-diff.json`);
  await writeJsonFile(filePath, report);
  return filePath;
}

export function formatDiffSummary(report: IttfDiffReport): string {
  const lines = [
    `ITTF racket-coverings diff ${report.previousDate ?? '(none)'} → ${report.currentDate}`,
    `  previous=${report.summary.previousCount} current=${report.summary.currentCount}`,
    `  NEW=${report.summary.new} REMOVED=${report.summary.removed} CHANGED=${report.summary.changed}`,
  ];
  const sample = report.changes.slice(0, 12);
  for (const change of sample) {
    if (change.kind === 'NEW') {
      lines.push(
        `  + NEW ${change.item.BrandName} ${change.item.EquipmentName} [${change.item.EquipmentCode ?? '-'}]`,
      );
    } else if (change.kind === 'REMOVED') {
      lines.push(
        `  - REMOVED ${change.item.BrandName} ${change.item.EquipmentName} [${change.item.EquipmentCode ?? '-'}]`,
      );
    } else {
      const fields = change.fields.map((f) => f.field).join(',');
      lines.push(
        `  ~ CHANGED ${change.item.BrandName} ${change.item.EquipmentName} (${fields})`,
      );
    }
  }
  if (report.changes.length > sample.length) {
    lines.push(`  … ${report.changes.length - sample.length} more`);
  }
  return lines.join('\n');
}
