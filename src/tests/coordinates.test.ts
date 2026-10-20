import { describe, it, expect } from 'vitest';
import { CoordinateService } from '../utils/coordinates';
import { MapBounds, WorldCoordinate } from '../types/map';

describe('CoordinateService', () => {
  const bounds: MapBounds = { minX: 0, minY: 0, maxX: 12800, maxY: 12800 };
  const viewport = { width: 1200, height: 800 };
  const panWorld: WorldCoordinate = { x: 6400, y: 6400 };
  const scale = 0.1; // 0.1 pixels per meter

  it('correctly maps center world coordinate to viewport center', () => {
    const screen = CoordinateService.worldToScreen(panWorld, panWorld, scale, viewport);
    expect(screen.x).toBeCloseTo(viewport.width / 2);
    expect(screen.y).toBeCloseTo(viewport.height / 2);
  });

  it('correctly performs world-to-screen and screen-to-world round trip', () => {
    const testPoints: WorldCoordinate[] = [
      { x: 5000, y: 5000 },
      { x: 2350, y: 7800 },
      { x: 10000, y: 1500 },
    ];

    testPoints.forEach((pt) => {
      const screen = CoordinateService.worldToScreen(pt, panWorld, scale, viewport);
      const recovered = CoordinateService.screenToWorld(screen, panWorld, scale, viewport);
      expect(recovered.x).toBeCloseTo(pt.x, 2);
      expect(recovered.y).toBeCloseTo(pt.y, 2);
    });
  });

  it('converts world coordinates to standard military grid string', () => {
    // 6-digit grid (100m blocks)
    const pt1 = { x: 5850, y: 7200 };
    expect(CoordinateService.worldToGrid(pt1, 6)).toBe('058 072');

    // 8-digit grid (10m blocks)
    expect(CoordinateService.worldToGrid(pt1, 8)).toBe('0585 0720');

    // 10-digit grid (1m blocks)
    expect(CoordinateService.worldToGrid(pt1, 10)).toBe('05850 07200');
  });

  it('correctly parses military grid back to world coordinates', () => {
    const parsed6 = CoordinateService.gridToWorld('058 072');
    expect(parsed6).not.toBeNull();
    expect(parsed6?.x).toBe(5850);
    expect(parsed6?.y).toBe(7250);

    const parsed8 = CoordinateService.gridToWorld('0585 0720');
    expect(parsed8).not.toBeNull();
    expect(parsed8?.x).toBe(5855);
    expect(parsed8?.y).toBe(7205);
  });

  it('clamps coordinates strictly within map bounds', () => {
    const outOfBounds = { x: -500, y: 15000, z: -10 };
    const clamped = CoordinateService.clampToBounds(outOfBounds, bounds);
    expect(clamped.x).toBe(0);
    expect(clamped.y).toBe(12800);
    expect(clamped.z).toBe(0);
  });
});
