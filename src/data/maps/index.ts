import { MapDefinition } from '../../types/map';
import { EVERON_MAP } from './everon';
import { ARLAND_MAP } from './arland';
import { KOLGUYEV_MAP } from './kolguyev';

export const SUPPORTED_MAPS: Record<string, MapDefinition> = {
  everon: EVERON_MAP,
  arland: ARLAND_MAP,
  kolguyev: KOLGUYEV_MAP,
};

export const DEFAULT_MAP_ID = 'everon';

export function getMapDefinition(id: string): MapDefinition {
  return SUPPORTED_MAPS[id] || EVERON_MAP;
}
