import { MortarId, MortarSystemDefinition } from '../../types/mortar';
import { AmmoBallisticTable } from '../../types/ballistics';
import { M252_SYSTEM, M252_BALLISTICS } from './m252';
import { RUSSIAN_2B14_SYSTEM, RUSSIAN_2B14_BALLISTICS } from './2b14';

export const MORTAR_SYSTEMS: Record<MortarId, MortarSystemDefinition> = {
  m252_81mm: M252_SYSTEM,
  '2b14_82mm': RUSSIAN_2B14_SYSTEM,
};

export const ALL_BALLISTIC_TABLES: Record<string, AmmoBallisticTable> = {
  ...M252_BALLISTICS,
  ...RUSSIAN_2B14_BALLISTICS,
};

export function getMortarSystem(id: MortarId): MortarSystemDefinition {
  return MORTAR_SYSTEMS[id] || M252_SYSTEM;
}

export function getAmmoBallisticTable(ammoId: string): AmmoBallisticTable | undefined {
  return ALL_BALLISTIC_TABLES[ammoId];
}
