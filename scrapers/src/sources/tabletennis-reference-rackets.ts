import { getSourceConfig } from '../config/sources.js';
import { createTabletennisReferencePdpSeedSource } from './createTabletennisReferencePdpSeedSource.js';

const config = getSourceConfig('tabletennis-reference-rackets');
if (!config) {
  throw new Error('Missing source config: tabletennis-reference-rackets');
}

/**
 * Tabletennis Reference rackets/blades — secondary photos + reviews.
 * Live: explicit PDP seeds only. Multi-page /racket crawl stays TODO.
 *
 * Distinct from `tabletennis-reviews` (tabletennis-reviews.com).
 */
export const tabletennisReferenceRackets = createTabletennisReferencePdpSeedSource({
  config,
  kind: 'racket',
  planUrls: [
    {
      url: 'https://tabletennis-reference.com/',
      titleHint: 'Tabletennis Reference — home',
    },
  ],
  seeds: [
    {
      // PDP h2 / schema.org mark [Discontinued] → catalog.discontinued at ingest
      url: 'https://tabletennis-reference.com/racket/detail/226',
      nameHint: 'Butterfly Ai Fukuhara PRO ZLF',
      category: 'blade',
      handleTypes: ['FL', 'ST', 'AN'],
    },
    {
      // Still listed (no [Discontinued]) — contrast seed
      url: 'https://tabletennis-reference.com/racket/detail/858',
      nameHint: 'Butterfly Viscaria',
      category: 'blade',
      handleTypes: ['FL', 'ST', 'CS'],
    },
  ],
  attribution:
    'Tabletennis Reference racket photo/reviews (batch import; ADR-008 owned images only)',
});

export { tabletennisReferenceRackets as source };
