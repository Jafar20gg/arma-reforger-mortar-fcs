import { MapDefinition } from '../../types/map';

export const KOLGUYEV_MAP: MapDefinition = {
  id: 'kolguyev',
  name: 'Kolguyev (Island Complex)',
  nameAr: 'جزيرة كولجويف (Kolguyev)',
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
  source: 'Arma Reforger Vanilla/Reforger Terrain Dataset (12.8km x 12.8km)',
  isCalibrated: false,
  tilesAvailable: false,
  diagnosticNotice: 'Terrain map tiles for Kolguyev are unavailable on vanilla game servers (HTTP 404). Operating in precision tactical vector grid fallback mode.',
  diagnosticNoticeAr: 'الخرائط الطبوغرافية لجزيرة كولجويف غير متوفرة على خادم اللعبة الرسمي (404). يعمل النظام في وضع الشبكة التكتيكية الموثقة.',
  calibrationPoints: [
    {
      name: 'Main Military Airbase',
      world: { x: 7200, y: 7800, z: 32 },
      grid: '072 078',
    },
    {
      name: 'Southern Coastal Base',
      world: { x: 4800, y: 3200, z: 15 },
      grid: '048 032',
    },
    {
      name: 'Volcanic Peak Obsidian (El. 312m)',
      world: { x: 5900, y: 6100, z: 312 },
      grid: '059 061',
    },
  ],
  defaultMortarPos: {
    x: 6200,
    y: 5400,
    z: 140,
  },
  defaultTargetPos: {
    x: 7100,
    y: 6500,
    z: 78,
  },
  landmarks: [
    { id: 'kg_airbase', name: 'Northern Strategic Airbase', nameAr: 'القاعدة الجوية الشمالية', x: 7200, y: 7800, type: 'airfield', elevation: 32 },
    { id: 'kg_south_base', name: 'Southern Coastal Base', nameAr: 'القاعدة الساحلية الجنوبية', x: 4800, y: 3200, type: 'military', elevation: 15 },
    { id: 'kg_peak', name: 'Mount Obsidian (El. 312m)', nameAr: 'جبل أوبسيديان (312م)', x: 5900, y: 6100, type: 'hill', elevation: 312 },
    { id: 'kg_radar', name: 'Radar Complex Zenith', nameAr: 'مجمع رادارات زينيث', x: 6700, y: 6300, type: 'military', elevation: 195 },
    { id: 'kg_harbor', name: 'Naval Sub-Pen Harbor', nameAr: 'المرفأ البحري', x: 4100, y: 4500, type: 'landmark', elevation: 4 },
  ],
  terrainFeatures: [
    // Coastline
    {
      type: 'water',
      points: [
        [2500, 2500], [4200, 1800], [6500, 2200], [8500, 3100],
        [9800, 5200], [9200, 7500], [8000, 9500], [5800, 10200],
        [3800, 9200], [2200, 7000], [2000, 4800], [2500, 2500]
      ],
    },
    // Airbase runway
    {
      type: 'runway',
      points: [
        [6800, 7600], [7600, 8000]
      ],
      label: 'Runway 04/22',
    },
    // Military highway
    {
      type: 'road',
      points: [
        [4800, 3200], [5400, 4800], [6300, 6000], [7200, 7800]
      ],
      label: 'Main Military Transit Axis',
    },
    // Mountain Contour 150m
    {
      type: 'contour',
      level: 150,
      points: [
        [5200, 5600], [6100, 5400], [6700, 6200], [6200, 6800], [5400, 6400], [5200, 5600]
      ],
    },
  ],
};
