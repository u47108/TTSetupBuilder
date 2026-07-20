import { getSourceConfig } from '../config/sources.js';
import { createZonattMaderasSource } from './createZonattMaderasSource.js';

const config = getSourceConfig('zonatt-maderas');
if (!config) {
  throw new Error('Missing source config: zonatt-maderas');
}

export const zonattMaderas = createZonattMaderasSource({ config });

export { zonattMaderas as source };
