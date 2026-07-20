/**
 * Minimal ITTF racket-covering rows for offline fixtures / UI alert demos.
 * Based on equipment.ittf.com Racket Coverings (Prasidha without Approval Code).
 */
import type { CatalogProduct } from '@ttsetupbuilder/types';
import type { IttfRacketCoveringRow, IttfSnapshotDocument } from './types.js';

const NOW = '2026-07-19T23:00:00.000Z';

/** Restricted / no homologation — Approval Code "-" in the SPA. */
export const PRASIDHA_RESTRICTED_FIXTURES: IttfRacketCoveringRow[] = [
  {
    EquipmentRacketCoveringId: 9001,
    EquipmentName: 'Action',
    BrandName: 'Prasidha',
    EquipmentCode: null,
    ApprovalStatus: false,
    IsActive: true,
    ExpiresOn: '2026-12-31T00:00:00',
    PimpleType: 'Out',
    ImageList: null,
  },
  {
    EquipmentRacketCoveringId: 9002,
    EquipmentName: 'Osaka',
    BrandName: 'Prasidha',
    EquipmentCode: null,
    ApprovalStatus: false,
    IsActive: true,
    ExpiresOn: '2026-12-31T00:00:00',
    PimpleType: 'In',
    ImageList: null,
  },
  {
    EquipmentRacketCoveringId: 9003,
    EquipmentName: 'Twister 8338',
    BrandName: 'Prasidha',
    EquipmentCode: null,
    ApprovalStatus: false,
    IsActive: true,
    ExpiresOn: '2026-12-31T00:00:00',
    PimpleType: 'In',
    ImageList: null,
  },
  {
    EquipmentRacketCoveringId: 9004,
    EquipmentName: 'Frankfurt',
    BrandName: 'Prasidha',
    EquipmentCode: null,
    ApprovalStatus: false,
    IsActive: true,
    ExpiresOn: '2026-12-31T00:00:00',
    PimpleType: 'In',
    ImageList: null,
  },
  {
    EquipmentRacketCoveringId: 9005,
    EquipmentName: '830',
    BrandName: 'Prasidha',
    EquipmentCode: null,
    ApprovalStatus: false,
    IsActive: true,
    ExpiresOn: '2026-12-31T00:00:00',
    PimpleType: 'In',
    ImageList: null,
  },
  {
    EquipmentRacketCoveringId: 9006,
    EquipmentName: 'Long-A',
    BrandName: 'Prasidha',
    EquipmentCode: null,
    ApprovalStatus: false,
    IsActive: true,
    ExpiresOn: '2026-12-31T00:00:00',
    PimpleType: 'Long',
    ImageList: null,
    HasOXVersion: 'Yes',
  },
];

/** Contrast: approved coverings with real-looking codes. */
export const APPROVED_CONTRAST_FIXTURES: IttfRacketCoveringRow[] = [
  {
    EquipmentRacketCoveringId: 9101,
    EquipmentName: 'Rasanter R47',
    BrandName: 'Andro',
    EquipmentCode: '03-041',
    ApprovalStatus: true,
    IsActive: true,
    ExpiresOn: '2027-06-30T00:00:00',
    PimpleType: 'In',
    ImageList: null,
  },
  {
    EquipmentRacketCoveringId: 9102,
    EquipmentName: 'Blues T1',
    BrandName: 'Donic',
    EquipmentCode: '21-043',
    ApprovalStatus: true,
    IsActive: true,
    ExpiresOn: '2027-06-30T00:00:00',
    PimpleType: 'In',
    ImageList: null,
  },
  {
    EquipmentRacketCoveringId: 9103,
    EquipmentName: 'Lightning',
    BrandName: 'Tibhar',
    EquipmentCode: '74-045',
    ApprovalStatus: true,
    IsActive: true,
    ExpiresOn: '2027-06-30T00:00:00',
    PimpleType: 'In',
    ImageList: null,
  },
];

export function buildFixtureSnapshot(): IttfSnapshotDocument {
  const items = [...PRASIDHA_RESTRICTED_FIXTURES, ...APPROVED_CONTRAST_FIXTURES];
  return {
    version: 1,
    equipmentType: 'racket-coverings',
    fetchedAt: NOW,
    sourceUrl: 'fixture://ittf-racket-coverings-restricted-demo',
    count: items.length,
    items,
  };
}

function fixtureProduct(
  slug: string,
  name: string,
  brandId: string,
): CatalogProduct {
  return {
    id: `ittf-fixture-${slug}`,
    slug,
    name,
    brandId,
    category: 'rubber',
    description:
      'Fixture seed for ITTF approval UI (not shop inventory). Used to demo not-approved / missing EquipmentCode alerts.',
    images: [],
    imageLocalPaths: [],
    provenance: {
      sourceId: 'ittf-approval-fixtures',
      sourceUrl: 'https://equipment.ittf.com/#/equipment/racket_coverings',
      scrapedAt: NOW,
      attribution: 'ITTF Equipment approval list (fixture seed)',
      license: 'official public list — facts only',
      mediaRights: 'unknown',
    },
  };
}

/** Catalog rubber seeds for visual QA of the dark-UI approval notice. */
export function buildFixtureCatalogProducts(): CatalogProduct[] {
  return [
    fixtureProduct('prasidha-action', 'Prasidha Action', 'prasidha'),
    fixtureProduct('prasidha-osaka', 'Prasidha Osaka', 'prasidha'),
    fixtureProduct('prasidha-twister-8338', 'Prasidha Twister 8338', 'prasidha'),
    fixtureProduct('prasidha-frankfurt', 'Prasidha Frankfurt', 'prasidha'),
    fixtureProduct('prasidha-830', 'Prasidha 830', 'prasidha'),
    fixtureProduct('prasidha-long-a', 'Prasidha Long-A', 'prasidha'),
    fixtureProduct('andro-rasanter-r47-ittf-demo', 'Andro Rasanter R47', 'andro'),
  ];
}
