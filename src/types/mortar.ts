import { WorldCoordinate } from './map';

export type MortarId = 'm252_81mm' | '2b14_82mm';

export interface MortarSystemDefinition {
  id: MortarId;
  name: string;
  nameAr: string;
  caliber: string;
  country: string;
  milCircle: 6400 | 6000; // 6400 for US M252, 6000 for Russian 2B14
  minElevationMil: number;
  maxElevationMil: number;
  minElevationDeg: number;
  maxElevationDeg: number;
  ammoTypes: AmmoTypeDefinition[];
}

export interface AmmoTypeDefinition {
  id: string;
  name: string;
  nameAr: string;
  type: 'HE' | 'Smoke' | 'Illumination' | 'Practice';
  charges: number[];
  verificationStatus: 'verified' | 'provisional' | 'unsupported';
  dataSource: string;
  gameVersion: string;
}

export interface MortarInstance {
  id: string;
  name: string;
  systemId: MortarId;
  selectedAmmoId: string;
  selectedCharge: number; // -1 for auto
  autoCharge: boolean;
  position: WorldCoordinate;
  locked: boolean;
  color: string;
}
