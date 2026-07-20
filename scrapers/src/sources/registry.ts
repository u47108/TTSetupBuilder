import { getSourceConfig } from '../config/sources.js';
import { createListingStub } from './createListingStub.js';
import { clRubberSeeds } from './cl-rubber-seeds.js';
import { dandoyBlades } from './dandoy-blades.js';
import { dandoyRubbers } from './dandoy-rubbers.js';
import { tabletennisReferenceRackets } from './tabletennis-reference-rackets.js';
import { tabletennisReferenceRubbers } from './tabletennis-reference-rubbers.js';
import { VPSPORT_MODULES } from './vpsport.js';
import { zonattGomas } from './zonatt-gomas.js';
import { zonattMaderas } from './zonatt-maderas.js';
import type { SourceModule } from './types.js';

function requireConfig(id: string) {
  const config = getSourceConfig(id);
  if (!config) {
    throw new Error(`Missing source config: ${id}`);
  }
  return config;
}

export const tt11BladesPenholder = createListingStub(requireConfig('tt11-blades-penholder'));
export const tt11Blades = createListingStub(requireConfig('tt11-blades'));
export const tt11Rubbers = createListingStub(requireConfig('tt11-rubbers'));
export const tabletennisReviews = createListingStub(requireConfig('tabletennis-reviews'));
export const ttgearlabDatabase = createListingStub(requireConfig('ttgearlab-database'));
export const ittfEquipmentApproval = createListingStub(requireConfig('ittf-equipment-approval'));
export const ittfRacketCoverings = createListingStub(requireConfig('ittf-racket-coverings'));
export const ttSpinRubbers = createListingStub(requireConfig('tt-spin-rubbers'));
export const prottRubbers = createListingStub(requireConfig('prott-rubbers'));
export const prottBlades = createListingStub(requireConfig('prott-blades'));
export {
  clRubberSeeds,
  dandoyBlades,
  dandoyRubbers,
  tabletennisReferenceRackets,
  tabletennisReferenceRubbers,
  zonattGomas,
  zonattMaderas,
};
export * from './vpsport.js';

const MODULES: readonly SourceModule[] = [
  tt11BladesPenholder,
  tt11Blades,
  tt11Rubbers,
  tabletennisReviews,
  tabletennisReferenceRubbers,
  tabletennisReferenceRackets,
  ttgearlabDatabase,
  ittfEquipmentApproval,
  ittfRacketCoverings,
  ttSpinRubbers,
  prottRubbers,
  prottBlades,
  dandoyBlades,
  dandoyRubbers,
  ...VPSPORT_MODULES,
  zonattMaderas,
  zonattGomas,
  clRubberSeeds,
];

export function getSourceModule(id: string): SourceModule | undefined {
  return MODULES.find((module) => module.config.id === id);
}

export function listSourceModules(): readonly SourceModule[] {
  return MODULES;
}
