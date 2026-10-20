import { describe, it, expect } from 'vitest';
import { BallisticSolver } from '../services/ballisticSolver';
import { DistanceService } from '../utils/distance';
import { CoordinateService } from '../utils/coordinates';
import { WorldCoordinate } from '../types/map';
import { WindSettings } from '../types/ballistics';
import { EVERON_MAP } from '../data/maps/everon';

describe('Phase 6: Range Discrepancy (7940m / 4900m) and Range Rings Validation', () => {
  const noWind: WindSettings = { enabled: false, speed: 0, directionDeg: 0, convention: 'FROM' };

  it('proves the mathematical origin of the 7940m distance (mortar at FOB Morton and target at NW corner)', () => {
    // Mortar at FOB Morton on Everon: (5200, 6800)
    const mortarPos: WorldCoordinate = { x: 5200, y: 6800, z: 92 };

    // Target at NW corner of Everon (x: 0, y: 12800)
    const nwCornerTarget: WorldCoordinate = { x: 0, y: 12800, z: 0 };

    const dx = nwCornerTarget.x - mortarPos.x; // -5200
    const dy = nwCornerTarget.y - mortarPos.y; // 6000
    const dist = DistanceService.calculateHorizontalDistance(mortarPos, nwCornerTarget);

    expect(dx).toBe(-5200);
    expect(dy).toBe(6000);
    // sqrt((-5200)^2 + 6000^2) = sqrt(27040000 + 36000000) = sqrt(63040000) = 7939.773 m
    expect(dist).toBeCloseTo(7939.77, 1);
    expect(Math.round(dist)).toBe(7940);
  });

  it('verifies that 7940m is correctly rejected by M252 81mm mortar with max verified range 4900m', () => {
    const mortarPos: WorldCoordinate = { x: 5200, y: 6800, z: 92 };
    const nwCornerTarget: WorldCoordinate = { x: 0, y: 12800, z: 0 };

    const solution = BallisticSolver.solve(
      mortarPos,
      nwCornerTarget,
      'm252_81mm',
      'm821_he',
      -1,
      true,
      noWind
    );

    // Must be out of range
    expect(solution.statusCode).toBe('OUT_OF_RANGE');
    expect(solution.horizontalDistance).toBeCloseTo(7939.8, 1);
    expect(solution.maxVerifiedRange).toBe(4900);
    expect(solution.elevationMil).toBeNull();
    expect(solution.statusMessage).toContain('Max range: 4900m');
  });

  it('verifies that range ring vertices generated in world meters maintain exact physical distance from mortar', () => {
    const mortarPos: WorldCoordinate = { x: 5200, y: 6800, z: 92 };
    const testRadius = 1500; // 1500m ring
    const segments = 16;

    for (let i = 0; i < segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const ringX = mortarPos.x + testRadius * Math.cos(angle);
      const ringY = mortarPos.y + testRadius * Math.sin(angle);

      // Distance from center to any point on ring must be exactly 1500m
      const measuredDist = DistanceService.calculateHorizontalDistance(mortarPos, { x: ringX, y: ringY });
      expect(measuredDist).toBeCloseTo(testRadius, 2);

      // Verify that worldToLatLng and latLngToWorld round trip correctly
      const latlng = CoordinateService.worldToLatLng({ x: ringX, y: ringY }, EVERON_MAP);
      const recoveredWorld = CoordinateService.latLngToWorld(latlng, EVERON_MAP);
      expect(recoveredWorld.x).toBeCloseTo(ringX, 1);
      expect(recoveredWorld.y).toBeCloseTo(ringY, 1);
    }
  });

  it('validates default engagement scenario on Everon (FOB Morton to Hill 188) is inside verified range', () => {
    const defaultMortar = EVERON_MAP.defaultMortarPos; // (5200, 6800)
    const defaultTarget = EVERON_MAP.defaultTargetPos; // (6400, 7600)

    const dist = DistanceService.calculateHorizontalDistance(defaultMortar, defaultTarget);
    // dx = 1200, dy = 800 -> dist = 1442.22 m
    expect(dist).toBeCloseTo(1442.2, 1);

    const solution = BallisticSolver.solve(
      defaultMortar,
      defaultTarget,
      'm252_81mm',
      'm821_he',
      -1,
      true,
      noWind
    );

    expect(solution.statusCode).toBe('VALID');
    expect(solution.charge).toBe(1); // Charge 1 covers 200m - 1450m
    expect(solution.elevationMil).toBeGreaterThanOrEqual(800);
    expect(solution.elevationMil).toBeLessThanOrEqual(1515);
  });
});
