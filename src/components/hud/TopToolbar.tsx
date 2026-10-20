import React from 'react';
import { MapDefinition } from '../../types/map';
import { MortarInstance, MortarId } from '../../types/mortar';
import { TargetInstance } from '../../types/target';
import { FiringSolution } from '../../types/ballistics';
import { FCSSettings, LanguageCode } from '../../types/settings';
import { SUPPORTED_MAPS } from '../../data/maps';
import { MORTAR_SYSTEMS } from '../../data/ballistics';
import { t } from '../../utils/i18n';
import {
  Layers,
  Settings,
  Table,
  Target,
  Wind,
  Compass,
  FileText,
  Languages,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';

interface TopToolbarProps {
  currentMap: MapDefinition;
  mortar: MortarInstance;
  target: TargetInstance;
  allTargets: TargetInstance[];
  solution: FiringSolution;
  settings: FCSSettings;
  onSelectMap: (mapId: string) => void;
  onSelectMortarSystem: (systemId: MortarId) => void;
  onSelectAmmo: (ammoId: string) => void;
  onSelectCharge: (charge: number) => void;
  onToggleAutoCharge: () => void;
  onSelectTarget: (targetId: string) => void;
  onTogglePanel: (panel: 'solution' | 'table' | 'targets' | 'wind' | 'layers' | 'settings') => void;
  onToggleLanguage: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  currentMap,
  mortar,
  target,
  allTargets,
  solution,
  settings,
  onSelectMap,
  onSelectMortarSystem,
  onSelectAmmo,
  onSelectCharge,
  onToggleAutoCharge,
  onSelectTarget,
  onTogglePanel,
  onToggleLanguage,
}) => {
  const lang = settings.language;
  const isArabic = lang === 'ar';
  const mortarDef = MORTAR_SYSTEMS[mortar.systemId];
  const ammoDef = mortarDef.ammoTypes.find((a) => a.id === mortar.selectedAmmoId) || mortarDef.ammoTypes[0];

  const isValid = solution.statusCode === 'VALID';

  return (
    <header
      className="absolute top-2 left-2 right-2 z-30 pointer-events-auto select-none"
      style={{ direction: isArabic ? 'rtl' : 'ltr' }}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl shadow-2xl text-slate-100 font-mono text-xs">
        {/* Left Zone: Title & Map Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <h1 className="font-bold tracking-wider text-slate-100 hidden sm:inline whitespace-nowrap">
              ARMA REFORGER <span className="text-amber-400">FCS</span>
            </h1>
          </div>

          {/* Map Selector */}
          <select
            value={currentMap.id}
            onChange={(e) => onSelectMap(e.target.value)}
            className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs rounded-md px-2 py-1 outline-none cursor-pointer font-sans"
          >
            {Object.values(SUPPORTED_MAPS).map((m) => (
              <option key={m.id} value={m.id}>
                {m.tilesAvailable ? '🗺️ ' : '⚠️ [Grid Only] '}
                {isArabic ? m.nameAr : m.name}
              </option>
            ))}
          </select>

          {/* Active Target Selector */}
          <select
            value={target.id}
            onChange={(e) => onSelectTarget(e.target.value)}
            className="bg-slate-900 border border-amber-500/40 hover:border-amber-500/70 text-amber-300 text-xs rounded-md px-2 py-1 outline-none cursor-pointer"
          >
            {allTargets.map((tgt) => (
              <option key={tgt.id} value={tgt.id}>
                🎯 {tgt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Center Zone: Live Primary Elevation & Range HUD Strip */}
        <div
          onClick={() => onTogglePanel('solution')}
          className="flex items-center gap-3 px-3 py-1 rounded-lg bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer shadow-inner shrink-0"
          title="Click to open detailed fire solution panel"
        >
          {isValid ? (
            <div className="flex items-center gap-3 font-mono tabular-nums">
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] text-slate-400 uppercase font-medium">ELV:</span>
                <span className="font-bold text-amber-400 text-sm">
                  {solution.elevationMil}m
                </span>
                <span className="text-[11px] text-amber-300/80">
                  ({solution.elevationDeg?.toFixed(1)}°)
                </span>
              </div>

              <span className="text-slate-600">|</span>

              <div className="flex items-baseline gap-1">
                <span className="text-[10px] text-slate-400 uppercase font-medium">RNG:</span>
                <span className="font-bold text-slate-200">
                  {Math.round(solution.horizontalDistance)}m
                </span>
              </div>

              <span className="text-slate-600 hidden md:inline">|</span>

              <div className="items-baseline gap-1 hidden md:flex">
                <span className="text-[10px] text-slate-400 uppercase font-medium">BRG:</span>
                <span className="font-bold text-slate-200">
                  {solution.bearingDeg.toFixed(1)}°
                </span>
              </div>

              <span className="text-slate-600 hidden lg:inline">|</span>

              <div className="items-baseline gap-1 hidden lg:flex">
                <span className="text-[10px] text-slate-400 uppercase font-medium">TOF:</span>
                <span className="font-bold text-cyan-400">
                  {solution.timeOfFlight?.toFixed(1)}s
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-rose-400 font-mono">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200 tabular-nums text-xs">
                  RNG: {Math.round(solution.horizontalDistance)}m
                </span>
                <span className="text-slate-600">|</span>
                <span className="font-bold text-xs truncate max-w-[200px] sm:max-w-none text-rose-400">
                  {solution.statusCode === 'OUT_OF_RANGE'
                    ? `OUT OF RANGE (MAX: ${solution.maxVerifiedRange ?? 4900}m)`
                    : (isArabic ? solution.statusMessageAr : solution.statusMessage)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Zone: Tactical Navigation & Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Solution Panel Button */}
          <button
            onClick={() => onTogglePanel('solution')}
            className={`p-1.5 rounded-lg border transition-all ${
              settings.isSolutionPanelOpen
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title={t('solutionPanel', lang)}
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Ballistic Table Button */}
          <button
            onClick={() => onTogglePanel('table')}
            className={`p-1.5 rounded-lg border transition-all ${
              settings.isBallisticTableOpen
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title={t('ballisticTable', lang)}
          >
            <Table className="w-4 h-4" />
          </button>

          {/* Target Manager Button */}
          <button
            onClick={() => onTogglePanel('targets')}
            className={`p-1.5 rounded-lg border transition-all ${
              settings.isTargetManagerOpen
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title={t('targetManager', lang)}
          >
            <Target className="w-4 h-4" />
          </button>

          {/* Wind Button */}
          <button
            onClick={() => onTogglePanel('wind')}
            className={`p-1.5 rounded-lg border transition-all relative ${
              settings.windEnabled
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title={t('wind', lang)}
          >
            <Wind className="w-4 h-4" />
            {settings.windEnabled && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>

          {/* Layers Button */}
          <button
            onClick={() => onTogglePanel('layers')}
            className={`p-1.5 rounded-lg border transition-all ${
              settings.isLayersMenuOpen
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title={t('layers', lang)}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => onTogglePanel('settings')}
            className={`p-1.5 rounded-lg border transition-all ${
              settings.isSettingsOpen
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title={t('settings', lang)}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="px-2 py-1 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-[11px] font-sans font-semibold transition-all"
            title="Switch Language (English / العربية)"
          >
            {isArabic ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
    </header>
  );
};
