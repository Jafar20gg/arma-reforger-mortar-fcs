import { describe, it, expect } from 'vitest';
import { DistanceService } from '../utils/distance';
import { WorldCoordinate } from '../types/map';

describe('DistanceService', () => {
  it('correctly calculates 3-4-5 classic Pythagorean separation in meters', () => {
    const mortar: WorldCoordinate = { x: 1000, y: 1000 };
    const target: WorldCoordinate = { x: 1300, y: 1400 }; // dx = 300, dy = 400

    const dist = DistanceService.calculateHorizontalDistance(mortar, target);
    expect(dist).toBeCloseTo(500, 2);
  });

  it('correctly calculates 3D slant distance with altitude difference', () => {
    const mortar: WorldCoordinate = { x: 1000, y: 1000, z: 100 };
    const target: WorldCoordinate = { x: 1300, y: 1400, z: 100 }; // flat

    expect(DistanceService.calculateSlantDistance(mortar, target)).toBeCloseTo(500, 2);

    // Target 200m higher
    const targetHigh: WorldCoordinate = { x: 1300, y: 1400, z: 300 }; // dz = 200, horiz = 500
    // slant = sqrt(500^2 + 200^2) = sqrt(290000) ≈ 538.516
    expect(DistanceService.calculateSlantDistance(mortar, targetHigh)).toBeCloseTo(538.52, 1);
  });

  it('correctly reports positive and negative height differences', () => {
    const mortar: WorldCoordinate = { x: 0, y: 0, z: 50 };
    const targetHigh: WorldCoordinate = { x: 100, y: 100, z: 120 };
    const targetLow: WorldCoordinate = { x: 100, y: 100, z: 20 };

    expect(DistanceService.calculateHeightDifference(mortar, targetHigh)).toBe(70);
    expect(DistanceService.formatHeightDifference(70)).toBe('+70m');

    expect(DistanceService.calculateHeightDifference(mortar, targetLow)).toBe(-30);
    expect(DistanceService.formatHeightDifference(-30)).toBe('-30m');
  });
});
