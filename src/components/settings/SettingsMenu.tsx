import React from 'react';
import { FCSSettings, LanguageCode } from '../../types/settings';
import { DEFAULT_SETTINGS } from '../../services/storageService';
import { t } from '../../utils/i18n';
import { X, Settings, RotateCcw, Globe, Sliders, Shield } from 'lucide-react';

interface SettingsMenuProps {
  settings: FCSSettings;
  language: LanguageCode;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<FCSSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  settings,
  language,
  onClose,
  onUpdateSettings,
  onResetSettings,
}) => {
  const isArabic = language === 'ar';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 select-none"
      onClick={onClose}
      style={{ direction: isArabic ? 'rtl' : 'ltr' }}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] bg-slate-950 border border-slate-800 rounded-xl shadow-2xl flex flex-col font-mono text-xs text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-sm tracking-wider text-slate-100 uppercase">
              {t('settings', language)} & Fire-Control Parameters
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Language & Localization */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold uppercase text-[10px]">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('catLanguage', language)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  settings.language === 'en'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-sans font-bold">English (US)</div>
                <div className="text-[10px] text-slate-400">Standard NATO terms & left-to-right</div>
              </button>

              <button
                onClick={() => onUpdateSettings({ language: 'ar' })}
                className={`p-2.5 rounded-lg border text-right transition-all ${
                  settings.language === 'ar'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-sans font-bold">العربية (Arabic)</div>
                <div className="text-[10px] text-slate-400">واجهة عربية كاملة من اليمين إلى اليسار</div>
              </button>
            </div>
          </div>

          {/* Unit & Mil System Format */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold uppercase text-[10px]">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('catBallistics', language)}</span>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400">Elevation & Angle Units Display:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'mil_deg', label: 'Mils & Degrees (800 mil ≈ 45.0°)' },
                  { id: 'mil_only', label: 'Mils Only (800 mil)' },
                  { id: 'deg_only', label: 'Degrees Only (45.0°)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onUpdateSettings({ preferredMilFormat: item.id as any })}
                    className={`p-2 rounded-lg border text-center text-[10px] transition-all ${
                      settings.preferredMilFormat === item.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Range Rings Configuration */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <span className="text-[10px] text-slate-300 font-bold uppercase block">
              Tactical Range Rings (Physical Meters)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {settings.customRangeRings.map((ring, idx) => (
                <label
                  key={ring.distance}
                  className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-[11px] cursor-pointer"
                >
                  <span style={{ color: ring.color }}>{ring.label}</span>
                  <input
                    type="checkbox"
                    checked={ring.enabled}
                    onChange={(e) => {
                      const updated = [...settings.customRangeRings];
                      updated[idx] = { ...updated[idx], enabled: e.target.checked };
                      onUpdateSettings({ customRangeRings: updated });
                    }}
                    className="accent-amber-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Reset Defaults */}
          <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
            <button
              onClick={onResetSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('resetDefaults', language)}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md transition-colors"
            >
              {t('close', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
