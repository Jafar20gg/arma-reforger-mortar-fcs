import { WorldCoordinate } from '../types/map';

export class DistanceService {
  /**
   * Calculates 2D horizontal distance in meters between two world coordinates
   */
  static calculateHorizontalDistance(from: WorldCoordinate, to: WorldCoordinate): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates 3D slant distance in meters taking altitude into account
   */
  static calculateSlantDistance(from: WorldCoordinate, to: WorldCoordinate): number {
    const horiz = this.calculateHorizontalDistance(from, to);
    const dz = (to.z ?? 0) - (from.z ?? 0);
    return Math.sqrt(horiz * horiz + dz * dz);
  }

  /**
   * Calculates height difference in meters: target altitude - mortar altitude
   * Positive means target is higher, negative means target is lower
   */
  static calculateHeightDifference(mortar: WorldCoordinate, target: WorldCoordinate): number {
    const mortarZ = mortar.z ?? 0;
    const targetZ = target.z ?? 0;
    return targetZ - mortarZ;
  }

  /**
   * Format height difference string
   */
  static formatHeightDifference(dz: number): string {
    const sign = dz > 0 ? '+' : '';
    return `${sign}${dz.toFixed(0)}m`;
  }
}
