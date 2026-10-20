import { describe, it, expect } from 'vitest';
import { BearingService } from '../utils/bearing';
import { WorldCoordinate } from '../types/map';

describe('BearingService', () => {
  const origin: WorldCoordinate = { x: 1000, y: 1000 };

  it('calculates cardinal North (0° / 360°)', () => {
    const targetNorth: WorldCoordinate = { x: 1000, y: 2000 };
    const bearing = BearingService.calculateBearingDeg(origin, targetNorth);
    expect(bearing).toBeCloseTo(0, 1);
    expect(BearingService.getCardinal(bearing)).toBe('N');
  });

  it('calculates cardinal East (90°)', () => {
    const targetEast: WorldCoordinate = { x: 2000, y: 1000 };
    const bearing = BearingService.calculateBearingDeg(origin, targetEast);
    expect(bearing).toBeCloseTo(90, 1);
    expect(BearingService.getCardinal(bearing)).toBe('E');
  });

  it('calculates cardinal South (180°)', () => {
    const targetSouth: WorldCoordinate = { x: 1000, y: 0 };
    const bearing = BearingService.calculateBearingDeg(origin, targetSouth);
    expect(bearing).toBeCloseTo(180, 1);
    expect(BearingService.getCardinal(bearing)).toBe('S');
  });

  it('calculates cardinal West (270°)', () => {
    const targetWest: WorldCoordinate = { x: 0, y: 1000 };
    const bearing = BearingService.calculateBearingDeg(origin, targetWest);
    expect(bearing).toBeCloseTo(270, 1);
    expect(BearingService.getCardinal(bearing)).toBe('W');
  });

  it('calculates diagonal bearings accurately (NE, SE, SW, NW)', () => {
    const targetNE: WorldCoordinate = { x: 2000, y: 2000 };
    expect(BearingService.calculateBearingDeg(origin, targetNE)).toBeCloseTo(45, 1);
    expect(BearingService.getCardinal(45)).toBe('NE');

    const targetSE: WorldCoordinate = { x: 2000, y: 0 };
    expect(BearingService.calculateBearingDeg(origin, targetSE)).toBeCloseTo(135, 1);
    expect(BearingService.getCardinal(135)).toBe('SE');

    const targetSW: WorldCoordinate = { x: 0, y: 0 };
    expect(BearingService.calculateBearingDeg(origin, targetSW)).toBeCloseTo(225, 1);
    expect(BearingService.getCardinal(225)).toBe('SW');

    const targetNW: WorldCoordinate = { x: 0, y: 2000 };
    expect(BearingService.calculateBearingDeg(origin, targetNW)).toBeCloseTo(315, 1);
    expect(BearingService.getCardinal(315)).toBe('NW');
  });

  it('distinguishes NATO 6400 mil system from Russian 6000 mil system', () => {
    // 90° (East):
    // In 6400 mil: (90 / 360) * 6400 = 1600 mil
    expect(BearingService.degToMil(90, 6400)).toBe(1600);

    // In 6000 mil: (90 / 360) * 6000 = 1500 mil
    expect(BearingService.degToMil(90, 6000)).toBe(1500);

    // 180° (South):
    expect(BearingService.degToMil(180, 6400)).toBe(3200);
    expect(BearingService.degToMil(180, 6000)).toBe(3000);

    // 270° (West):
    expect(BearingService.degToMil(270, 6400)).toBe(4800);
    expect(BearingService.degToMil(270, 6000)).toBe(4500);
  });
});
