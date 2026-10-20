import React, { useState } from 'react';
import { MortarInstance } from '../../types/mortar';
import { FiringSolution } from '../../types/ballistics';
import { LanguageCode } from '../../types/settings';
import { ALL_BALLISTIC_TABLES, MORTAR_SYSTEMS } from '../../data/ballistics';
import { t } from '../../utils/i18n';
import { X, Search, ShieldCheck, Filter } from 'lucide-react';

interface BallisticTableProps {
  mortar: MortarInstance;
  solution: FiringSolution;
  language: LanguageCode;
  onClose: () => void;
  onSelectCharge: (charge: number) => void;
}

export const BallisticTable: React.FC<BallisticTableProps> = ({
  mortar,
  solution,
  language,
  onClose,
  onSelectCharge,
}) => {
  const isArabic = language === 'ar';
  const mortarDef = MORTAR_SYSTEMS[mortar.systemId];
  const ammoTable = ALL_BALLISTIC_TABLES[mortar.selectedAmmoId];

  const [activeCharge, setActiveCharge] = useState<number>(solution.charge);
  const [searchRange, setSearchRange] = useState<string>('');

  if (!ammoTable) return null;

  const availableCharges = Object.keys(ammoTable.charges).map(Number).sort((a, b) => a - b);
  const selectedTable = ammoTable.charges[activeCharge] || ammoTable.charges[availableCharges[0]];

  // Filter entries
  const entries = selectedTable ? selectedTable.entries.filter((e) => {
    if (!searchRange) return true;
    return e.range.toString().includes(searchRange);
  }) : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 select-none"
      onClick={onClose}
      style={{ direction: isArabic ? 'rtl' : 'ltr' }}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] bg-slate-950 border border-slate-800 rounded-xl shadow-2xl flex flex-col font-mono text-xs text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Table Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <h2 className="font-bold text-sm tracking-wider text-slate-100">
                {t('ballisticTable', language)} — {mortarDef.name}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              {ammoTable.ammoName} · {ammoTable.dataSource}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Charge Tabs & Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
          {/* Charge Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">
              {t('charge', language)}:
            </span>
            {availableCharges.map((chg) => (
              <button
                key={chg}
                onClick={() => {
                  setActiveCharge(chg);
                  onSelectCharge(chg);
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  activeCharge === chg
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Charge {chg}
              </button>
            ))}
          </div>

          {/* Range Search Filter */}
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchRange}
              onChange={(e) => setSearchRange(e.target.value)}
              placeholder={t('searchRange', language)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md pl-8 pr-2 py-1 text-slate-200 text-xs placeholder:text-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Tabular Data View */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-[11px]" style={{ direction: isArabic ? 'rtl' : 'ltr' }}>
            <thead className="sticky top-0 bg-slate-900/95 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2 px-3">{t('colRange', language)}</th>
                <th className="py-2 px-3 text-amber-400">{t('colElevationMil', language)}</th>
                <th className="py-2 px-3">{t('colElevationDeg', language)}</th>
                <th className="py-2 px-3 text-cyan-400">{t('colToF', language)}</th>
                <th className="py-2 px-3">{t('colHeightCorr', language)}</th>
                <th className="py-2 px-3 hidden sm:table-cell">{t('colPeakAlt', language)}</th>
                <th className="py-2 px-3 hidden sm:table-cell">{t('colAngle', language)}</th>
                <th className="py-2 px-3 hidden md:table-cell">{t('colDispersion', language)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
              {entries.map((entry) => {
                const isClosest =
                  Math.abs(entry.range - solution.horizontalDistance) < 25 &&
                  solution.charge === activeCharge;

                return (
                  <tr
                    key={entry.range}
                    className={`transition-colors ${
                      isClosest
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-3 font-bold text-slate-100">
                      {entry.range}m {isClosest && <span className="text-[9px] text-amber-400 ml-1">● [TGT]</span>}
                    </td>
                    <td className="py-2 px-3 font-bold text-amber-400">
                      {entry.elevationMil} mil
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {entry.elevationDeg.toFixed(1)}°
                    </td>
                    <td className="py-2 px-3 text-cyan-300 font-bold">
                      {entry.timeOfFlight.toFixed(1)}s
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {entry.heightCorrectionMilPer100m ?? '--'}
                    </td>
                    <td className="py-2 px-3 text-slate-400 hidden sm:table-cell">
                      {entry.peakAltitude ?? '--'}m
                    </td>
                    <td className="py-2 px-3 text-slate-400 hidden sm:table-cell">
                      {entry.impactAngleDeg ?? '--'}°
                    </td>
                    <td className="py-2 px-3 text-slate-400 hidden md:table-cell">
                      ±{entry.dispersionMeters ?? '--'}m
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Notes */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-[10px] text-slate-400 font-sans">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{ammoTable.notes || 'Vanilla verified mortar ballistics.'}</span>
          </div>
          <span>Showing {entries.length} range records</span>
        </div>
      </div>
    </div>
  );
};
