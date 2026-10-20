import { MapDefinition } from '../../types/map';

export const EVERON_MAP: MapDefinition = {
  id: 'everon',
  name: 'Everon (Republic of Everon)',
  nameAr: 'جزيرة إيفرون (Everon)',
  width: 12800,
  height: 12800,
  bounds: {
    minX: 0,
    minY: 0,
    maxX: 12800,
    maxY: 12800,
  },
  gridSizeMajor: 1000,
  gridSizeMinor: 100,
  source: 'Arma Reforger Vanilla Terrain Dataset (12.8km x 12.8km)',
  isCalibrated: true,
  tilesAvailable: true,
  tileConfig: {
    tileUrl: 'https://arma-mortar.com/map/everon/{z}/{x}/{y}.png',
    satelliteTileUrl: 'https://arma-mortar.com/map/everon_sat/{z}/{x}/{y}.png',
    fallbackTileUrl: '/api/tiles/everon/{z}/{x}/{y}.png',
    fallbackSatelliteTileUrl: '/api/tiles/everon_sat/{z}/{x}/{y}.png',
    minZoom: 0,
    maxZoom: 6,
    tileSize: 256,
    tileBounds: [[0, 0], [256, 256]],
    lngCof: 51.2,
    lngOffset: 4.87,
    latCof: -51.2,
    latOffset: -256,
  },
  calibrationPoints: [
    {
      name: 'Montignac Center',
      world: { x: 5850, y: 7200, z: 85 },
      grid: '058 072',
    },
    {
      name: 'Saint-Philippe Cathedral',
      world: { x: 4200, y: 3800, z: 25 },
      grid: '042 038',
    },
    {
      name: 'Everon Main Airfield Runway 09',
      world: { x: 7400, y: 8800, z: 42 },
      grid: '074 088',
    },
    {
      name: 'Le Moule Harbor',
      world: { x: 3100, y: 5500, z: 5 },
      grid: '031 055',
    },
    {
      name: 'Morton Town Square',
      world: { x: 4900, y: 6100, z: 60 },
      grid: '049 061',
    },
    {
      name: 'Provins Military Checkpoint',
      world: { x: 6800, y: 6400, z: 110 },
      grid: '068 064',
    },
  ],
  defaultMortarPos: {
    x: 5200,
    y: 6800,
    z: 92,
  },
  defaultTargetPos: {
    x: 6400,
    y: 7600,
    z: 115,
  },
  landmarks: [
    { id: 'ev_montignac', name: 'Montignac', nameAr: 'مونتينياك', x: 5850, y: 7200, type: 'city', elevation: 85 },
    { id: 'ev_st_philippe', name: 'Saint-Philippe', nameAr: 'سان فيليب', x: 4200, y: 3800, type: 'city', elevation: 25 },
    { id: 'ev_moule', name: 'Le Moule', nameAr: 'لو مول', x: 3100, y: 5500, type: 'town', elevation: 5 },
    { id: 'ev_morton', name: 'Morton', nameAr: 'مورتون', x: 4900, y: 6100, type: 'town', elevation: 60 },
    { id: 'ev_provins', name: 'Provins', nameAr: 'بروفين', x: 6800, y: 6400, type: 'town', elevation: 110 },
    { id: 'ev_lamentin', name: 'Lamentin', nameAr: 'لامنتان', x: 7900, y: 5100, type: 'town', elevation: 45 },
    { id: 'ev_meaux', name: 'Meaux', nameAr: 'مو', x: 6100, y: 4600, type: 'town', elevation: 70 },
    { id: 'ev_tyrone', name: 'Tyrone', nameAr: 'تايرون', x: 8400, y: 7100, type: 'town', elevation: 55 },
    { id: 'ev_arleville', name: 'Arleville', nameAr: 'أرليفيل', x: 3800, y: 7600, type: 'village', elevation: 120 },
    { id: 'ev_entre_deux', name: 'Entre-Deux', nameAr: 'أونتر-دو', x: 5100, y: 8400, type: 'village', elevation: 95 },
    { id: 'ev_chotain', name: 'Chotain', nameAr: 'شوتان', x: 4500, y: 9200, type: 'village', elevation: 40 },
    { id: 'ev_gravette', name: 'Gravette', nameAr: 'غرافيت', x: 6600, y: 9500, type: 'village', elevation: 30 },
    { id: 'ev_durras', name: 'Durras', nameAr: 'دوراس', x: 2600, y: 4200, type: 'village', elevation: 15 },
    { id: 'ev_regina', name: 'Regina', nameAr: 'ريجينا', x: 7200, y: 3900, type: 'village', elevation: 50 },
    { id: 'ev_airfield', name: 'Everon Main Airfield', nameAr: 'مطار إيفرون الرئيسي', x: 7400, y: 8800, type: 'airfield', elevation: 42 },
    { id: 'ev_base_north', name: 'FOB Morton', nameAr: 'قاعدة مورتون المتقدمة', x: 5200, y: 6800, type: 'military', elevation: 92 },
    { id: 'ev_base_airfield', name: 'Airfield Military Garrison', nameAr: 'حامية المطار العسكرية', x: 7900, y: 9100, type: 'military', elevation: 40 },
    { id: 'ev_radar_hill', name: 'Hill 188 Radar Station', nameAr: 'محطة رادار التل 188', x: 6200, y: 8100, type: 'military', elevation: 188 },
    { id: 'ev_hill_pic', name: 'Pic de l\'Aurore (El. 248m)', nameAr: 'قمة الفجر (248م)', x: 5500, y: 5300, type: 'hill', elevation: 248 },
  ],
  terrainFeatures: [
    // Everon Island perimeter coastlines
    {
      type: 'water',
      points: [
        [1500, 2000], [2200, 1600], [3800, 1500], [5500, 1800], [7000, 2200],
        [8800, 3000], [9800, 4200], [10200, 6000], [10000, 8000], [9200, 9600],
        [8000, 10800], [6500, 11400], [5000, 11500], [3500, 10800], [2400, 9600],
        [1600, 8000], [1400, 6000], [1800, 4200], [1500, 2000]
      ],
    },
    // Major Highway Loop
    {
      type: 'road',
      points: [
        [4200, 3800], [4900, 6100], [5850, 7200], [7400, 8800],
        [8400, 7100], [7900, 5100], [6100, 4600], [4200, 3800]
      ],
      label: 'Route Nationale 1',
    },
    // Le Moule - Montignac connection
    {
      type: 'road',
      points: [
        [3100, 5500], [4100, 5800], [4900, 6100], [5850, 7200]
      ],
      label: 'Route Côtière Ouest',
    },
    // Airfield Runway
    {
      type: 'runway',
      points: [
        [7100, 8600], [7700, 9000]
      ],
      label: 'Runway 09/27',
    },
    // Topo Contour Lines (100m, 150m, 200m)
    {
      type: 'contour',
      level: 100,
      points: [
        [4800, 4800], [5400, 4700], [6200, 5100], [6400, 5800],
        [5800, 6200], [5100, 5900], [4600, 5300], [4800, 4800]
      ],
    },
    {
      type: 'contour',
      level: 150,
      points: [
        [5100, 5000], [5600, 4900], [6000, 5300], [5900, 5600],
        [5400, 5500], [5000, 5200], [5100, 5000]
      ],
    },
    {
      type: 'contour',
      level: 200,
      points: [
        [5300, 5150], [5600, 5100], [5750, 5350], [5500, 5450], [5300, 5150]
      ],
    },
    // Northern Ridge Contour 100m
    {
      type: 'contour',
      level: 100,
      points: [
        [3600, 7400], [4300, 7800], [5400, 8100], [6300, 8300],
        [6900, 8000], [6100, 7600], [4800, 7200], [3600, 7400]
      ],
    },
  ],
};
