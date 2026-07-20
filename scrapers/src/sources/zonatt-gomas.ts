import { getSourceConfig } from '../config/sources.js';
import {
  createZonattCatalogSource,
  ZONATT_GOMAS_EXTRA_URLS,
  ZONATT_GOMAS_KIND,
} from './createZonattCatalogSource.js';

const config = getSourceConfig('zonatt-gomas');
if (!config) {
  throw new Error('Missing source config: zonatt-gomas');
}

export const zonattGomas = createZonattCatalogSource({
  config,
  kind: ZONATT_GOMAS_KIND,
  extraProductUrls: ZONATT_GOMAS_EXTRA_URLS,
});

export { zonattGomas as source };
