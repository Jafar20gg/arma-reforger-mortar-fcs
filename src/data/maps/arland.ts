import { MapDefinition } from '../../types/map';

export const ARLAND_MAP: MapDefinition = {
  id: 'arland',
  name: 'Arland (Small Island)',
  nameAr: 'جزيرة أرلاند (Arland)',
  width: 4096,
  height: 4096,
  bounds: {
    minX: 0,
    minY: 0,
    maxX: 4096,
    maxY: 4096,
  },
  gridSizeMajor: 1000,
  gridSizeMinor: 100,
  source: 'Arma Reforger Vanilla Terrain Dataset (4.096km x 4.096km)',
  isCalibrated: true,
  tilesAvailable: true,
  tileConfig: {
    tileUrl: 'https://arma-mortar.com/map/arland/{z}/{x}/{y}.png',
    satelliteTileUrl: 'https://arma-mortar.com/map/arland_sat/{z}/{x}/{y}.png',
    fallbackTileUrl: '/api/tiles/arland/{z}/{x}/{y}.png',
    fallbackSatelliteTileUrl: '/api/tiles/arland_sat/{z}/{x}/{y}.png',
    minZoom: 0,
    maxZoom: 5,
    tileSize: 256,
    tileBounds: [[0, 0], [256, 256]],
    lngCof: 18.9,
    lngOffset: -20.8,
    latCof: -18.9,
    latOffset: -237.35,
  },
  calibrationPoints: [
    {
      name: 'Arland Airfield Control Tower',
      world: { x: 2350, y: 2800, z: 12 },
      grid: '023 028',
    },
    {
      name: 'Arland Town Pier',
      world: { x: 1500, y: 1600, z: 2 },
      grid: '015 016',
    },
    {
      name: 'Military Depot Bunker',
      world: { x: 2700, y: 1900, z: 35 },
      grid: '027 019',
    },
    {
      name: 'Beacon Hill Peak',
      world: { x: 2050, y: 1950, z: 88 },
      grid: '020 019',
    },
  ],
  defaultMortarPos: {
    x: 1800,
    y: 2100,
    z: 45,
  },
  defaultTargetPos: {
    x: 2400,
    y: 2600,
    z: 22,
  },
  landmarks: [
    { id: 'ar_airfield', name: 'Arland Airfield', nameAr: 'مطار أرلاند', x: 2350, y: 2800, type: 'airfield', elevation: 12 },
    { id: 'ar_town', name: 'Arland Town', nameAr: 'بلدة أرلاند', x: 1500, y: 1600, type: 'town', elevation: 5 },
    { id: 'ar_depot', name: 'Military Supply Depot', nameAr: 'مستودع الإمداد العسكري', x: 2700, y: 1900, type: 'military', elevation: 35 },
    { id: 'ar_beacon', name: 'Beacon Hill (El. 88m)', nameAr: 'تل المنارة (88م)', x: 2050, y: 1950, type: 'hill', elevation: 88 },
    { id: 'ar_harbor', name: 'Ferry Port', nameAr: 'ميناء العبّارات', x: 1300, y: 1750, type: 'landmark', elevation: 2 },
    { id: 'ar_radio', name: 'Radio Relay Mast', nameAr: 'برج الاتصالات', x: 2200, y: 1500, type: 'military', elevation: 62 },
    { id: 'ar_quarry', name: 'Limestone Quarry', nameAr: 'محجر الحجر الجيري', x: 2900, y: 2300, type: 'landmark', elevation: 40 },
  ],
  terrainFeatures: [
    // Coastline
    {
      type: 'water',
      points: [
        [700, 1200], [1200, 800], [2200, 750], [3200, 1100],
        [3600, 1800], [3500, 2600], [2900, 3400], [2000, 3500],
        [1300, 3000], [800, 2200], [700, 1200]
      ],
    },
    // Main Arland Road
    {
      type: 'road',
      points: [
        [1500, 1600], [1900, 1800], [2200, 2200], [2350, 2800], [2700, 1900]
      ],
      label: 'Main Perimeter Road',
    },
    // Runway
    {
      type: 'runway',
      points: [
        [2100, 2650], [2600, 2950]
      ],
      label: 'Arland Runway 06/24',
    },
    // 50m Contour
    {
      type: 'contour',
      level: 50,
      points: [
        [1800, 1800], [2200, 1700], [2350, 2000], [2000, 2150], [1800, 1800]
      ],
    },
  ],
};
