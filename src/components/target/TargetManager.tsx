import React, { useState } from 'react';
import { TargetInstance } from '../../types/target';
import { MortarInstance } from '../../types/mortar';
import { LanguageCode } from '../../types/settings';
import { CoordinateService } from '../../utils/coordinates';
import { DistanceService } from '../../utils/distance';
import { BearingService } from '../../utils/bearing';
import { SavedMission, StorageService } from '../../services/storageService';
import { t } from '../../utils/i18n';
import {
  X,
  Plus,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Save,
  Download,
  Upload,
  FolderOpen,
  Target as TargetIcon,
} from 'lucide-react';

interface TargetManagerProps {
  targets: TargetInstance[];
  activeTargetId: string;
  mortar: MortarInstance;
  currentMapId: string;
  language: LanguageCode;
  onClose: () => void;
  onSelectTarget: (id: string) => void;
  onAddTarget: () => void;
  onUpdateTarget: (target: TargetInstance) => void;
  onDeleteTarget: (id: string) => void;
  onDuplicateTarget: (id: string) => void;
  onLoadMission: (mission: SavedMission) => void;
}

export const TargetManager: React.FC<TargetManagerProps> = ({
  targets,
  activeTargetId,
  mortar,
  currentMapId,
  language,
  onClose,
  onSelectTarget,
  onAddTarget,
  onUpdateTarget,
  onDeleteTarget,
  onDuplicateTarget,
  onLoadMission,
}) => {
  const isArabic = language === 'ar';
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [missionName, setMissionName] = useState('');
  const [savedMissions, setSavedMissions] = useState<SavedMission[]>(() => StorageService.loadMissions());

  const handleSaveMission = () => {
    if (!missionName.trim()) return;
    const newMission: SavedMission = {
      id: `mission_${Date.now()}`,
      name: missionName.trim(),
      savedAt: new Date().toISOString(),
      mapId: currentMapId,
      mortars: [mortar],
      targets,
    };
    StorageService.saveMission(newMission);
    setSavedMissions(StorageService.loadMissions());
    setMissionName('');
  };

  const handleDeleteMission = (id: string) => {
    StorageService.deleteMission(id);
    setSavedMissions(StorageService.loadMissions());
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.targets && parsed.mortars) {
          onLoadMission(parsed);
          onClose();
        }
      } catch {
        alert('Invalid mission JSON file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 select-none"
      onClick={onClose}
      style={{ direction: isArabic ? 'rtl' : 'ltr' }}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-slate-950 border border-slate-800 rounded-xl shadow-2xl flex flex-col font-mono text-xs text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <TargetIcon className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-sm tracking-wider text-slate-100 uppercase">
              {t('targetManager', language)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Target List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {t('targets', language)} ({targets.length})
              </span>
              <button
                onClick={onAddTarget}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addTarget', language)}</span>
              </button>
            </div>

            <div className="space-y-2">
              {targets.map((tgt) => {
                const isActive = tgt.id === activeTargetId;
                const isEditing = tgt.id === editingTargetId;
                const dist = DistanceService.calculateHorizontalDistance(mortar.position, tgt.position);
                const brg = BearingService.calculateBearingDeg(mortar.position, tgt.position);

                return (
                  <div
                    key={tgt.id}
                    onClick={() => onSelectTarget(tgt.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900/90 border-amber-500 shadow-md'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tgt.color }}
                        />
                        <span className="font-bold text-sm text-slate-100">{tgt.name}</span>
                        {isActive && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded font-bold">
                            {t('activeTarget', language)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onUpdateTarget({ ...tgt, locked: !tgt.locked })}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title={tgt.locked ? t('unlockPosition', language) : t('lockPosition', language)}
                        >
                          {tgt.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onDuplicateTarget(tgt.id)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title={t('duplicate', language)}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {targets.length > 1 && (
                          <button
                            onClick={() => onDeleteTarget(tgt.id)}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title={t('delete', language)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Coordinates & Vector Readout */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">{t('grid', language)}</span>
                        <span className="font-mono tabular-nums text-amber-300">{CoordinateService.worldToGrid(tgt.position, 6)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">{t('distance', language)}</span>
                        <span className="font-mono tabular-nums">{Math.round(dist)}m</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">{t('bearing', language)}</span>
                        <span className="font-mono tabular-nums">{brg.toFixed(1)}°</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">{t('altitude', language)}</span>
                        <span className="font-mono tabular-nums">{tgt.position.z ?? 0}m</span>
                      </div>
                    </div>

                    {/* Manual Coordinate / Altitude Quick-Edit */}
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-slate-400">X:</span>
                        <input
                          type="number"
                          value={Math.round(tgt.position.x)}
                          onChange={(e) =>
                            onUpdateTarget({
                              ...tgt,
                              position: { ...tgt.position, x: Number(e.target.value) },
                            })
                          }
                          className="w-18 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-slate-100 font-mono text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-slate-400">Y:</span>
                        <input
                          type="number"
                          value={Math.round(tgt.position.y)}
                          onChange={(e) =>
                            onUpdateTarget({
                              ...tgt,
                              position: { ...tgt.position, y: Number(e.target.value) },
                            })
                          }
                          className="w-18 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-slate-100 font-mono text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-slate-400">Z:</span>
                        <input
                          type="number"
                          value={tgt.position.z ?? 0}
                          onChange={(e) =>
                            onUpdateTarget({
                              ...tgt,
                              position: { ...tgt.position, z: Number(e.target.value) },
                            })
                          }
                          className="w-14 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-slate-100 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Missions Management Section */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {t('missions', language)} (Local Missions Storage)
            </span>

            {/* Save Mission Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                placeholder="Mission name (e.g. Operation Everon West)..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 text-xs placeholder:text-slate-500 outline-none"
              />
              <button
                onClick={handleSaveMission}
                disabled={!missionName.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 font-bold rounded-md transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Mission</span>
              </button>
            </div>

            {/* Saved Missions List */}
            {savedMissions.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {savedMissions.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{m.name}</div>
                      <div className="text-[9px] text-slate-500">
                        Map: {m.mapId} · {m.targets.length} targets · {new Date(m.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onLoadMission(m);
                          onClose();
                        }}
                        className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded hover:bg-amber-500/30 font-bold"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => StorageService.exportMissionToFile(m)}
                        title="Export JSON"
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMission(m.id)}
                        title="Delete"
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Import JSON */}
            <div className="pt-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-md cursor-pointer text-slate-300 hover:text-slate-100 text-xs transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{t('importMission', language)} (JSON)</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
