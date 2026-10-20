export interface BallisticEntry {
  range: number; // horizontal range in meters
  elevationMil: number; // mortar tube elevation in mils
  elevationDeg: number; // mortar tube elevation in degrees
  timeOfFlight: number; // seconds
  heightCorrectionMilPer100m?: number; // delta elevation mil per 100m target elevation diff
  peakAltitude?: number; // meters AGL
  impactAngleDeg?: number; // degrees
  dispersionMeters?: number; // circular error probable / dispersion radius in meters
}

export interface ChargeTable {
  charge: number;
  minRange: number;
  maxRange: number;
  minElevationMil: number;
  maxElevationMil: number;
  entries: BallisticEntry[];
  isVerified: boolean;
}

export interface AmmoBallisticTable {
  mortarId: string;
  ammoId: string;
  ammoName: string;
  charges: { [charge: number]: ChargeTable };
  verificationStatus: 'verified' | 'provisional' | 'unsupported';
  dataSource: string;
  gameVersion: string;
  notes?: string;
}

export type SolutionStatusCode =
  | 'VALID'
  | 'OUT_OF_RANGE'
  | 'ELEVATION_LIMIT_EXCEEDED'
  | 'NO_VERIFIED_DATA'
  | 'INCOMPLETE_TABLE'
  | 'INVALID_COORDINATES'
  | 'IDENTICAL_POSITION';

export interface FiringSolution {
  mortarId: string;
  ammoId: string;
  charge: number;
  isAutoCharge: boolean;
  
  // Geometrical
  horizontalDistance: number; // meters
  slantDistance: number; // meters
  bearingDeg: number; // 0 to 359.9°
  bearingMil: number; // 6400 or 6000 circle mils
  cardinalDirection: string;
  
  // Altitudes
  mortarAltitude: number;
  targetAltitude: number;
  heightDifference: number; // targetAlt - mortarAlt
  
  // Ballistics
  elevationMil: number | null;
  elevationDeg: number | null;
  rawElevationMil?: number;
  heightCorrectionMil?: number;
  timeOfFlight: number | null;
  peakAltitude: number | null;
  impactAngleDeg: number | null;
  dispersionMeters: number | null;
  isInterpolated: boolean;
  
  // Ballistic limits
  maxVerifiedRange?: number;
  minVerifiedRange?: number;

  // Wind adjustments
  windApplied: boolean;
  crosswindDeflectionMil?: number;
  headwindCorrectionMeters?: number;
  
  // Status & Confidence
  statusCode: SolutionStatusCode;
  statusMessage: string;
  statusMessageAr: string;
  verificationStatus: 'verified' | 'provisional' | 'unsupported';
}

export interface WindSettings {
  enabled: boolean;
  speed: number; // m/s
  directionDeg: number; // degrees 0-359
  convention: 'FROM' | 'TOWARD'; // FROM = meteorological convention, TOWARD = ballistic vector
}
