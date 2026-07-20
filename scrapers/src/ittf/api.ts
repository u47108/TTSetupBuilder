import {
  ITTF_API_BASE,
  ITTF_ENDPOINTS,
  type IttfListPage,
  type IttfRacketCoveringRow,
  type IttfSnapshotDocument,
} from './types.js';

const USER_AGENT = 'TTSetupBuilderResearchBot/0.1 (+offline catalog research; batch only)';

export type FetchPageOptions = {
  limit?: number;
  skip?: number;
  searchtext?: string;
  sortby?: string;
  descending?: boolean;
  rateLimitMs?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ITTF `all_list` requires `custom_filter=[]` (JSON array). Empty / missing
 * throws NullReferenceException on racket coverings; empty sortby breaks OFFSET/FETCH.
 */
export function buildAllListUrl(
  endpoint: string,
  options: FetchPageOptions & { sortby: string },
): string {
  const params = new URLSearchParams({
    limit: String(options.limit ?? 100),
    skip: String(options.skip ?? 0),
    searchtext: options.searchtext ?? '',
    sortby: options.sortby,
    descending: String(options.descending ?? false),
    filterfield: '',
    filtervalue: '',
    custom_filter: '[]',
  });
  return `${endpoint}?${params.toString()}`;
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ITTF API ${response.status} for ${url}: ${body.slice(0, 400)}`);
  }
  return (await response.json()) as T;
}

function unwrapPage<T>(payload: unknown): IttfListPage<T> {
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0] as IttfListPage<T>;
    if (first && Array.isArray(first.rows) && typeof first.Count === 'number') {
      return first;
    }
  }
  if (payload && typeof payload === 'object' && 'rows' in payload) {
    return payload as IttfListPage<T>;
  }
  throw new Error('Unexpected ITTF list payload shape');
}

export async function fetchAllRacketCoverings(options?: {
  pageSize?: number;
  rateLimitMs?: number;
  onProgress?: (fetched: number, total: number) => void;
}): Promise<IttfSnapshotDocument> {
  const pageSize = options?.pageSize ?? 100;
  const rateLimitMs = options?.rateLimitMs ?? 400;
  const sourceUrl = ITTF_ENDPOINTS.racketCoveringsAllList;
  const items: IttfRacketCoveringRow[] = [];
  let skip = 0;
  let total = Number.POSITIVE_INFINITY;

  while (items.length < total) {
    const url = buildAllListUrl(sourceUrl, {
      limit: pageSize,
      skip,
      sortby: 'BrandName',
      descending: false,
    });
    const page = unwrapPage<IttfRacketCoveringRow>(await fetchJson(url));
    total = page.Count;
    items.push(...page.rows);
    options?.onProgress?.(items.length, total);
    if (page.rows.length === 0) break;
    skip += page.rows.length;
    if (items.length < total && rateLimitMs > 0) await sleep(rateLimitMs);
  }

  return {
    version: 1,
    equipmentType: 'racket-coverings',
    fetchedAt: new Date().toISOString(),
    sourceUrl: `${ITTF_API_BASE}/api/Equipment_RacketCoverings/all_list`,
    count: items.length,
    items,
  };
}
