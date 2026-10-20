import { describe, it, expect } from 'vitest';
import { BallisticSolver } from '../services/ballisticSolver';
import { DistanceService } from '../utils/distance';
import { CoordinateService } from '../utils/coordinates';
import { WorldCoordinate } from '../types/map';
import { WindSettings } from '../types/ballistics';
import { EVERON_MAP } from '../data/maps/everon';

describe('Phase 3, 4, 6: Placement, Overlays, and 4709m Range Verification', () => {
  const noWind: WindSettings = { enabled: false, speed: 0, directionDeg: 0, convention: 'FROM' };

  it('validates 4709m distance is within M252 81mm Charge 4 verified range', () => {
    const mortarPos: WorldCoordinate = { x: 5200, y: 6800, z: 92 };
    // Target placed at exactly 4708.9m (~4709m)
    const targetPos: WorldCoordinate = { x: 5200 + 3329.7, y: 6800 + 3329.7, z: 100 };
    const dist = DistanceService.calculateHorizontalDistance(mortarPos, targetPos);
    expect(Math.round(dist)).toBe(4709);

    const solution = BallisticSolver.solve(
      mortarPos,
      targetPos,
      'm252_81mm',
      'm821_he',
      -1,
      true,
      noWind
    );

    // 4709m is less than 4900m max range of M252
    expect(solution.statusCode).toBe('VALID');
    expect(solution.charge).toBe(4);
    expect(solution.maxVerifiedRange).toBe(4900);
    expect(solution.elevationMil).not.toBeNull();
    // Elevation in mils must be between 800 and 1515
    expect(solution.elevationMil).toBeGreaterThanOrEqual(800);
    expect(solution.elevationMil).toBeLessThanOrEqual(1515);
    expect(solution.timeOfFlight).toBeGreaterThan(40);
  });

  it('verifies coordinate parsing and clamping during manual coordinate entry', () => {
    // Military grid "052 068"
    const parsed = CoordinateService.gridToWorld('052 068', EVERON_MAP.bounds);
    expect(parsed).not.toBeNull();
    expect(parsed?.x).toBe(5250);
    expect(parsed?.y).toBe(6850);

    // Clamping coordinates to map bounds
    const outOfBoundsTarget: WorldCoordinate = { x: -100, y: 15000, z: -50 };
    const clamped = CoordinateService.clampToBounds(outOfBoundsTarget, EVERON_MAP.bounds);
    expect(clamped.x).toBe(0);
    expect(clamped.y).toBe(12800);
    expect(clamped.z).toBe(0);
  });

  it('verifies that range ring world vertices maintain constant distance regardless of bearing', () => {
    const center: WorldCoordinate = { x: 5000, y: 5000 };
    const radiusMeters = 2500;
    const testAnglesDeg = [0, 45, 90, 135, 180, 225, 270, 315];

    testAnglesDeg.forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const x = center.x + radiusMeters * Math.sin(rad);
      const y = center.y + radiusMeters * Math.cos(rad);
      const measuredDist = DistanceService.calculateHorizontalDistance(center, { x, y });
      expect(measuredDist).toBeCloseTo(radiusMeters, 2);
    });
  });
});
