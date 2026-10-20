# Arma Reforger Mortar FCS (Fire-Control System)

An advanced, tactical fire-control and ballistic computation application for **Arma Reforger**, featuring precision map-coordinate alignment for Everon, Arland, and Kolguyev, ballistic trajectories for the **US M252 81mm** and **Russian 2B14-1 82mm** mortars, live telemetry HUDs, and mission management.

## 🌟 Core Features

- **Map-First Tactical Viewport:**
  - High-resolution terrain mapping with Leaflet hardware-accelerated rendering.
  - Seamless coastal ocean water coloring (`#A0C3C9`) matching Everon and Arland in-game palettes.
  - Coordinate grid overlays with 1,000m major military grid lines and 100m sub-grid readouts.
  - Physically accurate range rings calculated in world meters from mortar baseplate.
  - Interactive firing vector line with real-time distance, bearing, and elevation badges.

- **Verified Ballistics Engines:**
  - **US M252 81mm Mortar (6400 Mil Circle):**
    - M821 High Explosive (HE)
    - M819 Smoke (WP)
    - M853A1 Illumination
    - M879 Practice
    - Supported charges: Charge 0 (50–475m) through Charge 4 (1,100–4,900m).
  - **Russian 2B14-1 Podnos 82mm Mortar (6000 Mil Warsaw Pact Circle):**
    - O-832DU HE
    - D-832DU Smoke
    - S-832S Illumination
    - Supported charges: Charge 0 through Charge 6 (up to 4,270m).
  - **Automatic & Manual Charge/Ring Selection:**
    - Optimal steep-plunge mortar doctrine selection.
    - Honest verification: refuses to fabricate firing solutions when out of verified range.

- **Floating Live Target Telemetry HUD:**
  - Indicator dynamically positioned directly above the active target marker.
  - Live readout of elevation in mils and degrees, distance, heading/bearing, altitude difference, time of flight, peak altitude, and dispersion CEP.
  - Quick-action buttons: Lock/Unlock, Duplicate, Delete, and Expand details.

- **Atmospheric Wind Adjustment:**
  - Visual wind vector arrow and compass rose.
  - Meteorological (FROM) vs Ballistic vector (TOWARD) conventions.
  - Crosswind azimuth mil deflection and head/tailwind range compensation.

- **Full Bilingual Support:**
  - English (LTR) and Arabic (RTL) with tactical military terminology.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Unit Tests
```bash
npx vitest run
```

## 🗺️ Coordinate System Reference

- **World Coordinates:** Southwest origin (0, 0), X increases East, Y increases North.
- **Everon Dimensions:** 12,800m × 12,800m.
- **Arland Dimensions:** 4,096m × 4,096m.
- **Kolguyev Dimensions:** 12,800m × 12,800m.
- **Bearing Convention:** 0° / 360° North, 90° East, 180° South, 270° West.
