import React, { useState, useEffect } from 'react';
import { WorldCoordinate, MapDefinition } from '../../types/map';
import { MortarInstance } from '../../types/mortar';
import { TargetInstance } from '../../types/target';
import { LanguageCode } from '../../types/settings';
import { CoordinateService } from '../../utils/coordinates';
import { t } from '../../utils/i18n';
import { X, Check, Lock, Unlock, Compass, Target, MapPin } from 'lucide-react';

interface QuickCoordsModalProps {
  mapDef: MapDefinition;
  mortar: MortarInstance;
  target: TargetInstance;
  language: LanguageCode;
  onClose: () => void;
  onApply: (mortarPos: WorldCoordinate, targetPos: WorldCoordinate) => void;
}

export const QuickCoordsModal: React.FC<QuickCoordsModalProps> = ({
  mapDef,
  mortar,
  target,
  language,
  onClose,
  onApply,
}) => {
  const isArabic = language === 'ar';

  // Mortar Form State
  const [mortarX, setMortarX] = useState<number>(Math.round(mortar.position.x));
  const [mortarY, setMortarY] = useState<number>(Math.round(mortar.position.y));
  const [mortarZ, setMortarZ] = useState<number>(Math.round(mortar.position.z ?? 0));
  const [mortarGrid, setMortarGrid] = useState<string>(CoordinateService.worldToGrid(mortar.position, 6));

  // Target Form State
  const [targetX, setTargetX] = useState<number>(Math.round(target.position.x));
  const [targetY, setTargetY] = useState<number>(Math.round(target.position.y));
  const [targetZ, setTargetZ] = useState<number>(Math.round(target.position.z ?? 0));
  const [targetGrid, setTargetGrid] = useState<string>(CoordinateService.worldToGrid(target.position, 6));

  // Sync grid when X/Y change
  const handleMortarXYChange = (x: number, y: number) => {
    setMortarX(x);
    setMortarY(y);
    setMortarGrid(CoordinateService.worldToGrid({ x, y }, 6));
  };

  const handleTargetXYChange = (x: number, y: number) => {
    setTargetX(x);
    setTargetY(y);
    setTargetGrid(CoordinateService.worldToGrid({ x, y }, 6));
  };

  // Sync X/Y when Grid changes
  const handleMortarGridChange = (gridStr: string) => {
    setMortarGrid(gridStr);
    const parsed = CoordinateService.gridToWorld(gridStr, mapDef.bounds);
    if (parsed) {
      setMortarX(Math.round(parsed.x));
      setMortarY(Math.round(parsed.y));
    }
  };

  const handleTargetGridChange = (gridStr: string) => {
    setTargetGrid(gridStr);
    const parsed = CoordinateService.gridToWorld(gridStr, mapDef.bounds);
    if (parsed) {
      setTargetX(Math.round(parsed.x));
      setTargetY(Math.round(parsed.y));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clampedMortar = CoordinateService.clampToBounds(
      { x: mortarX, y: mortarY, z: mortarZ },
      mapDef.bounds
    );
    const clampedTarget = CoordinateService.clampToBounds(
      { x: targetX, y: targetY, z: targetZ },
      mapDef.bounds
    );
    onApply(clampedMortar, clampedTarget);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 select-none"
      onClick={onClose}
      style={{ direction: isArabic ? 'rtl' : 'ltr' }}
    >
      <div
        className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-xl shadow-2xl flex flex-col font-mono text-xs text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-sm tracking-wider text-slate-100 uppercase">
              {t('quickCoords', language)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Mortar Coordinates Section */}
          <div className="p-3 bg-slate-900/70 border border-cyan-500/30 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between text-cyan-400 font-bold text-xs uppercase">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{mortar.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">
                {mapDef.name} [{mapDef.width}m × {mapDef.height}m]
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">
                  {t('grid', language)} (6 or 8 digits)
                </label>
                <input
                  type="text"
                  value={mortarGrid}
                  onChange={(e) => handleMortarGridChange(e.target.value)}
                  placeholder="e.g. 052 068"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-slate-100 font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">
                  {t('altitude', language)} (meters ASL)
                </label>
                <input
                  type="number"
                  value={mortarZ}
                  onChange={(e) => setMortarZ(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-slate-100 font-mono text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">{t('worldX', language)} (East)</label>
                <input
                  type="number"
                  value={mortarX}
                  onChange={(e) => handleMortarXYChange(Number(e.target.value), mortarY)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-slate-100 font-mono text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">{t('worldY', language)} (North)</label>
                <input
                  type="number"
                  value={mortarY}
                  onChange={(e) => handleMortarXYChange(mortarX, Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-2 py-1 text-slate-100 font-mono text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Target Coordinates Section */}
          <div className="p-3 bg-slate-900/70 border border-amber-500/30 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between text-amber-400 font-bold text-xs uppercase">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                <span>{target.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">
                  {t('grid', language)} (6 or 8 digits)
                </label>
                <input
                  type="text"
                  value={targetGrid}
                  onChange={(e) => handleTargetGridChange(e.target.value)}
                  placeholder="e.g. 064 076"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-2 py-1 text-slate-100 font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">
                  {t('altitude', language)} (meters ASL)
                </label>
                <input
                  type="number"
                  value={targetZ}
                  onChange={(e) => setTargetZ(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-2 py-1 text-slate-100 font-mono text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">{t('worldX', language)} (East)</label>
                <input
                  type="number"
                  value={targetX}
                  onChange={(e) => handleTargetXYChange(Number(e.target.value), targetY)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-2 py-1 text-slate-100 font-mono text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">{t('worldY', language)} (North)</label>
                <input
                  type="number"
                  value={targetY}
                  onChange={(e) => handleTargetXYChange(targetX, Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-2 py-1 text-slate-100 font-mono text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {t('close', language)}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md shadow-md transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{t('applyCoords', language)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
