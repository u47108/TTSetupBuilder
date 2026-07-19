import { getSourceConfig } from '../config/sources.js';
import { createDandoyMagentoSource } from './createDandoyMagentoSource.js';

const config = getSourceConfig('dandoy-rubbers');
if (!config) {
  throw new Error('Missing source config: dandoy-rubbers');
}

export const dandoyRubbers = createDandoyMagentoSource({
  config,
  category: 'rubber',
  idPrefix: 'dandoy-rubber',
});

export { dandoyRubbers as source };
