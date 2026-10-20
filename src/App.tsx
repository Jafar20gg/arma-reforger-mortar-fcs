import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getMapDefinition, SUPPORTED_MAPS, DEFAULT_MAP_ID } from './data/maps';
import { MORTAR_SYSTEMS } from './data/ballistics';
import { MortarInstance, MortarId } from './types/mortar';
import { TargetInstance } from './types/target';
import { WorldCoordinate } from './types/map';
import { FCSSettings, LanguageCode } from './types/settings';
import { WindSettings } from './types/ballistics';
import { BallisticSolver } from './services/ballisticSolver';
import { StorageService, DEFAULT_SETTINGS, SavedMission } from './services/storageService';
import { TacticalMap } from './components/map/TacticalMap';
import { TopToolbar } from './components/hud/TopToolbar';
import { BallisticPanel } from './components/ballistics/BallisticPanel';
import { BallisticTable } from './components/ballistics/BallisticTable';
import { TargetManager } from './components/target/TargetManager';
import { WindModal } from './components/wind/WindModal';
import { MapLayersMenu } from './components/map/MapLayersMenu';
import { SettingsMenu } from './components/settings/SettingsMenu';

export default function App() {
  // Settings & Preferences
  const [settings, setSettings] = useState<FCSSettings>(() => StorageService.loadSettings());
  const [currentMapId, setCurrentMapId] = useState<string>(() => StorageService.loadActiveMapId());

  const currentMap = useMemo(() => getMapDefinition(currentMapId), [currentMapId]);

  // Mortar Instance
  const [mortar, setMortar] = useState<MortarInstance>(() => {
    const map = getMapDefinition(currentMapId);
    return {
      id: 'mortar_primary',
      name: 'MORTAR-01 (M252)',
      systemId: 'm252_81mm',
      selectedAmmoId: 'm821_he',
      selectedCharge: 2,
      autoCharge: true,
      position: { ...map.defaultMortarPos },
      locked: false,
      color: '#06b6d4',
    };
  });

  // Multiple Targets
  const [targets, setTargets] = useState<TargetInstance[]>(() => {
    const map = getMapDefinition(currentMapId);
    return [
      {
        id: 'tgt_1',
        name: 'TGT-01 (Command Outpost)',
        position: { ...map.defaultTargetPos },
        color: '#f59e0b',
        icon: 'crosshair',
        locked: false,
        visible: true,
        showOverlay: true,
        expandedOverlay: false,
      },
    ];
  });

  const [activeTargetId, setActiveTargetId] = useState<string>('tgt_1');

  const activeTarget = useMemo(() => {
    return targets.find((t) => t.id === activeTargetId) || targets[0];
  }, [targets, activeTargetId]);

  // Wind state
  const windSettings: WindSettings = useMemo(
    () => ({
      enabled: settings.windEnabled,
      speed: settings.windSpeed,
      directionDeg: settings.windDirectionDeg,
      convention: settings.windConvention,
    }),
    [settings.windEnabled, settings.windSpeed, settings.windDirectionDeg, settings.windConvention]
  );

  // Single Canonical Ballistic Pipeline Solution
  const solution = useMemo(() => {
    return BallisticSolver.solve(
      mortar.position,
      activeTarget.position,
      mortar.systemId,
      mortar.selectedAmmoId,
      mortar.autoCharge ? -1 : mortar.selectedCharge,
      mortar.autoCharge,
      windSettings
    );
  }, [
    mortar.position,
    activeTarget.position,
    mortar.systemId,
    mortar.selectedAmmoId,
    mortar.selectedCharge,
    mortar.autoCharge,
    windSettings,
  ]);

  // Auto-sync mortar selectedCharge if auto-charge is on and solution found valid charge
  useEffect(() => {
    if (mortar.autoCharge && solution.charge !== mortar.selectedCharge) {
      setMortar((m) => ({ ...m, selectedCharge: solution.charge }));
    }
  }, [mortar.autoCharge, solution.charge]);

  // Persist settings
  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  // Persist Map
  useEffect(() => {
    StorageService.saveActiveMapId(currentMapId);
  }, [currentMapId]);

  // Language & Direction change
  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings.language]);

  // Map change handler
  const handleSelectMap = useCallback((mapId: string) => {
    const newMap = getMapDefinition(mapId);
    setCurrentMapId(mapId);
    setMortar((m) => ({
      ...m,
      position: { ...newMap.defaultMortarPos },
    }));
    setTargets([
      {
        id: `tgt_${Date.now()}`,
        name: 'TGT-01',
        position: { ...newMap.defaultTargetPos },
        color: '#f59e0b',
        icon: 'crosshair',
        locked: false,
        visible: true,
        showOverlay: true,
        expandedOverlay: false,
      },
    ]);
    setActiveTargetId(`tgt_${Date.now()}`);
  }, []);

  // Update mortar position
  const handleUpdateMortarPos = useCallback((newPos: WorldCoordinate) => {
    setMortar((m) => ({ ...m, position: newPos }));
  }, []);

  // Update target position
  const handleUpdateTargetPos = useCallback((newPos: WorldCoordinate) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === activeTargetId ? { ...t, position: newPos } : t))
    );
  }, [activeTargetId]);

  // Toggle active target HUD overlay expand
  const handleToggleTargetOverlay = useCallback(() => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === activeTargetId ? { ...t, expandedOverlay: !t.expandedOverlay } : t
      )
    );
  }, [activeTargetId]);

  // Toggle target lock
  const handleToggleTargetLock = useCallback(() => {
    setTargets((prev) =>
      prev.map((t) => (t.id === activeTargetId ? { ...t, locked: !t.locked } : t))
    );
  }, [activeTargetId]);

  // Toggle mortar lock
  const handleToggleMortarLock = useCallback(() => {
    setMortar((m) => ({ ...m, locked: !m.locked }));
  }, []);

  // Duplicate target
  const handleDuplicateTarget = useCallback(() => {
    const newId = `tgt_${Date.now()}`;
    const newTgt: TargetInstance = {
      ...activeTarget,
      id: newId,
      name: `${activeTarget.name} (Copy)`,
      position: {
        x: activeTarget.position.x + 100,
        y: activeTarget.position.y + 100,
        z: activeTarget.position.z,
      },
      locked: false,
    };
    setTargets((prev) => [...prev, newTgt]);
    setActiveTargetId(newId);
  }, [activeTarget]);

  // Delete target
  const handleDeleteTarget = useCallback(() => {
    if (targets.length <= 1) return;
    const remaining = targets.filter((t) => t.id !== activeTargetId);
    setTargets(remaining);
    setActiveTargetId(remaining[0].id);
  }, [targets, activeTargetId]);

  // Add new target
  const handleAddTarget = useCallback(() => {
    const newId = `tgt_${Date.now()}`;
    const newTgt: TargetInstance = {
      id: newId,
      name: `TGT-${(targets.length + 1).toString().padStart(2, '0')}`,
      position: {
        x: mortar.position.x + 800,
        y: mortar.position.y + 800,
        z: 50,
      },
      color: '#f59e0b',
      icon: 'crosshair',
      locked: false,
      visible: true,
      showOverlay: true,
      expandedOverlay: false,
    };
    setTargets((prev) => [...prev, newTgt]);
    setActiveTargetId(newId);
  }, [targets.length, mortar.position]);

  // Load Mission
  const handleLoadMission = useCallback((mission: SavedMission) => {
    if (mission.mapId && SUPPORTED_MAPS[mission.mapId]) {
      setCurrentMapId(mission.mapId);
    }
    if (mission.mortars && mission.mortars.length > 0) {
      setMortar(mission.mortars[0]);
    }
    if (mission.targets && mission.targets.length > 0) {
      setTargets(mission.targets);
      setActiveTargetId(mission.targets[0].id);
    }
    if (mission.settings) {
      setSettings((s) => ({ ...s, ...mission.settings }));
    }
  }, []);

  // Panel toggles
  const handleTogglePanel = useCallback(
    (panel: 'solution' | 'table' | 'targets' | 'wind' | 'layers' | 'settings') => {
      setSettings((prev) => ({
        ...prev,
        isSolutionPanelOpen: panel === 'solution' ? !prev.isSolutionPanelOpen : false,
        isBallisticTableOpen: panel === 'table' ? !prev.isBallisticTableOpen : false,
        isTargetManagerOpen: panel === 'targets' ? !prev.isTargetManagerOpen : false,
        isWindModalOpen: panel === 'wind' ? !prev.isWindModalOpen : false,
        isLayersMenuOpen: panel === 'layers' ? !prev.isLayersMenuOpen : false,
        isSettingsOpen: panel === 'settings' ? !prev.isSettingsOpen : false,
      }));
    },
    []
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      {/* 1. Tactical Interactive Map (Map-First canvas occupying whole screen) */}
      <TacticalMap
        mapDef={currentMap}
        mortar={mortar}
        target={activeTarget}
        solution={solution}
        settings={settings}
        onUpdateMortarPos={handleUpdateMortarPos}
        onUpdateTargetPos={handleUpdateTargetPos}
        onToggleTargetOverlay={handleToggleTargetOverlay}
        onToggleTargetLock={handleToggleTargetLock}
        onToggleMortarLock={handleToggleMortarLock}
        onDuplicateTarget={handleDuplicateTarget}
        onDeleteTarget={handleDeleteTarget}
      />

      {/* 2. Sleek Tactical Top Toolbar */}
      <TopToolbar
        currentMap={currentMap}
        mortar={mortar}
        target={activeTarget}
        allTargets={targets}
        solution={solution}
        settings={settings}
        onSelectMap={handleSelectMap}
        onSelectMortarSystem={(sysId) => {
          const sys = MORTAR_SYSTEMS[sysId];
          setMortar((m) => ({
            ...m,
            systemId: sysId,
            selectedAmmoId: sys.ammoTypes[0].id,
            selectedCharge: sys.ammoTypes[0].charges[0],
          }));
        }}
        onSelectAmmo={(ammoId) => setMortar((m) => ({ ...m, selectedAmmoId: ammoId }))}
        onSelectCharge={(chg) => setMortar((m) => ({ ...m, selectedCharge: chg, autoCharge: false }))}
        onToggleAutoCharge={() => setMortar((m) => ({ ...m, autoCharge: !m.autoCharge }))}
        onSelectTarget={setActiveTargetId}
        onTogglePanel={handleTogglePanel}
        onToggleLanguage={() =>
          setSettings((s) => ({ ...s, language: s.language === 'en' ? 'ar' : 'en' }))
        }
      />

      {/* 3. Live Ballistic Fire Solution Drawer */}
      {settings.isSolutionPanelOpen && (
        <BallisticPanel
          mortar={mortar}
          target={activeTarget}
          solution={solution}
          language={settings.language}
          onClose={() => setSettings((s) => ({ ...s, isSolutionPanelOpen: false }))}
          onSelectMortarSystem={(sysId) => {
            const sys = MORTAR_SYSTEMS[sysId];
            setMortar((m) => ({
              ...m,
              systemId: sysId,
              selectedAmmoId: sys.ammoTypes[0].id,
            }));
          }}
          onSelectAmmo={(ammoId) => setMortar((m) => ({ ...m, selectedAmmoId: ammoId }))}
          onSelectCharge={(chg) => setMortar((m) => ({ ...m, selectedCharge: chg, autoCharge: false }))}
          onToggleAutoCharge={() => setMortar((m) => ({ ...m, autoCharge: !m.autoCharge }))}
          onUpdateMortarAlt={(alt) =>
            setMortar((m) => ({ ...m, position: { ...m.position, z: alt } }))
          }
          onUpdateTargetAlt={(alt) =>
            setTargets((prev) =>
              prev.map((t) =>
                t.id === activeTargetId ? { ...t, position: { ...t.position, z: alt } } : t
              )
            )
          }
        />
      )}

      {/* 4. Full Verified Ballistic Table Modal */}
      {settings.isBallisticTableOpen && (
        <BallisticTable
          mortar={mortar}
          solution={solution}
          language={settings.language}
          onClose={() => setSettings((s) => ({ ...s, isBallisticTableOpen: false }))}
          onSelectCharge={(chg) => setMortar((m) => ({ ...m, selectedCharge: chg, autoCharge: false }))}
        />
      )}

      {/* 5. Target Manager & Mission Save/Load Drawer */}
      {settings.isTargetManagerOpen && (
        <TargetManager
          targets={targets}
          activeTargetId={activeTargetId}
          mortar={mortar}
          currentMapId={currentMapId}
          language={settings.language}
          onClose={() => setSettings((s) => ({ ...s, isTargetManagerOpen: false }))}
          onSelectTarget={setActiveTargetId}
          onAddTarget={handleAddTarget}
          onUpdateTarget={(updated) =>
            setTargets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
          }
          onDeleteTarget={(id) => {
            const remaining = targets.filter((t) => t.id !== id);
            setTargets(remaining);
            if (activeTargetId === id && remaining.length > 0) {
              setActiveTargetId(remaining[0].id);
            }
          }}
          onDuplicateTarget={(id) => {
            const targetToCopy = targets.find((t) => t.id === id);
            if (!targetToCopy) return;
            const newId = `tgt_${Date.now()}`;
            setTargets((prev) => [
              ...prev,
              {
                ...targetToCopy,
                id: newId,
                name: `${targetToCopy.name} (Copy)`,
                position: { ...targetToCopy.position, x: targetToCopy.position.x + 100 },
              },
            ]);
            setActiveTargetId(newId);
          }}
          onLoadMission={handleLoadMission}
        />
      )}

      {/* 6. Wind Adjustment Modal */}
      {settings.isWindModalOpen && (
        <WindModal
          wind={windSettings}
          solution={solution}
          language={settings.language}
          onClose={() => setSettings((s) => ({ ...s, isWindModalOpen: false }))}
          onUpdateWind={(w) =>
            setSettings((s) => ({
              ...s,
              windSpeed: w.speed,
              windDirectionDeg: w.directionDeg,
              windConvention: w.convention,
              windEnabled: w.enabled,
            }))
          }
        />
      )}

      {/* 7. Map Layers & Overlays Menu */}
      {settings.isLayersMenuOpen && (
        <MapLayersMenu
          settings={settings}
          language={settings.language}
          onClose={() => setSettings((s) => ({ ...s, isLayersMenuOpen: false }))}
          onUpdateSettings={(updated) => setSettings((s) => ({ ...s, ...updated }))}
        />
      )}

      {/* 8. Settings Menu */}
      {settings.isSettingsOpen && (
        <SettingsMenu
          settings={settings}
          language={settings.language}
          onClose={() => setSettings((s) => ({ ...s, isSettingsOpen: false }))}
          onUpdateSettings={(updated) => setSettings((s) => ({ ...s, ...updated }))}
          onResetSettings={() => setSettings({ ...DEFAULT_SETTINGS })}
        />
      )}
    </div>
  );
}
