import { FCSSettings } from '../types/settings';
import { TargetInstance } from '../types/target';
import { MortarInstance } from '../types/mortar';

export interface SavedMission {
  id: string;
  name: string;
  savedAt: string;
  mapId: string;
  mortars: MortarInstance[];
  targets: TargetInstance[];
  settings?: Partial<FCSSettings>;
  notes?: string;
}

const SETTINGS_KEY = 'arma_reforger_mortar_fcs_settings_v2';
const MAP_KEY = 'arma_reforger_mortar_fcs_map_v2';
const MISSIONS_KEY = 'arma_reforger_mortar_fcs_missions_v2';

export const DEFAULT_SETTINGS: FCSSettings = {
  language: 'en',
  uiScale: 1.0,
  highContrast: false,
  
  activeLayer: 'topo',
  showGridMajor: true,
  showGridMinor: true,
  showCompassRose: true,
  showMapLabels: true,
  showArabicLandmarks: false,
  showDistanceLine: true,
  showRangeRings: true,
  showTargetOverlay: true,
  showMortarOverlay: true,
  showWindArrow: true,
  showElevationContours: true,
  
  customRangeRings: [
    { distance: 250, enabled: true, color: '#38bdf8', label: '250m' },
    { distance: 500, enabled: true, color: '#38bdf8', label: '500m' },
    { distance: 1000, enabled: true, color: '#f59e0b', label: '1km' },
    { distance: 1500, enabled: true, color: '#f59e0b', label: '1.5km' },
    { distance: 2000, enabled: true, color: '#f97316', label: '2km' },
    { distance: 3000, enabled: true, color: '#ef4444', label: '3km' },
  ],
  
  autoSelectRing: true,
  lockRing: false,
  preferredMilFormat: 'mil_deg',
  
  windSpeed: 0,
  windDirectionDeg: 0,
  windConvention: 'FROM',
  windEnabled: false,
  
  isSolutionPanelOpen: false,
  isBallisticTableOpen: false,
  isTargetManagerOpen: false,
  isWindModalOpen: false,
  isSettingsOpen: false,
  isLayersMenuOpen: false,
};

export class StorageService {
  static loadSettings(): FCSSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // LocalStorage unavailable or error
    }
    return { ...DEFAULT_SETTINGS };
  }

  static saveSettings(settings: FCSSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  static loadActiveMapId(fallback: string = 'everon'): string {
    try {
      const stored = localStorage.getItem(MAP_KEY);
      if (stored) return stored;
    } catch {
      // ignore
    }
    return fallback;
  }

  static saveActiveMapId(mapId: string): void {
    try {
      localStorage.setItem(MAP_KEY, mapId);
    } catch {
      // ignore
    }
  }

  static loadMissions(): SavedMission[] {
    try {
      const stored = localStorage.getItem(MISSIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }

  static saveMission(mission: SavedMission): void {
    try {
      const missions = this.loadMissions().filter((m) => m.id !== mission.id);
      missions.unshift(mission);
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
    } catch {
      // ignore
    }
  }

  static deleteMission(missionId: string): void {
    try {
      const missions = this.loadMissions().filter((m) => m.id !== missionId);
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
    } catch {
      // ignore
    }
  }

  static exportMissionToFile(mission: SavedMission): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mission, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mortar_mission_${mission.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
