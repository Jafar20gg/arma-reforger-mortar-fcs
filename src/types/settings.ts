import { MapLayerType } from './map';

export type LanguageCode = 'en' | 'ar';

export interface RangeRingConfig {
  distance: number; // in meters
  enabled: boolean;
  color: string;
  label: string;
}

export interface FCSSettings {
  // Display & UI
  language: LanguageCode;
  uiScale: number; // 0.8 to 1.2
  highContrast: boolean;
  
  // Map layers & Overlays
  activeLayer: MapLayerType;
  showGridMajor: boolean;
  showGridMinor: boolean;
  showCompassRose: boolean;
  showMapLabels: boolean;
  showArabicLandmarks: boolean;
  showDistanceLine: boolean;
  showBearingLine: boolean;
  showRangeRings: boolean;
  showMaxRangeRing: boolean;
  showTargetDistanceRing: boolean;
  showCustomRings: boolean;
  showTargetOverlay: boolean;
  showMortarOverlay: boolean;
  showWindArrow: boolean;
  showElevationContours: boolean;
  
  // Range rings setup
  customRangeRings: RangeRingConfig[];
  
  // Ballistics & Controls
  autoSelectRing: boolean;
  lockRing: boolean;
  preferredMilFormat: 'mil_deg' | 'mil_only' | 'deg_only';
  
  // Wind defaults
  windSpeed: number;
  windDirectionDeg: number;
  windConvention: 'FROM' | 'TOWARD';
  windEnabled: boolean;
  
  // Panels
  isSolutionPanelOpen: boolean;
  isBallisticTableOpen: boolean;
  isTargetManagerOpen: boolean;
  isWindModalOpen: boolean;
  isSettingsOpen: boolean;
  isLayersMenuOpen: boolean;
}
