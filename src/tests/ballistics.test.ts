import { describe, it, expect } from 'vitest';
import { BallisticSolver } from '../services/ballisticSolver';
import { WorldCoordinate } from '../types/map';
import { WindSettings } from '../types/ballistics';

describe('BallisticSolver', () => {
  const mortarPos: WorldCoordinate = { x: 5000, y: 5000, z: 50 };
  const noWind: WindSettings = { enabled: false, speed: 0, directionDeg: 0, convention: 'FROM' };

  it('solves US M252 81mm mortar with auto-charge selection', () => {
    // Target 1200m away (Charge 1 range: 200 - 1450m)
    const targetPos: WorldCoordinate = { x: 5000, y: 6200, z: 50 };

    const solution = BallisticSolver.solve(
      mortarPos,
      targetPos,
      'm252_81mm',
      'm821_he',
      -1,
      true,
      noWind
    );

    expect(solution.statusCode).toBe('VALID');
    expect(solution.horizontalDistance).toBeCloseTo(1200, 1);
    expect(solution.bearingDeg).toBeCloseTo(0, 1); // North
    expect(solution.elevationMil).not.toBeNull();
    // Elevation in mils must be within M252 verified limits: 800 mil to 1515 mil
    expect(solution.elevationMil).toBeGreaterThanOrEqual(800);
    expect(solution.elevationMil).toBeLessThanOrEqual(1515);
    expect(solution.charge).toBe(1);
    expect(solution.timeOfFlight).toBeGreaterThan(10);
  });

  it('solves Russian 2B14 82mm mortar with 6000 mil circle', () => {
    const targetPos: WorldCoordinate = { x: 6000, y: 5000, z: 50 }; // 1000m East (90°)

    const solution = BallisticSolver.solve(
      mortarPos,
      targetPos,
      '2b14_82mm',
      'o832du_he',
      -1,
      true,
      noWind
    );

    expect(solution.statusCode).toBe('VALID');
    expect(solution.bearingDeg).toBeCloseTo(90, 1);
    // In 6000 mil system: 90° = 1500 mil
    expect(solution.bearingMil).toBe(1500);
    // Russian 2B14 elevation limits: 748 to 1415 mils
    expect(solution.elevationMil).toBeGreaterThanOrEqual(748);
    expect(solution.elevationMil).toBeLessThanOrEqual(1415);
  });

  it('returns OUT_OF_RANGE when target exceeds maximum verified weapon range', () => {
    // 7000m away (beyond max 4900m of M252)
    const farTarget: WorldCoordinate = { x: 5000, y: 12000, z: 50 };

    const solution = BallisticSolver.solve(
      mortarPos,
      farTarget,
      'm252_81mm',
      'm821_he',
      -1,
      true,
      noWind
    );

    expect(solution.statusCode).toBe('OUT_OF_RANGE');
    expect(solution.elevationMil).toBeNull();
  });

  it('returns OUT_OF_RANGE when target is closer than minimum charge range', () => {
    // 20m away (min range is 50m)
    const tooClose: WorldCoordinate = { x: 5000, y: 5020, z: 50 };

    const solution = BallisticSolver.solve(
      mortarPos,
      tooClose,
      'm252_81mm',
      'm821_he',
      -1,
      true,
      noWind
    );

    expect(solution.statusCode).toBe('OUT_OF_RANGE');
  });

  it('correctly adjusts elevation for target altitude difference (high-angle mortar physics)', () => {
    const flatTarget: WorldCoordinate = { x: 5000, y: 6000, z: 50 };
    const highTarget: WorldCoordinate = { x: 5000, y: 6000, z: 150 }; // 100m higher

    const solFlat = BallisticSolver.solve(mortarPos, flatTarget, 'm252_81mm', 'm821_he', 1, false, noWind);
    const solHigh = BallisticSolver.solve(mortarPos, highTarget, 'm252_81mm', 'm821_he', 1, false, noWind);

    expect(solFlat.statusCode).toBe('VALID');
    expect(solHigh.statusCode).toBe('VALID');
    // High-angle mortar rule: to reach higher elevation at the same horizontal distance, the angle must be lower (towards 45°/800 mil)
    expect(solHigh.elevationMil!).toBeLessThan(solFlat.elevationMil!);
    expect(solHigh.heightDifference).toBe(100);
  });

  it('marks interpolated solutions clearly when range falls between table entries', () => {
    const interpolatedTarget: WorldCoordinate = { x: 5000, y: 5635, z: 50 }; // 635m range

    const solution = BallisticSolver.solve(
      mortarPos,
      interpolatedTarget,
      'm252_81mm',
      'm821_he',
      1,
      false,
      noWind
    );

    expect(solution.statusCode).toBe('VALID');
    expect(solution.isInterpolated).toBe(true);
  });
});
