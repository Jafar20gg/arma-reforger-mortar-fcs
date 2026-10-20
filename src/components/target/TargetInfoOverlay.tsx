import React from 'react';
import { TargetInstance } from '../../types/target';
import { FiringSolution } from '../../types/ballistics';
import { CoordinateService } from '../../utils/coordinates';
import { DistanceService } from '../../utils/distance';
import { LanguageCode } from '../../types/settings';
import { t } from '../../utils/i18n';
import { ChevronDown, ChevronUp, Lock, Unlock, Copy, Trash2 } from 'lucide-react';

interface TargetInfoOverlayProps {
  target: TargetInstance;
  solution: FiringSolution;
  language: LanguageCode;
  onToggleExpand: () => void;
  onToggleLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const TargetInfoOverlay: React.FC<TargetInfoOverlayProps> = ({
  target,
  solution,
  language,
  onToggleExpand,
  onToggleLock,
  onDuplicate,
  onDelete,
}) => {
  const isArabic = language === 'ar';
  const gridCoords = CoordinateService.worldToGrid(target.position, 6);
  const isValid = solution.statusCode === 'VALID';
  const isOutOfRange = solution.statusCode === 'OUT_OF_RANGE';
  const isLimitExceeded = solution.statusCode === 'ELEVATION_LIMIT_EXCEEDED';

  const statusBg = isValid
    ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400'
    : isOutOfRange
    ? 'bg-amber-950/90 border-amber-500/50 text-amber-400'
    : 'bg-rose-950/90 border-rose-500/50 text-rose-400';

  return (
    <div
      className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-auto select-none transition-all z-30 font-mono shadow-2xl backdrop-blur-md rounded-lg border border-slate-700/80 bg-slate-950/95 text-slate-100 ${
        target.expandedOverlay ? 'w-72' : 'w-60'
      }`}
      style={{ direction: isArabic ? 'rtl' : 'ltr' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Target Header Bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800 bg-slate-900/90 rounded-t-lg">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: target.color || '#f59e0b' }}
          />
          <span className="font-bold text-xs tracking-wider text-amber-400 truncate">
            {target.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            [{gridCoords}]
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleLock}
            title={target.locked ? t('unlockPosition', language) : t('lockPosition', language)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {target.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button
            onClick={onDuplicate}
            title={t('duplicate', language)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            title={t('delete', language)}
            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            onClick={onToggleExpand}
            title={target.expandedOverlay ? t('collapse', language) : t('expand', language)}
            className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
          >
            {target.expandedOverlay ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Primary Fire-Control Telemetry */}
      <div className="p-2 space-y-1.5 text-xs">
        {/* Required Mortar Elevation - High Contrast Military Highlight */}
        <div className="bg-slate-900/95 border border-amber-500/40 rounded p-1.5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            {t('elevation', language)}
          </span>
          {isValid ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-amber-400 font-mono tabular-nums tracking-wide">
                {solution.elevationMil} mil
              </span>
              <span className="text-xs text-amber-300/80 font-mono tabular-nums">
                ≈ {solution.elevationDeg?.toFixed(1)}°
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-rose-400 font-mono tracking-tight">
              {isArabic ? solution.statusMessageAr : solution.statusMessage}
            </span>
          )}
        </div>

        {/* Distance & Bearing Grid */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="bg-slate-900/60 rounded px-2 py-1 border border-slate-800/80">
            <span className="text-[9px] text-slate-400 block uppercase">{t('distance', language)}</span>
            <span className={`font-bold font-mono tabular-nums ${isOutOfRange ? 'text-rose-400' : 'text-slate-200'}`}>
              {CoordinateService.formatMeters(solution.horizontalDistance)}
            </span>
            {solution.maxVerifiedRange && (
              <span className="text-[9px] text-slate-400 block font-normal mt-0.5">
                Max: <strong className={isOutOfRange ? 'text-amber-400' : 'text-slate-300'}>{CoordinateService.formatMeters(solution.maxVerifiedRange)}</strong>
              </span>
            )}
          </div>

          <div className="bg-slate-900/60 rounded px-2 py-1 border border-slate-800/80">
            <span className="text-[9px] text-slate-400 block uppercase">{t('bearing', language)}</span>
            <span className="font-bold text-slate-200 font-mono tabular-nums">
              {solution.bearingDeg.toFixed(1)}° <span className="text-[10px] text-amber-400/90 font-normal">({solution.bearingMil}m)</span>
            </span>
            <span className="text-[9px] text-slate-400 block font-normal mt-0.5">
              Heading: <strong className="text-amber-300">{solution.cardinalDirection}</strong>
            </span>
          </div>
        </div>

        {/* Charge & Time of Flight */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="bg-slate-900/60 rounded px-2 py-1 border border-slate-800/80">
            <span className="text-[9px] text-slate-400 block uppercase">{t('charge', language)}</span>
            <span className="font-bold text-emerald-400 font-mono tabular-nums">
              R-{solution.charge} {solution.isAutoCharge && <span className="text-[9px] text-slate-400 font-normal">({t('autoCharge', language)})</span>}
            </span>
          </div>

          <div className="bg-slate-900/60 rounded px-2 py-1 border border-slate-800/80">
            <span className="text-[9px] text-slate-400 block uppercase">{t('tofAbbr', language)}</span>
            <span className="font-bold text-slate-200 font-mono tabular-nums">
              {solution.timeOfFlight ? `${solution.timeOfFlight.toFixed(1)}s` : '--'}
            </span>
          </div>
        </div>

        {/* Height difference & Altitudes */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5">
          <span>
            {t('targetAlt', language)}: <strong className="text-slate-200 font-mono tabular-nums">{target.position.z ?? 0}m</strong>
          </span>
          <span>
            ΔAlt: <strong className={`font-mono tabular-nums ${solution.heightDifference > 0 ? 'text-amber-400' : 'text-sky-400'}`}>
              {DistanceService.formatHeightDifference(solution.heightDifference)}
            </strong>
          </span>
        </div>

        {/* Expanded Telemetry Section */}
        {target.expandedOverlay && (
          <div className="pt-2 mt-1 border-t border-slate-800 space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>{t('worldX', language)} / {t('worldY', language)}</span>
              <span className="font-mono text-slate-200 tabular-nums">
                X:{Math.round(target.position.x)} Y:{Math.round(target.position.y)}
              </span>
            </div>
            {solution.peakAltitude !== null && (
              <div className="flex justify-between text-slate-400">
                <span>{t('peakAlt', language)}</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {solution.peakAltitude}m AGL
                </span>
              </div>
            )}
            {solution.impactAngleDeg !== null && (
              <div className="flex justify-between text-slate-400">
                <span>{t('impactAngle', language)}</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {solution.impactAngleDeg}°
                </span>
              </div>
            )}
            {solution.dispersionMeters !== null && (
              <div className="flex justify-between text-slate-400">
                <span>{t('dispersion', language)}</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  ±{solution.dispersionMeters}m
                </span>
              </div>
            )}
            {solution.windApplied && (
              <div className="flex justify-between text-amber-400">
                <span>Wind Adj.</span>
                <span className="font-mono tabular-nums">
                  Az: {solution.crosswindDeflectionMil ?? 0} mil · Rng: {solution.headwindCorrectionMeters ?? 0}m
                </span>
              </div>
            )}
            {solution.isInterpolated && (
              <div className="text-[9px] text-cyan-400 text-center pt-0.5">
                [{t('statusInterpolated', language)}]
              </div>
            )}
          </div>
        )}

        {/* Status Strip */}
        <div className={`px-2 py-0.5 rounded text-[9px] text-center font-bold tracking-wider uppercase border ${statusBg}`}>
          {isArabic ? solution.statusMessageAr : solution.statusMessage}
        </div>
      </div>

      {/* Downward indicator pointer triangle */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-slate-800" />
    </div>
  );
};
