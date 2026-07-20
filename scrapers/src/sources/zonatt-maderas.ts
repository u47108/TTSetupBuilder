import { getSourceConfig } from '../config/sources.js';
import {
  createZonattCatalogSource,
  ZONATT_MADERAS_EXTRA_URLS,
  ZONATT_MADERAS_KIND,
} from './createZonattCatalogSource.js';

const config = getSourceConfig('zonatt-maderas');
if (!config) {
  throw new Error('Missing source config: zonatt-maderas');
}

export const zonattMaderas = createZonattCatalogSource({
  config,
  kind: ZONATT_MADERAS_KIND,
  extraProductUrls: ZONATT_MADERAS_EXTRA_URLS,
});

export { zonattMaderas as source };
