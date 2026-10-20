import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { MapDefinition, WorldCoordinate } from '../../types/map';
import { TargetInstance } from '../../types/target';
import { MortarInstance } from '../../types/mortar';
import { FiringSolution } from '../../types/ballistics';
import { FCSSettings } from '../../types/settings';
import { CoordinateService } from '../../utils/coordinates';
import { TargetInfoOverlay } from '../target/TargetInfoOverlay';
import { CompassRose } from './CompassRose';
import { t } from '../../utils/i18n';
import {
  Plus,
  Minus,
  Crosshair,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Map as MapIcon,
  RotateCcw,
} from 'lucide-react';

interface TacticalMapProps {
  mapDef: MapDefinition;
  mortar: MortarInstance;
  target: TargetInstance;
  solution: FiringSolution;
  settings: FCSSettings;
  onUpdateMortarPos: (pos: WorldCoordinate) => void;
  onUpdateTargetPos: (pos: WorldCoordinate) => void;
  onToggleTargetOverlay: () => void;
  onToggleTargetLock: () => void;
  onToggleMortarLock: () => void;
  onDuplicateTarget: () => void;
  onDeleteTarget: () => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  mapDef,
  mortar,
  target,
  solution,
  settings,
  onUpdateMortarPos,
  onUpdateTargetPos,
  onToggleTargetOverlay,
  onToggleTargetLock,
  onToggleMortarLock,
  onDuplicateTarget,
  onDeleteTarget,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Leaflet native layers and markers
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const fallbackVectorLayerRef = useRef<L.LayerGroup | null>(null);
  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  const ringsLayerRef = useRef<L.LayerGroup | null>(null);
  const vectorLineLayerRef = useRef<L.LayerGroup | null>(null);
  const landmarksLayerRef = useRef<L.LayerGroup | null>(null);

  const mortarMarkerRef = useRef<L.Marker | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);

  // Portal DOM nodes for Leaflet custom DivIcons
  const [mortarPortalNode, setMortarPortalNode] = useState<HTMLDivElement | null>(null);
  const [targetPortalNode, setTargetPortalNode] = useState<HTMLDivElement | null>(null);

  const [cursorWorld, setCursorWorld] = useState<WorldCoordinate | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapZoom, setMapZoom] = useState<number>(2.5);

  const isOutOfRange = solution.statusCode === 'OUT_OF_RANGE';

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapDivRef.current) return;

    // Custom Flat CRS matching Arma Reforger coordinate projection
    const customCRS = L.extend({}, L.CRS.Simple, {
      transformation: new L.Transformation(1, 0, 1, 0),
    });

    const isMobile = window.innerWidth < 768;

    // Map boundary setup: Island extent with comfortable coastal water margin
    const mapExtentX = mapDef.tileConfig ? 256 : (mapDef.width / 256);
    const mapExtentY = mapDef.tileConfig ? 256 : (mapDef.height / 256);

    const maxBounds = L.latLngBounds(
      L.latLng(-12, -12),
      L.latLng(mapExtentY + 12, mapExtentX + 12)
    );

    // Initial View: Focus directly on the active tactical engagement zone
    const mortarLatLng = CoordinateService.worldToLatLng(mortar.position, mapDef);
    const targetLatLng = CoordinateService.worldToLatLng(target.position, mapDef);

    const tacticalBounds = L.latLngBounds(
      L.latLng(mortarLatLng.lat, mortarLatLng.lng),
      L.latLng(targetLatLng.lat, targetLatLng.lng)
    );

    const minZoomLevel = isMobile ? 1.5 : 2.0;

    const map = L.map(mapDivRef.current, {
      crs: customCRS,
      maxBounds,
      maxBoundsViscosity: 0.9,
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 60,
      minZoom: minZoomLevel,
      maxZoom: mapDef.tileConfig?.maxZoom ?? 6,
    });

    mapInstanceRef.current = map;

    // Fit initial tactical view: if target is within verified weapon range, frame both.
    // Otherwise frame mortar with tactical engagement zone to keep map immersive.
    if (solution.horizontalDistance <= (solution.maxVerifiedRange ?? 4900)) {
      map.fitBounds(tacticalBounds.pad(0.35), {
        maxZoom: 4.5,
        animate: false,
      });
      if (map.getZoom() < (isMobile ? 2.0 : 2.5)) {
        map.setZoom(isMobile ? 2.0 : 2.5);
      }
    } else {
      map.setView(L.latLng(mortarLatLng.lat, mortarLatLng.lng), isMobile ? 2.5 : 3.0, {
        animate: false,
      });
    }

    // Create Layer Groups
    fallbackVectorLayerRef.current = L.layerGroup().addTo(map);
    gridLayerRef.current = L.layerGroup().addTo(map);
    ringsLayerRef.current = L.layerGroup().addTo(map);
    vectorLineLayerRef.current = L.layerGroup().addTo(map);
    landmarksLayerRef.current = L.layerGroup().addTo(map);

    // Create DOM nodes for React portals inside Leaflet MarkerPane
    const mNode = document.createElement('div');
    mNode.className = 'tactical-mortar-portal';
    L.DomEvent.disableClickPropagation(mNode);
    L.DomEvent.disableScrollPropagation(mNode);
    setMortarPortalNode(mNode);

    const tNode = document.createElement('div');
    tNode.className = 'tactical-target-portal';
    L.DomEvent.disableClickPropagation(tNode);
    L.DomEvent.disableScrollPropagation(tNode);
    setTargetPortalNode(tNode);

    // Create Leaflet Markers
    const mortarMarker = L.marker(L.latLng(mortarLatLng.lat, mortarLatLng.lng), {
      icon: L.divIcon({
        html: mNode,
        className: 'tactical-div-icon',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }),
      draggable: !mortar.locked,
      zIndexOffset: 1000,
    }).addTo(map);
    mortarMarkerRef.current = mortarMarker;

    const targetMarker = L.marker(L.latLng(targetLatLng.lat, targetLatLng.lng), {
      icon: L.divIcon({
        html: tNode,
        className: 'tactical-div-icon',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }),
      draggable: !target.locked,
      zIndexOffset: 2000,
    }).addTo(map);
    targetMarkerRef.current = targetMarker;

    // Drag listeners on markers
    mortarMarker.on('drag', (e) => {
      const latlng = (e.target as L.Marker).getLatLng();
      const world = CoordinateService.latLngToWorld({ lat: latlng.lat, lng: latlng.lng }, mapDef);
      onUpdateMortarPos({ ...world, z: mortar.position.z });
    });

    targetMarker.on('drag', (e) => {
      const latlng = (e.target as L.Marker).getLatLng();
      const world = CoordinateService.latLngToWorld({ lat: latlng.lat, lng: latlng.lng }, mapDef);
      onUpdateTargetPos({ ...world, z: target.position.z });
    });

    // Map Event listeners
    map.on('mousemove', (e) => {
      const world = CoordinateService.latLngToWorld({ lat: e.latlng.lat, lng: e.latlng.lng }, mapDef);
      setCursorWorld(world);
    });

    map.on('zoomend viewreset', () => {
      setMapZoom(map.getZoom());
    });

    // Map click: Deliberately place target if click falls inside island territory
    map.on('click', (e) => {
      const world = CoordinateService.latLngToWorld({ lat: e.latlng.lat, lng: e.latlng.lng }, mapDef);
      // Ignore clicks outside verified island terrain
      if (
        world.x < 0 ||
        world.x > mapDef.width ||
        world.y < 0 ||
        world.y > mapDef.height
      ) {
        return;
      }
      if (!target.locked) {
        onUpdateTargetPos({ ...world, z: target.position.z });
      }
    });

    // ResizeObserver to ensure map viewport invalidates on window / panel resizing
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapDivRef.current) {
      resizeObserver.observe(mapDivRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      mortarMarkerRef.current = null;
      targetMarkerRef.current = null;
      setMortarPortalNode(null);
      setTargetPortalNode(null);
    };
  }, [mapDef.id]);

  // 2. Sync Marker Drag States when locks change
  useEffect(() => {
    if (mortarMarkerRef.current) {
      if (mortar.locked) {
        mortarMarkerRef.current.dragging?.disable();
      } else {
        mortarMarkerRef.current.dragging?.enable();
      }
    }
  }, [mortar.locked]);

  useEffect(() => {
    if (targetMarkerRef.current) {
      if (target.locked) {
        targetMarkerRef.current.dragging?.disable();
      } else {
        targetMarkerRef.current.dragging?.enable();
      }
    }
  }, [target.locked]);

  // 3. Update Marker LatLngs when coordinates change externally
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mortarMarkerRef.current) return;
    const latlng = CoordinateService.worldToLatLng(mortar.position, mapDef);
    const curr = mortarMarkerRef.current.getLatLng();
    if (Math.abs(curr.lat - latlng.lat) > 0.001 || Math.abs(curr.lng - latlng.lng) > 0.001) {
      mortarMarkerRef.current.setLatLng(L.latLng(latlng.lat, latlng.lng));
    }
  }, [mortar.position.x, mortar.position.y, mapDef]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !targetMarkerRef.current) return;
    const latlng = CoordinateService.worldToLatLng(target.position, mapDef);
    const curr = targetMarkerRef.current.getLatLng();
    if (Math.abs(curr.lat - latlng.lat) > 0.001 || Math.abs(curr.lng - latlng.lng) > 0.001) {
      targetMarkerRef.current.setLatLng(L.latLng(latlng.lat, latlng.lng));
    }
  }, [target.position.x, target.position.y, mapDef]);

  // 4. Update Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    if (mapDef.tilesAvailable && mapDef.tileConfig) {
      const cfg = mapDef.tileConfig;
      const isSat = settings.activeLayer === 'satellite';
      const primaryUrl = isSat && cfg.satelliteTileUrl ? cfg.satelliteTileUrl : cfg.tileUrl;
      const fallbackUrl = isSat && cfg.fallbackSatelliteTileUrl ? cfg.fallbackSatelliteTileUrl : cfg.fallbackTileUrl;

      const tileLayer = L.tileLayer(primaryUrl, {
        bounds: L.latLngBounds(L.latLng(0, 0), L.latLng(256, 256)),
        minZoom: cfg.minZoom,
        maxZoom: cfg.maxZoom,
        maxNativeZoom: cfg.maxZoom,
        noWrap: true,
        tileSize: cfg.tileSize,
        keepBuffer: 4,
      });

      tileLayer.on('tileerror', (e) => {
        if (fallbackUrl && e.tile && !e.tile.dataset.fallbackTried) {
          e.tile.dataset.fallbackTried = 'true';
          const coords = (e as any).coords;
          if (coords) {
            e.tile.src = fallbackUrl
              .replace('{z}', String(coords.z))
              .replace('{x}', String(coords.x))
              .replace('{y}', String(coords.y));
          }
        }
      });

      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;
    }
  }, [mapDef.id, settings.activeLayer, mapDef.tilesAvailable]);

  // 5. Render Fallback Vector Basemap (Coastline, Roads, Runway)
  useEffect(() => {
    const layer = fallbackVectorLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    // Render vector geography if tiles unavailable or for tactical basemap outline
    if (!mapDef.tilesAvailable || settings.activeLayer === 'minimal') {
      mapDef.terrainFeatures.forEach((feat) => {
        const latlngs = feat.points.map(([x, y]) => {
          const ll = CoordinateService.worldToLatLng({ x, y }, mapDef);
          return L.latLng(ll.lat, ll.lng);
        });

        if (feat.type === 'water') {
          // Island Landmass Polygon
          L.polygon(latlngs, {
            color: '#38bdf8',
            weight: 2,
            fillColor: '#0f172a',
            fillOpacity: 0.9,
            interactive: false,
          }).addTo(layer);
        } else if (feat.type === 'road') {
          L.polyline(latlngs, {
            color: '#e2e8f0',
            weight: 2,
            opacity: 0.8,
            interactive: false,
          }).addTo(layer);
        } else if (feat.type === 'runway') {
          L.polyline(latlngs, {
            color: '#facc15',
            weight: 4,
            opacity: 0.9,
            interactive: false,
          }).addTo(layer);
        } else if (feat.type === 'contour' && settings.showElevationContours) {
          L.polygon(latlngs, {
            color: '#78350f',
            weight: 1.5,
            fill: false,
            opacity: 0.6,
            dashArray: '4, 4',
            interactive: false,
          }).addTo(layer);
        }
      });
    }
  }, [mapDef.id, mapDef.tilesAvailable, settings.activeLayer, settings.showElevationContours]);

  // 6. Render Coordinate Grid Overlay (1000m Major, 100m Minor)
  useEffect(() => {
    const layer = gridLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (!settings.showGridMajor) return;

    const majorStep = mapDef.gridSizeMajor || 1000;
    const maxX = mapDef.width;
    const maxY = mapDef.height;

    // Major Vertical Lines (X / Eastings)
    for (let x = 0; x <= maxX; x += majorStep) {
      const p1 = CoordinateService.worldToLatLng({ x, y: 0 }, mapDef);
      const p2 = CoordinateService.worldToLatLng({ x, y: maxY }, mapDef);
      L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
        color: '#475569',
        weight: 1,
        opacity: 0.35,
        interactive: false,
      }).addTo(layer);

      // Grid Label at bottom
      const gridLabel = (Math.floor(x / 100)).toString().padStart(3, '0').slice(0, 2);
      const labelLL = CoordinateService.worldToLatLng({ x, y: 50 }, mapDef);
      L.marker(L.latLng(labelLL.lat, labelLL.lng), {
        icon: L.divIcon({
          className: 'tactical-div-icon',
          html: `<div style="font-family:monospace;font-size:9px;font-weight:bold;color:#64748b;transform:translate(4px,-14px);pointer-events:none;">${gridLabel}</div>`,
          iconSize: [0, 0],
        }),
        interactive: false,
      }).addTo(layer);
    }

    // Major Horizontal Lines (Y / Northings)
    for (let y = 0; y <= maxY; y += majorStep) {
      const p1 = CoordinateService.worldToLatLng({ x: 0, y }, mapDef);
      const p2 = CoordinateService.worldToLatLng({ x: maxX, y }, mapDef);
      L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
        color: '#475569',
        weight: 1,
        opacity: 0.35,
        interactive: false,
      }).addTo(layer);

      // Grid Label at left
      const gridLabel = (Math.floor(y / 100)).toString().padStart(3, '0').slice(0, 2);
      const labelLL = CoordinateService.worldToLatLng({ x: 50, y }, mapDef);
      L.marker(L.latLng(labelLL.lat, labelLL.lng), {
        icon: L.divIcon({
          className: 'tactical-div-icon',
          html: `<div style="font-family:monospace;font-size:9px;font-weight:bold;color:#64748b;transform:translate(4px,-10px);pointer-events:none;">${gridLabel}</div>`,
          iconSize: [0, 0],
        }),
        interactive: false,
      }).addTo(layer);
    }
  }, [mapDef.id, mapDef.width, mapDef.height, mapDef.gridSizeMajor, settings.showGridMajor]);

  // 7. Render Range Rings in World Coordinates (Physically Calibrated Circles)
  useEffect(() => {
    const layer = ringsLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (!settings.showRangeRings) return;

    // Helper to generate 64-vertex world circle converted to map LatLngs
    const generateCircleLatLngs = (radiusMeters: number): L.LatLng[] => {
      const segments = 64;
      const pts: L.LatLng[] = [];
      for (let i = 0; i <= segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        const x = mortar.position.x + radiusMeters * Math.cos(angle);
        const y = mortar.position.y + radiusMeters * Math.sin(angle);
        const ll = CoordinateService.worldToLatLng({ x, y }, mapDef);
        pts.push(L.latLng(ll.lat, ll.lng));
      }
      return pts;
    };

    // User configured tactical range rings
    settings.customRangeRings
      .filter((r) => r.enabled && r.distance > 0)
      .forEach((ring) => {
        const pts = generateCircleLatLngs(ring.distance);
        L.polygon(pts, {
          color: ring.color,
          weight: 1,
          opacity: 0.5,
          fill: false,
          dashArray: '4, 4',
          interactive: false,
        }).addTo(layer);

        // Distance label marker at North apex
        const topCoord = { x: mortar.position.x, y: mortar.position.y + ring.distance };
        const topLL = CoordinateService.worldToLatLng(topCoord, mapDef);
        L.marker(L.latLng(topLL.lat, topLL.lng), {
          icon: L.divIcon({
            className: 'tactical-div-icon',
            html: `<div style="color:${ring.color};font-family:monospace;font-size:9px;opacity:0.85;white-space:nowrap;transform:translate(-50%,-16px);pointer-events:none;">${ring.label}</div>`,
            iconSize: [0, 0],
          }),
          interactive: false,
        }).addTo(layer);
      });

    // Target Distance Ring (Dynamic Amber)
    if (solution.horizontalDistance > 10) {
      const tgtPts = generateCircleLatLngs(solution.horizontalDistance);
      L.polygon(tgtPts, {
        color: '#f59e0b',
        weight: 1.5,
        opacity: 0.75,
        fill: false,
        dashArray: '6, 4',
        interactive: false,
      }).addTo(layer);
    }

    // Maximum Weapon Range Ring (Prominent Red Dashed Circle)
    const maxRange = solution.maxVerifiedRange ?? 4900;
    const maxPts = generateCircleLatLngs(maxRange);
    L.polygon(maxPts, {
      color: '#ef4444',
      weight: 1.75,
      opacity: 0.85,
      fill: false,
      dashArray: '8, 6',
      interactive: false,
    }).addTo(layer);

    // Max Range Label
    const maxTopCoord = { x: mortar.position.x, y: mortar.position.y + maxRange };
    const maxTopLL = CoordinateService.worldToLatLng(maxTopCoord, mapDef);
    L.marker(L.latLng(maxTopLL.lat, maxTopLL.lng), {
      icon: L.divIcon({
        className: 'tactical-div-icon',
        html: `<div style="color:#ef4444;background:rgba(2,6,23,0.85);border:1px solid rgba(239,68,68,0.5);padding:1px 4px;border-radius:3px;font-family:monospace;font-size:9px;font-weight:bold;white-space:nowrap;transform:translate(-50%,-20px);pointer-events:none;">MAX WEAPON RANGE (${maxRange}m)</div>`,
        iconSize: [0, 0],
      }),
      interactive: false,
    }).addTo(layer);
  }, [
    mortar.position.x,
    mortar.position.y,
    solution.horizontalDistance,
    solution.maxVerifiedRange,
    settings.showRangeRings,
    settings.customRangeRings,
    mapDef,
  ]);

  // 8. Render Firing Vector Line & Midpoint Telemetry Badge
  useEffect(() => {
    const layer = vectorLineLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (!settings.showDistanceLine) return;

    const mLL = CoordinateService.worldToLatLng(mortar.position, mapDef);
    const tLL = CoordinateService.worldToLatLng(target.position, mapDef);

    // Firing line
    L.polyline(
      [
        [mLL.lat, mLL.lng],
        [tLL.lat, tLL.lng],
      ],
      {
        color: '#f59e0b',
        weight: 2,
        opacity: 0.9,
        dashArray: '6, 4',
        interactive: false,
      }
    ).addTo(layer);

    // Midpoint Telemetry Badge
    const midLat = (mLL.lat + tLL.lat) / 2;
    const midLng = (mLL.lng + tLL.lng) / 2;

    const elevBadge = solution.elevationMil
      ? `${solution.elevationMil} mil`
      : isOutOfRange
      ? 'OUT OF RANGE'
      : '--';

    L.marker(L.latLng(midLat, midLng), {
      icon: L.divIcon({
        className: 'tactical-div-icon',
        html: `
          <div style="background:#020617;border:1px solid #f59e0b;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:10px;font-weight:bold;color:#fbbf24;white-space:nowrap;transform:translate(-50%,-50%);box-shadow:0 2px 6px rgba(0,0,0,0.8);pointer-events:none;">
            ${Math.round(solution.horizontalDistance)}m · ${solution.bearingDeg.toFixed(1)}° · ${elevBadge}
          </div>
        `,
        iconSize: [0, 0],
      }),
      interactive: false,
    }).addTo(layer);
  }, [
    mortar.position.x,
    mortar.position.y,
    target.position.x,
    target.position.y,
    solution.horizontalDistance,
    solution.bearingDeg,
    solution.elevationMil,
    solution.statusCode,
    settings.showDistanceLine,
    mapDef,
    isOutOfRange,
  ]);

  // 9. Render Verified Map Landmarks
  useEffect(() => {
    const layer = landmarksLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (!settings.showMapLabels) return;

    mapDef.landmarks.forEach((lm) => {
      // Zoom-dependent visibility
      if (mapZoom < 2.0 && lm.type !== 'city' && lm.type !== 'airfield') return;
      if (mapZoom < 3.0 && (lm.type === 'village' || lm.type === 'hill')) return;

      const ll = CoordinateService.worldToLatLng({ x: lm.x, y: lm.y }, mapDef);
      const isCity = lm.type === 'city';
      const isMilitary = lm.type === 'military';
      const isAirfield = lm.type === 'airfield';
      const dotColor = isCity ? '#38bdf8' : isMilitary ? '#ef4444' : isAirfield ? '#facc15' : '#94a3b8';

      const labelAr = settings.showArabicLandmarks && lm.nameAr ? ` (${lm.nameAr})` : '';

      L.marker(L.latLng(ll.lat, ll.lng), {
        icon: L.divIcon({
          className: 'tactical-div-icon',
          html: `
            <div style="display:flex;align-items:center;gap:4px;transform:translate(-4px,-50%);pointer-events:none;white-space:nowrap;">
              <span style="display:inline-block;width:${isCity ? 8 : 6}px;height:${isCity ? 8 : 6}px;border-radius:50%;background:${dotColor};border:1px solid #020617;box-shadow:0 0 4px ${dotColor};"></span>
              <span style="font-family:sans-serif;font-size:${isCity ? 11 : 9}px;font-weight:${isCity ? 'bold' : 'normal'};color:#f8fafc;text-shadow:0 1px 3px rgba(0,0,0,0.95);">
                ${lm.name}${labelAr}
              </span>
            </div>
          `,
          iconSize: [0, 0],
        }),
        interactive: false,
      }).addTo(layer);
    });
  }, [mapDef.id, mapDef.landmarks, mapZoom, settings.showMapLabels, settings.showArabicLandmarks]);

  // 10. Tactical Zoom & View Handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  // Reset Tactical View: Frames the combat area between Mortar & Target
  const handleResetTacticalView = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const mLL = CoordinateService.worldToLatLng(mortar.position, mapDef);
    const tLL = CoordinateService.worldToLatLng(target.position, mapDef);
    const bounds = L.latLngBounds(L.latLng(mLL.lat, mLL.lng), L.latLng(tLL.lat, tLL.lng));
    map.fitBounds(bounds.pad(0.35), {
      maxZoom: 4.5,
      animate: true,
    });
  }, [mortar.position, target.position, mapDef]);

  // View Entire Island: Frames [0, 0] to [256, 256]
  const handleFitEntireIsland = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.fitBounds(L.latLngBounds(L.latLng(0, 0), L.latLng(256, 256)), {
      padding: [15, 15],
      animate: true,
    });
  }, []);

  // Bring Target in Range helper (moves target to within 1400m of mortar)
  const handleBringTargetInRange = useCallback(() => {
    const angleRad = (solution.bearingDeg * Math.PI) / 180;
    const newX = Math.round(mortar.position.x + 1400 * Math.sin(angleRad));
    const newY = Math.round(mortar.position.y + 1400 * Math.cos(angleRad));
    onUpdateTargetPos({
      x: Math.max(100, Math.min(mapDef.width - 100, newX)),
      y: Math.max(100, Math.min(mapDef.height - 100, newY)),
      z: target.position.z,
    });
    handleResetTacticalView();
  }, [mortar.position, solution.bearingDeg, mapDef, target.position.z, onUpdateTargetPos, handleResetTacticalView]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const mapBgColor = useMemo(() => {
    if (!mapDef.tilesAvailable) return '#070a12';
    switch (settings.activeLayer) {
      case 'topo':
        return '#A0C3C9'; // Exact Arma Reforger coastal water color
      case 'satellite':
        return '#0f1d2e'; // Deep ocean reconnaissance tone
      case 'night':
        return '#03170e'; // Night vision FLIR green
      case 'minimal':
      default:
        return '#0b1a28';
    }
  }, [mapDef.tilesAvailable, settings.activeLayer]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none transition-colors duration-300"
      style={{ backgroundColor: mapBgColor }}
    >
      {/* 1. Leaflet Tactical Viewport (100% of Screen) */}
      <div
        ref={mapDivRef}
        id="tactical-leaflet-viewport"
        className="absolute inset-0 w-full h-full z-0 pointer-events-auto"
        style={{ backgroundColor: mapBgColor }}
      />

      {/* 2. Diagnostic Warning if Map Tiles are Unavailable (e.g. Kolguyev) */}
      {!mapDef.tilesAvailable && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 max-w-lg w-[90%] bg-amber-950/90 border border-amber-500/80 rounded-lg p-2.5 shadow-2xl backdrop-blur-md text-amber-200 text-xs font-mono flex items-start gap-2.5 pointer-events-auto">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold uppercase tracking-wider text-amber-300">
              Diagnostic Notice: Terrain Map Tiles Unavailable
            </div>
            <p className="text-[11px] text-amber-200/90 font-sans mt-0.5">
              {settings.language === 'ar' ? mapDef.diagnosticNoticeAr : mapDef.diagnosticNotice}
            </p>
          </div>
        </div>
      )}

      {/* 3. Out of Range Banner with Quick Action Button */}
      {isOutOfRange && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-rose-950/95 border border-rose-500/80 rounded-lg px-3 py-1.5 shadow-2xl backdrop-blur-md text-rose-200 text-xs font-mono flex items-center gap-3 pointer-events-auto">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold">OUT OF RANGE:</span> Target ({CoordinateService.formatMeters(solution.horizontalDistance)}) exceeds weapon max reach ({CoordinateService.formatMeters(solution.maxVerifiedRange ?? 4900)})
          </div>
          <button
            onClick={handleBringTargetInRange}
            className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Bring In Range</span>
          </button>
        </div>
      )}

      {/* 4. React Portals for Markers inside Leaflet MarkerPane */}
      {mortarPortalNode &&
        createPortal(
          <div
            className="relative cursor-grab active:cursor-grabbing select-none"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            {/* Mortar Telemetry Tag */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-auto font-mono text-[10px] bg-slate-950/95 border border-cyan-500/50 rounded-lg shadow-xl px-2.5 py-1.5 whitespace-nowrap text-slate-100 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-1 mb-1">
                <span className="font-bold text-cyan-400 tracking-wide">{mortar.name}</span>
                <span className="text-slate-400 font-mono">[{CoordinateService.worldToGrid(mortar.position, 6)}]</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMortarLock();
                  }}
                  className="text-slate-400 hover:text-slate-200"
                  title={mortar.locked ? t('unlockPosition', settings.language) : t('lockPosition', settings.language)}
                >
                  {mortar.locked ? '🔒' : '🔓'}
                </button>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-300">
                <span>{t('mortarAlt', settings.language)}: <strong className="text-slate-100">{mortar.position.z ?? 0}m</strong></span>
                <span>{t('charge', settings.language)}: <strong className="text-emerald-400">R-{solution.charge}</strong></span>
              </div>
            </div>

            {/* Reticle Symbol */}
            <div className="relative flex items-center justify-center w-10 h-10">
              <svg viewBox="0 0 40 40" className="w-10 h-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <circle cx="20" cy="20" r="14" fill="#090d16" stroke="#06b6d4" strokeWidth="2" />
                <line x1="12" y1="28" x2="20" y2="18" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="28" y1="28" x2="20" y2="18" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                <g transform={`rotate(${solution.bearingDeg}, 20, 20)`}>
                  <line x1="20" y1="20" x2="20" y2="4" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <polygon points="20,1 17,6 23,6" fill="#f59e0b" />
                </g>
                <circle cx="20" cy="20" r="3.5" fill="#06b6d4" />
              </svg>
            </div>
          </div>,
          mortarPortalNode
        )}

      {targetPortalNode &&
        createPortal(
          <div
            className="relative cursor-grab active:cursor-grabbing select-none"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            {/* Attached Floating Target HUD Overlay */}
            {target.showOverlay && (
              <TargetInfoOverlay
                target={target}
                solution={solution}
                language={settings.language}
                onToggleExpand={onToggleTargetOverlay}
                onToggleLock={onToggleTargetLock}
                onDuplicate={onDuplicateTarget}
                onDelete={onDeleteTarget}
              />
            )}

            {/* Target Reticle */}
            <div className="relative flex items-center justify-center w-9 h-9">
              <svg viewBox="0 0 36 36" className="w-9 h-9 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <circle cx="18" cy="18" r="12" fill="none" stroke={target.color || '#f59e0b'} strokeWidth="1.5" />
                <circle cx="18" cy="18" r="3" fill={target.color || '#f59e0b'} />
                <line x1="18" y1="2" x2="18" y2="10" stroke={target.color || '#f59e0b'} strokeWidth="1.75" />
                <line x1="18" y1="26" x2="18" y2="34" stroke={target.color || '#f59e0b'} strokeWidth="1.75" />
                <line x1="2" y1="18" x2="10" y2="18" stroke={target.color || '#f59e0b'} strokeWidth="1.75" />
                <line x1="26" y1="18" x2="34" y2="18" stroke={target.color || '#f59e0b'} strokeWidth="1.75" />
              </svg>

              <div className="absolute top-full mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider whitespace-nowrap border shadow-md bg-amber-500/20 text-amber-300 border-amber-500/60 pointer-events-none">
                {target.name}
              </div>
            </div>
          </div>,
          targetPortalNode
        )}

      {/* 5. Compass Rose Overlay */}
      {settings.showCompassRose && (
        <CompassRose
          bearingDeg={solution.bearingDeg}
          bearingMil={solution.bearingMil}
          cardinal={solution.cardinalDirection}
          windSpeed={settings.windEnabled ? settings.windSpeed : 0}
          windDirectionDeg={settings.windDirectionDeg}
          language={settings.language}
        />
      )}

      {/* 6. Floating Zoom & Map Controls */}
      <div className="absolute right-3 bottom-12 flex flex-col gap-2 z-20">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetTacticalView}
          title={t('resetView', settings.language)}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-slate-700/80 rounded-lg shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitEntireIsland}
          title={settings.language === 'ar' ? 'عرض كامل الجزيرة' : 'View Entire Island'}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-slate-700/80 rounded-lg shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <MapIcon className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          title={t('fullscreen', settings.language)}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 7. Bottom Coordinate & Map Telemetry Readout */}
      <div className="absolute left-3 bottom-2 z-10 flex items-center gap-3 text-xs font-mono bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 text-slate-300 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{mapDef.name}</span>
          <span className="text-slate-600">|</span>
        </div>

        {cursorWorld ? (
          <div className="flex items-center gap-3">
            <span>
              GRID: <strong className="text-amber-400 tabular-nums">{CoordinateService.worldToGrid(cursorWorld, 6)}</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span>
              X: <strong className="text-slate-100 tabular-nums">{Math.round(cursorWorld.x)}m</strong>
            </span>
            <span>
              Y: <strong className="text-slate-100 tabular-nums">{Math.round(cursorWorld.y)}m</strong>
            </span>
            {mapDef.tilesAvailable && (
              <>
                <span className="text-slate-600 hidden sm:inline">·</span>
                <span className="text-[10px] text-emerald-400 hidden sm:inline font-bold">
                  ● REAL TILES
                </span>
              </>
            )}
          </div>
        ) : (
          <span className="text-slate-400">Aim or tap on map</span>
        )}
      </div>
    </div>
  );
};
