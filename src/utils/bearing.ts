import { WorldCoordinate } from '../types/map';

export class BearingService {
  /**
   * Calculates bearing in degrees (0° - 359.999°) from mortar (from) to target (to).
   * 0° = North, 90° = East, 180° = South, 270° = West.
   * Coordinate system: X is East, Y is North.
   * Formula: atan2(dx, dy)
   */
  static calculateBearingDeg(from: WorldCoordinate, to: WorldCoordinate): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) {
      return 0;
    }

    const rad = Math.atan2(dx, dy);
    let deg = rad * (180 / Math.PI);
    deg = (deg % 360 + 360) % 360; // Normalize 0 - 359.999°
    return deg;
  }

  /**
   * Converts bearing degrees to mils according to weapon circle (6400 for NATO/US M252, 6000 for Warsaw Pact/Russian 2B14)
   */
  static degToMil(deg: number, milCircle: 6400 | 6000): number {
    const normalized = (deg % 360 + 360) % 360;
    const mil = (normalized / 360) * milCircle;
    return Math.round(mil) % milCircle;
  }

  /**
   * Converts mils to degrees
   */
  static milToDeg(mil: number, milCircle: 6400 | 6000): number {
    const normalized = (mil % milCircle + milCircle) % milCircle;
    return (normalized / milCircle) * 360;
  }

  /**
   * Converts degrees to 8-point cardinal abbreviation
   */
  static getCardinal(deg: number): string {
    const normalized = (deg % 360 + 360) % 360;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(normalized / 45) % 8;
    return directions[index];
  }

  /**
   * Formats bearing nicely: e.g. "045.2° / 0804 mil (NE)"
   */
  static formatBearing(deg: number, milCircle: 6400 | 6000 = 6400): {
    degStr: string;
    milStr: string;
    cardinal: string;
    combined: string;
  } {
    const mil = this.degToMil(deg, milCircle);
    const cardinal = this.getCardinal(deg);
    const degStr = `${deg.toFixed(1)}°`;
    const milStr = `${mil.toString().padStart(4, '0')} mil`;
    return {
      degStr,
      milStr,
      cardinal,
      combined: `${degStr} (${milStr})`,
    };
  }
}
