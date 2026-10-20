import { WorldCoordinate, ScreenCoordinate, MapBounds } from '../types/map';

export class CoordinateService {
  /**
   * Converts world coordinates (SW origin, X East, Y North) to screen coordinates
   */
  static worldToScreen(
    world: WorldCoordinate,
    panWorld: WorldCoordinate,
    scale: number, // pixels per world meter
    viewport: { width: number; height: number }
  ): ScreenCoordinate {
    const screenX = viewport.width / 2 + (world.x - panWorld.x) * scale;
    const screenY = viewport.height / 2 - (world.y - panWorld.y) * scale;
    return { x: screenX, y: screenY };
  }

  /**
   * Converts screen coordinates to world coordinates (SW origin, X East, Y North)
   */
  static screenToWorld(
    screen: ScreenCoordinate,
    panWorld: WorldCoordinate,
    scale: number,
    viewport: { width: number; height: number }
  ): WorldCoordinate {
    const worldX = panWorld.x + (screen.x - viewport.width / 2) / scale;
    const worldY = panWorld.y - (screen.y - viewport.height / 2) / scale;
    return { x: worldX, y: worldY };
  }

  /**
   * Clamps world coordinates to map bounds
   */
  static clampToBounds(coord: WorldCoordinate, bounds: MapBounds): WorldCoordinate {
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, coord.x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, coord.y)),
      z: coord.z !== undefined ? Math.max(0, coord.z) : 0,
    };
  }

  /**
   * Formats world coordinates to Arma standard military grid string
   * Precision:
   * 6-digit: 100m resolution (e.g. "054 072")
   * 8-digit: 10m resolution (e.g. "0542 0721")
   * 10-digit: 1m resolution (e.g. "05425 07214")
   */
  static worldToGrid(world: WorldCoordinate, digits: 6 | 8 | 10 = 6): string {
    const safeX = Math.max(0, Math.floor(world.x));
    const safeY = Math.max(0, Math.floor(world.y));

    if (digits === 6) {
      // 100m blocks
      const xPart = Math.floor(safeX / 100).toString().padStart(3, '0').slice(-3);
      const yPart = Math.floor(safeY / 100).toString().padStart(3, '0').slice(-3);
      return `${xPart} ${yPart}`;
    }

    if (digits === 8) {
      // 10m blocks
      const xPart = Math.floor(safeX / 10).toString().padStart(4, '0').slice(-4);
      const yPart = Math.floor(safeY / 10).toString().padStart(4, '0').slice(-4);
      return `${xPart} ${yPart}`;
    }

    // 10-digit (1m blocks)
    const xPart = safeX.toString().padStart(5, '0').slice(-5);
    const yPart = safeY.toString().padStart(5, '0').slice(-5);
    return `${xPart} ${yPart}`;
  }

  /**
   * Parses standard grid string to world coordinates
   * Handles formats like "054 072", "054072", "0542 0721", "05420721"
   */
  static gridToWorld(gridInput: string, bounds?: MapBounds): WorldCoordinate | null {
    const cleaned = gridInput.replace(/[^0-9]/g, '');
    if (cleaned.length === 6) {
      const x = parseInt(cleaned.slice(0, 3), 10) * 100 + 50; // center of 100m square
      const y = parseInt(cleaned.slice(3, 6), 10) * 100 + 50;
      return { x, y, z: 0 };
    }
    if (cleaned.length === 8) {
      const x = parseInt(cleaned.slice(0, 4), 10) * 10 + 5; // center of 10m square
      const y = parseInt(cleaned.slice(4, 8), 10) * 10 + 5;
      return { x, y, z: 0 };
    }
    if (cleaned.length === 10) {
      const x = parseInt(cleaned.slice(0, 5), 10);
      const y = parseInt(cleaned.slice(5, 10), 10);
      return { x, y, z: 0 };
    }
    return null;
  }

  /**
   * Converts Arma world coordinates (meters) to Leaflet LatLng [lat, lng] for tile alignment
   */
  static worldToLatLng(world: WorldCoordinate, mapDef: import('../types/map').MapDefinition): { lat: number; lng: number } {
    if (mapDef.tileConfig) {
      const cfg = mapDef.tileConfig;
      const lng = (world.x / cfg.lngCof) - cfg.lngOffset;
      const lat = -cfg.latOffset + (world.y / cfg.latCof);
      return { lat, lng };
    }
    // Fallback for uncalibrated maps (standard simple flat projection)
    const lat = (mapDef.height - world.y) / (mapDef.height / 256);
    const lng = world.x / (mapDef.width / 256);
    return { lat, lng };
  }

  /**
   * Converts Leaflet LatLng [lat, lng] back to Arma world coordinates in meters
   */
  static latLngToWorld(latlng: { lat: number; lng: number }, mapDef: import('../types/map').MapDefinition): WorldCoordinate {
    if (mapDef.tileConfig) {
      const cfg = mapDef.tileConfig;
      const x = (latlng.lng + cfg.lngOffset) * cfg.lngCof;
      const y = (latlng.lat + cfg.latOffset) * cfg.latCof;
      return {
        x: Math.max(0, Math.min(mapDef.width, x)),
        y: Math.max(0, Math.min(mapDef.height, y)),
      };
    }
    const x = latlng.lng * (mapDef.width / 256);
    const y = mapDef.height - latlng.lat * (mapDef.height / 256);
    return {
      x: Math.max(0, Math.min(mapDef.width, x)),
      y: Math.max(0, Math.min(mapDef.height, y)),
    };
  }

  /**
   * Formats meters nicely: e.g. "5,420 m" or "1.2 km"
   */
  static formatMeters(meters: number, precision: number = 0): string {
    if (isNaN(meters) || !isFinite(meters)) return '-- m';
    if (meters >= 10000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(precision)} m`;
  }
}
