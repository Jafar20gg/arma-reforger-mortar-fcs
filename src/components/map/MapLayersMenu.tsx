import React from 'react';
import { FCSSettings, LanguageCode } from '../../types/settings';
import { MapLayerType } from '../../types/map';
import { t } from '../../utils/i18n';
import { X, Layers, Check } from 'lucide-react';

interface MapLayersMenuProps {
  settings: FCSSettings;
  language: LanguageCode;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<FCSSettings>) => void;
}

export const MapLayersMenu: React.FC<MapLayersMenuProps> = ({
  settings,
  language,
  onClose,
  onUpdateSettings,
}) => {
  const isArabic = language === 'ar';

  const layers: { id: MapLayerType; nameKey: string; desc: string }[] = [
    { id: 'topo', nameKey: 'layerTopo', desc: 'Detailed elevation contours, terrain features, and road networks.' },
    { id: 'satellite', nameKey: 'layerSatellite', desc: 'Reconnaissance terrain shading with dark satellite styling.' },
    { id: 'night', nameKey: 'layerNight', desc: 'Green FLIR thermal phosphor night operations.' },
    { id: 'minimal', nameKey: 'layerMinimal', desc: 'Clean high-contrast vector grid.' },
  ];

  return (
    <div
      className="absolute top-14 right-2 w-80 max-w-[calc(100vw-1rem)] bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl z-40 flex flex-col font-mono text-xs text-slate-100 select-none overflow-hidden"
      style={{ direction: isArabic ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h2 className="font-bold text-xs tracking-wider text-slate-100 uppercase">
            {t('layers', language)} & Tactical Overlays
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 max-h-[75vh] overflow-y-auto">
        {/* Map Theme / Base Layer */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Map Style / Base Layer
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {layers.map((l) => (
              <button
                key={l.id}
                onClick={() => onUpdateSettings({ activeLayer: l.id })}
                className={`p-2 rounded-lg border text-left transition-all ${
                  settings.activeLayer === l.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">{t(l.nameKey as any, language)}</span>
                  {settings.activeLayer === l.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tactical Overlays Toggles */}
        <div className="space-y-2 border-t border-slate-800 pt-2.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Tactical Overlays
          </span>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <span className="text-slate-200">{t('gridLines', language)}</span>
            <input
              type="checkbox"
              checked={settings.showGridMajor}
              onChange={(e) => onUpdateSettings({ showGridMajor: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <span className="text-slate-200">{t('maxRangeRing', language)}</span>
            <input
              type="checkbox"
              checked={settings.showMaxRangeRing}
              onChange={(e) => onUpdateSettings({ showMaxRangeRing: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <span className="text-slate-200">{t('targetDistanceRing', language)}</span>
            <input
              type="checkbox"
              checked={settings.showTargetDistanceRing}
              onChange={(e) => onUpdateSettings({ showTargetDistanceRing: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <span className="text-slate-200">{t('customDistanceRings', language)}</span>
            <input
              type="checkbox"
              checked={settings.showCustomRings}
              onChange={(e) => onUpdateSettings({ showCustomRings: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <span className="text-slate-200">{t('distanceLine', language)}</span>
            <input
              type="checkbox"
              checked={settings.showDistanceLine}
              onChange={(e) => onUpdateSettings({ showDistanceLine: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <span className="text-slate-200">{t('bearingLine', language)}</span>
            <input
              type="checkbox"
              checked={settings.showBearingLine}
              onChange={(e) => onUpdateSettings({ showBearingLine: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <span className="text-slate-200">{t('landmarks', language)}</span>
            <input
              type="checkbox"
              checked={settings.showMapLabels}
              onChange={(e) => onUpdateSettings({ showMapLabels: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <span className="text-slate-200">{t('contours', language)}</span>
            <input
              type="checkbox"
              checked={settings.showElevationContours}
              onChange={(e) => onUpdateSettings({ showElevationContours: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <span className="text-slate-200">Compass Rose Overlay</span>
            <input
              type="checkbox"
              checked={settings.showCompassRose}
              onChange={(e) => onUpdateSettings({ showCompassRose: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <span className="text-slate-200">{t('targetHudAbove', language)}</span>
            <input
              type="checkbox"
              checked={settings.showTargetOverlay}
              onChange={(e) => onUpdateSettings({ showTargetOverlay: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
            <span className="text-slate-200">{t('arabicTranslit', language)}</span>
            <input
              type="checkbox"
              checked={settings.showArabicLandmarks}
              onChange={(e) => onUpdateSettings({ showArabicLandmarks: e.target.checked })}
              className="accent-amber-500 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
