import React from 'react';
import { FiringSolution } from '../../types/ballistics';
import { MortarInstance, MortarId } from '../../types/mortar';
import { TargetInstance } from '../../types/target';
import { LanguageCode } from '../../types/settings';
import { MORTAR_SYSTEMS, ALL_BALLISTIC_TABLES } from '../../data/ballistics';
import { CoordinateService } from '../../utils/coordinates';
import { DistanceService } from '../../utils/distance';
import { t } from '../../utils/i18n';
import { X, Check, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface BallisticPanelProps {
  mortar: MortarInstance;
  target: TargetInstance;
  solution: FiringSolution;
  language: LanguageCode;
  onClose: () => void;
  onSelectMortarSystem: (systemId: MortarId) => void;
  onSelectAmmo: (ammoId: string) => void;
  onSelectCharge: (charge: number) => void;
  onToggleAutoCharge: () => void;
  onUpdateMortarAlt: (alt: number) => void;
  onUpdateTargetAlt: (alt: number) => void;
}

export const BallisticPanel: React.FC<BallisticPanelProps> = ({
  mortar,
  target,
  solution,
  language,
  onClose,
  onSelectMortarSystem,
  onSelectAmmo,
  onSelectCharge,
  onToggleAutoCharge,
  onUpdateMortarAlt,
  onUpdateTargetAlt,
}) => {
  const isArabic = language === 'ar';
  const mortarDef = MORTAR_SYSTEMS[mortar.systemId];
  const ammoTable = ALL_BALLISTIC_TABLES[mortar.selectedAmmoId];
  const isValid = solution.statusCode === 'VALID';

  const availableCharges = ammoTable ? Object.keys(ammoTable.charges).map(Number).sort((a, b) => a - b) : [];

  return (
    <div
      className="absolute top-14 right-2 bottom-14 w-84 max-w-[calc(100vw-1rem)] bg-slate-950/95 backdrop-blur-lg border border-slate-800 rounded-xl shadow-2xl z-40 flex flex-col font-mono text-xs text-slate-100 select-none overflow-hidden"
      style={{ direction: isArabic ? 'rtl' : 'ltr' }}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <h2 className="font-bold text-xs tracking-wider text-slate-100 uppercase">
            {t('solutionPanel', language)}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Solution Primary Hero Box */}
        <div className="p-3 bg-slate-900 border border-amber-500/40 rounded-lg flex flex-col items-center justify-center text-center shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {t('elevation', language)}
          </span>
          {isValid ? (
            <div className="my-1">
              <div className="text-2xl font-black text-amber-400 font-mono tabular-nums tracking-tight">
                {solution.elevationMil} <span className="text-base font-normal text-amber-300">mil</span>
              </div>
              <div className="text-xs text-slate-400 font-mono tabular-nums">
                ≈ {solution.elevationDeg?.toFixed(1)}° · {t('tofAbbr', language)}: <strong className="text-slate-200">{solution.timeOfFlight}s</strong>
              </div>
            </div>
          ) : (
            <div className="my-1.5 flex items-center gap-1.5 text-rose-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{isArabic ? solution.statusMessageAr : solution.statusMessage}</span>
            </div>
          )}

          {/* Solution status badge */}
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{ammoTable?.verificationStatus === 'verified' ? 'Arma Reforger Verified (1.2+)' : 'Provisional Data'}</span>
          </div>
        </div>

        {/* Mortar & Ammunition Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400">
            {t('mortar', language)} & {t('ammunition', language)}
          </label>
          <select
            value={mortar.systemId}
            onChange={(e) => onSelectMortarSystem(e.target.value as MortarId)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200 text-xs font-sans outline-none"
          >
            {Object.values(MORTAR_SYSTEMS).map((sys) => (
              <option key={sys.id} value={sys.id}>
                {isArabic ? sys.nameAr : sys.name} ({sys.milCircle} mil)
              </option>
            ))}
          </select>

          <select
            value={mortar.selectedAmmoId}
            onChange={(e) => onSelectAmmo(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200 text-xs font-sans outline-none"
          >
            {mortarDef.ammoTypes.map((ammo) => (
              <option key={ammo.id} value={ammo.id}>
                {isArabic ? ammo.nameAr : ammo.name}
              </option>
            ))}
          </select>
        </div>

        {/* Charge / Ring Selection Matrix */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold uppercase text-slate-400">{t('chargeRing', language)}</span>
            <button
              onClick={onToggleAutoCharge}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                mortar.autoCharge
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('autoCharge', language)}: {mortar.autoCharge ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {availableCharges.map((chg) => {
              const chgTable = ammoTable?.charges[chg];
              const isSelected = solution.charge === chg;
              const canReach = chgTable && solution.horizontalDistance >= chgTable.minRange && solution.horizontalDistance <= chgTable.maxRange;

              return (
                <button
                  key={chg}
                  onClick={() => onSelectCharge(chg)}
                  className={`py-1.5 px-1 rounded border text-center transition-all ${
                    isSelected
                      ? 'bg-amber-500/30 border-amber-500 text-amber-300 font-bold'
                      : canReach
                      ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'bg-slate-950 border-slate-800/80 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="text-[11px]">R-{chg}</div>
                  <div className="text-[8px] opacity-75 font-mono">
                    {chgTable ? `${chgTable.maxRange}m` : '--'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Altitude & Elevation Adjustments */}
        <div className="space-y-1.5 border-t border-slate-800 pt-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            {t('altDiff', language)}
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400 block">{t('mortarAlt', language)}</span>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={mortar.position.z ?? 0}
                  onChange={(e) => onUpdateMortarAlt(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-slate-100 font-mono text-xs outline-none"
                />
                <span className="text-slate-400 text-[10px]">m</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400 block">{t('targetAlt', language)}</span>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={target.position.z ?? 0}
                  onChange={(e) => onUpdateTargetAlt(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-slate-100 font-mono text-xs outline-none"
                />
                <span className="text-slate-400 text-[10px]">m</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center px-1 text-[10px] text-slate-400 pt-1">
            <span>ΔAltitude: <strong className="text-slate-200">{DistanceService.formatHeightDifference(solution.heightDifference)}</strong></span>
            <span>Correction: <strong className="text-amber-400">{solution.heightCorrectionMil ?? 0} mil</strong></span>
          </div>
        </div>

        {/* Detailed Geometric Readout */}
        <div className="space-y-1 border-t border-slate-800 pt-2 text-[11px]">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            {t('coordinates', language)} & Vector
          </span>
          <div className="flex justify-between text-slate-300">
            <span>{t('distance', language)}</span>
            <span className="font-bold tabular-nums text-slate-100">{CoordinateService.formatMeters(solution.horizontalDistance)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>{t('slantRange', language)}</span>
            <span className="tabular-nums text-slate-200">{CoordinateService.formatMeters(solution.slantDistance)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>{t('bearing', language)}</span>
            <span className="font-bold tabular-nums text-slate-100">{solution.bearingDeg.toFixed(1)}° ({solution.bearingMil} mil)</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Mortar Grid</span>
            <span className="font-mono tabular-nums text-slate-200">{CoordinateService.worldToGrid(mortar.position, 8)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Target Grid</span>
            <span className="font-mono tabular-nums text-amber-300">{CoordinateService.worldToGrid(target.position, 8)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
