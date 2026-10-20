export interface WorldCoordinate {
  x: number; // meters from SW origin (East)
  y: number; // meters from SW origin (North)
  z?: number; // altitude in meters
}

export interface ScreenCoordinate {
  x: number; // screen pixel x
  y: number; // screen pixel y
}

export interface MapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface MapLandmark {
  id: string;
  name: string;
  nameAr?: string;
  x: number;
  y: number;
  type: 'city' | 'town' | 'village' | 'airfield' | 'military' | 'hill' | 'landmark';
  elevation?: number;
}

export interface MapTerrainFeature {
  type: 'water' | 'road' | 'runway' | 'forest' | 'contour';
  points: [number, number][]; // in world coordinates [x, y]
  level?: number; // for contour line height in meters
  label?: string;
}

export interface MapTileConfig {
  tileUrl: string;
  satelliteTileUrl?: string;
  fallbackTileUrl?: string;
  fallbackSatelliteTileUrl?: string;
  minZoom: number;
  maxZoom: number;
  tileSize: number;
  tileBounds: [[number, number], [number, number]]; // Leaflet latLng bounds
  lngCof: number;
  lngOffset: number;
  latCof: number;
  latOffset: number;
}

export interface MapDefinition {
  id: string;
  name: string;
  nameAr: string;
  width: number; // in world meters
  height: number; // in world meters
  bounds: MapBounds;
  gridSizeMajor: number; // e.g. 1000m
  gridSizeMinor: number; // e.g. 100m
  landmarks: MapLandmark[];
  terrainFeatures: MapTerrainFeature[];
  defaultMortarPos: WorldCoordinate;
  defaultTargetPos: WorldCoordinate;
  source: string;
  isCalibrated: boolean;
  tilesAvailable: boolean;
  diagnosticNotice?: string;
  diagnosticNoticeAr?: string;
  tileConfig?: MapTileConfig;
  calibrationPoints: {
    name: string;
    world: WorldCoordinate;
    grid: string;
  }[];
}

export type MapLayerType = 'topo' | 'satellite' | 'night' | 'minimal';
