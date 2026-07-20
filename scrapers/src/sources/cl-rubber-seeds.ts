import { getSourceConfig } from '../config/sources.js';
import { createWooPdpSeedSource } from './createWooPdpSeedSource.js';

const config = getSourceConfig('cl-rubber-seeds');
if (!config) {
  throw new Error('Missing source config: cl-rubber-seeds');
}

/**
 * Operator-requested rubber PDPs from Chilean shops (Bushido, Foxhara).
 * TT11 national blue sponge is Cloudflare-blocked — use ZonaTT / these seeds instead.
 */
export const clRubberSeeds = createWooPdpSeedSource({
  config,
  seeds: [
    {
      url: 'https://www.bushido.cl/producto/dhs-hurricane-3-neo/',
      nameHint: 'DHS Hurricane 3 Neo',
      category: 'rubber',
    },
    {
      url: 'https://foxhara.cl/product/dhs-hurricane-3-neo-soft-esponja-azul-provincial-team/',
      nameHint: 'DHS Hurricane 3 Neo Soft esponja azul Provincial Team',
      category: 'rubber',
    },
  ],
});

export { clRubberSeeds as source };
