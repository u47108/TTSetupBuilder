import { getSourceConfig } from '../config/sources.js';
import { createDandoyMagentoSource } from './createDandoyMagentoSource.js';

const config = getSourceConfig('dandoy-blades');
if (!config) {
  throw new Error('Missing source config: dandoy-blades');
}

export const dandoyBlades = createDandoyMagentoSource({
  config,
  category: 'blade',
  idPrefix: 'dandoy-blade',
});

export { dandoyBlades as source };
