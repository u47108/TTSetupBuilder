/** Raw row from ITTF `Equipment_RacketCoverings/all_list`. */
export type IttfRacketCoveringRow = {
  EquipmentRacketCoveringId: number;
  EquipmentName: string;
  BrandName: string;
  EquipmentCode: string | null;
  ApprovalStatus: boolean | null;
  IsActive: boolean | null;
  ExpiresOn: string | null;
  PimpleType: string | null;
  ImageList: string | null;
  /** Often null in all_list; ColorsList carries sheet + sponge colors. */
  Color?: string | null;
  /** `1` / `0` / `Yes` / `No` / null — OX (no sponge) variant listed. */
  HasOXVersion?: string | null;
  /** Comma-separated colors (top sheet + sponge; API does not split). */
  ColorsList?: string | null;
  EquipmentColorIds?: string | null;
  ITTFApprovalCode?: string | null;
  PledgeSignatory?: boolean | null;
};

export type IttfListPage<T> = {
  rows: T[];
  Count: number;
};

export type IttfSnapshotDocument = {
  version: 1;
  equipmentType: 'racket-coverings';
  fetchedAt: string;
  sourceUrl: string;
  count: number;
  items: IttfRacketCoveringRow[];
};

export type IttfFieldChange = {
  field: string;
  from: unknown;
  to: unknown;
};

export type IttfDiffChange =
  | { kind: 'NEW'; code: string; item: IttfRacketCoveringRow }
  | { kind: 'REMOVED'; code: string; item: IttfRacketCoveringRow }
  | {
      kind: 'CHANGED';
      code: string;
      item: IttfRacketCoveringRow;
      previous: IttfRacketCoveringRow;
      fields: IttfFieldChange[];
    };

export type IttfDiffReport = {
  version: 1;
  comparedAt: string;
  previousDate: string | null;
  currentDate: string;
  summary: {
    previousCount: number;
    currentCount: number;
    new: number;
    removed: number;
    changed: number;
  };
  changes: IttfDiffChange[];
};

export const ITTF_API_BASE = 'https://ittf-admin-api.azurewebsites.net';

export const ITTF_ENDPOINTS = {
  racketCoveringsAllList: `${ITTF_API_BASE}/api/Equipment_RacketCoverings/all_list`,
  racketCoveringsDownload: `${ITTF_API_BASE}/api/Download/Equipment_RacketCoverings`,
  ballsAllList: `${ITTF_API_BASE}/api/Equipment_Balls/all_list`,
  tablesAllList: `${ITTF_API_BASE}/api/Equipment_Tables/all_list`,
  netsAllList: `${ITTF_API_BASE}/api/Equipment_Nets/all_list`,
  floorsAllList: `${ITTF_API_BASE}/api/Equipment_Floors/all_list`,
  equipmentTypes: `${ITTF_API_BASE}/api/EquipmentTypes/all_list`,
  swagger: `${ITTF_API_BASE}/swagger/docs/v1`,
} as const;

/** Fields watched by the nightly diff (keyed by EquipmentCode). */
export const ITTF_DIFF_FIELDS = [
  'EquipmentName',
  'BrandName',
  'ApprovalStatus',
  'IsActive',
  'ExpiresOn',
  'ImageList',
  'PimpleType',
  'ColorsList',
  'HasOXVersion',
] as const satisfies readonly (keyof IttfRacketCoveringRow)[];
