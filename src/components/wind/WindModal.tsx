import React from 'react';
import { WindSettings, FiringSolution } from '../../types/ballistics';
import { LanguageCode } from '../../types/settings';
import { t } from '../../utils/i18n';
import { X, Wind, RotateCcw } from 'lucide-react';

interface WindModalProps {
  wind: WindSettings;
  solution: FiringSolution;
  language: LanguageCode;
  onClose: () => void;
  onUpdateWind: (wind: WindSettings) => void;
}

export const WindModal: React.FC<WindModalProps> = ({
  wind,
  solution,
  language,
  onClose,
  onUpdateWind,
}) => {
  const isArabic = language === 'ar';

  const resetZero = () => {
    onUpdateWind({
      ...wind,
      speed: 0,
      directionDeg: 0,
      enabled: false,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 select-none"
      onClick={onClose}
      style={{ direction: isArabic ? 'rtl' : 'ltr' }}
    >
      <div
        className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl shadow-2xl flex flex-col font-mono text-xs text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-sm tracking-wider text-slate-100 uppercase">
              {t('wind', language)} & Tactical Atmospheric Correction
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Toggle Enable */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div>
              <div className="font-bold text-slate-200">{t('windEnabled', language)}</div>
              <div className="text-[10px] text-slate-400">Apply ballistic wind deflection to firing solution</div>
            </div>
            <button
              onClick={() => onUpdateWind({ ...wind, enabled: !wind.enabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                wind.enabled ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Speed Slider & Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">{t('windSpeed', language)}</span>
              <span className="text-cyan-400 font-bold font-mono text-sm">{wind.speed} m/s</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={wind.speed}
              onChange={(e) => onUpdateWind({ ...wind, speed: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>0 m/s (Calm)</span>
              <span>10 m/s (Moderate)</span>
              <span>25 m/s (Gale)</span>
            </div>
          </div>

          {/* Direction Slider & Compass Dial */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">{t('windDirection', language)}</span>
              <span className="text-cyan-400 font-bold font-mono text-sm">{wind.directionDeg}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              step="1"
              value={wind.directionDeg}
              onChange={(e) => onUpdateWind({ ...wind, directionDeg: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Wind Convention (FROM vs TOWARD) */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('windConvention', language)}</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateWind({ ...wind, convention: 'FROM' })}
                className={`py-1.5 px-2 rounded border text-center transition-all ${
                  wind.convention === 'FROM'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {t('windFrom', language)}
              </button>
              <button
                onClick={() => onUpdateWind({ ...wind, convention: 'TOWARD' })}
                className={`py-1.5 px-2 rounded border text-center transition-all ${
                  wind.convention === 'TOWARD'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {t('windToward', language)}
              </button>
            </div>
          </div>

          {/* Live Correction Readout */}
          {wind.enabled && wind.speed > 0 && (
            <div className="p-3 bg-slate-900/90 border border-cyan-500/30 rounded-lg space-y-1.5 text-[11px]">
              <div className="font-bold text-cyan-400 text-xs">Calculated Wind Correction:</div>
              <div className="flex justify-between text-slate-300">
                <span>{t('crosswindMils', language)}</span>
                <span className="font-bold font-mono tabular-nums text-amber-300">
                  {solution.crosswindDeflectionMil ?? 0} mil
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{t('rangeWindMeters', language)}</span>
                <span className="font-bold font-mono tabular-nums text-amber-300">
                  {solution.headwindCorrectionMeters ?? 0} m
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              onClick={resetZero}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('resetZeroWind', language)}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md transition-colors"
            >
              {t('close', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
