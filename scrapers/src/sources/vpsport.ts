import { getSourceConfig } from '../config/sources.js';
import { createVpsportJumpsellerSource } from './createVpsportJumpsellerSource.js';
import type { ProductCategory } from '@ttsetupbuilder/types';
import type { SourceModule } from './types.js';

function requireVpsport(id: string, category: ProductCategory): SourceModule {
  const config = getSourceConfig(id);
  if (!config) {
    throw new Error(`Missing source config: ${id}`);
  }
  return createVpsportJumpsellerSource({ config, category });
}

export const vpsportGomasLisas = requireVpsport('vpsport-gomas-lisas', 'rubber');
export const vpsportMaderosClasicos = requireVpsport('vpsport-maderos-clasicos', 'blade');
export const vpsportMaderosJapones = requireVpsport('vpsport-maderos-japones', 'blade');
export const vpsportMaderosLapiceros = requireVpsport('vpsport-maderos-lapiceros', 'blade');
export const vpsportPorosCortos = requireVpsport('vpsport-poros-cortos', 'rubber');
export const vpsportPorosLargos = requireVpsport('vpsport-poros-largos', 'rubber');
export const vpsportGomasAntiTopspin = requireVpsport('vpsport-gomas-anti-topspin', 'rubber');

export const VPSPORT_MODULES: readonly SourceModule[] = [
  vpsportGomasLisas,
  vpsportMaderosClasicos,
  vpsportMaderosJapones,
  vpsportMaderosLapiceros,
  vpsportPorosCortos,
  vpsportPorosLargos,
  vpsportGomasAntiTopspin,
];
