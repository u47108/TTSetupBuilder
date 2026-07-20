import { getSourceConfig } from '../config/sources.js';
import { createTabletennisReferencePdpSeedSource } from './createTabletennisReferencePdpSeedSource.js';

const config = getSourceConfig('tabletennis-reference-rubbers');
if (!config) {
  throw new Error('Missing source config: tabletennis-reference-rubbers');
}

/**
 * Tabletennis Reference rubbers — secondary photos + community reviews.
 * Live: explicit PDP seeds only. Multi-page /rubber crawl stays TODO.
 *
 * Distinct from `tabletennis-reviews` (tabletennis-reviews.com).
 */
export const tabletennisReferenceRubbers = createTabletennisReferencePdpSeedSource({
  config,
  kind: 'rubber',
  planUrls: [
    {
      url: 'https://tabletennis-reference.com/',
      titleHint: 'Tabletennis Reference — home',
    },
  ],
  seeds: [
    {
      // Site title “Bruce T1 [Discontinued]”; packaging/ITTF = Blues T1 (21-043).
      // `discontinued` comes from PDP HTML at ingest (not hard-coded).
      url: 'https://tabletennis-reference.com/rubber/detail/439',
      nameHint: 'Donic Blues T1',
      category: 'rubber',
    },
  ],
  attribution:
    'Tabletennis Reference rubber photo/reviews (batch import; ADR-008 owned images only)',
});

export { tabletennisReferenceRubbers as source };
