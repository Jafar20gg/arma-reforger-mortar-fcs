import { describe, it, expect } from 'vitest';
import { SUPPORTED_MAPS } from '../data/maps';
import { CoordinateService } from '../utils/coordinates';

describe('Map Calibration Control Points', () => {
  it('validates Everon vanilla landmarks against expected grid coordinates and tile transformation', () => {
    const everon = SUPPORTED_MAPS.everon;
    expect(everon).toBeDefined();
    expect(everon.isCalibrated).toBe(true);
    expect(everon.tilesAvailable).toBe(true);

    everon.calibrationPoints.forEach((cp) => {
      const gridCalculated = CoordinateService.worldToGrid(cp.world, 6);
      expect(gridCalculated).toBe(cp.grid);

      // Verify tile coordinate round-trip
      const latlng = CoordinateService.worldToLatLng(cp.world, everon);
      const recovered = CoordinateService.latLngToWorld(latlng, everon);
      expect(recovered.x).toBeCloseTo(cp.world.x, 1);
      expect(recovered.y).toBeCloseTo(cp.world.y, 1);
    });
  });

  it('validates Arland vanilla landmarks against expected grid coordinates and tile transformation', () => {
    const arland = SUPPORTED_MAPS.arland;
    expect(arland).toBeDefined();
    expect(arland.isCalibrated).toBe(true);
    expect(arland.tilesAvailable).toBe(true);

    arland.calibrationPoints.forEach((cp) => {
      const gridCalculated = CoordinateService.worldToGrid(cp.world, 6);
      expect(gridCalculated).toBe(cp.grid);

      // Verify tile coordinate round-trip
      const latlng = CoordinateService.worldToLatLng(cp.world, arland);
      const recovered = CoordinateService.latLngToWorld(latlng, arland);
      expect(recovered.x).toBeCloseTo(cp.world.x, 1);
      expect(recovered.y).toBeCloseTo(cp.world.y, 1);
    });
  });

  it('honestly reports Kolguyev missing tile status and diagnostic notice', () => {
    const kolguyev = SUPPORTED_MAPS.kolguyev;
    expect(kolguyev).toBeDefined();
    expect(kolguyev.isCalibrated).toBe(false);
    expect(kolguyev.tilesAvailable).toBe(false);
    expect(kolguyev.diagnosticNotice).toContain('404');
  });
});
