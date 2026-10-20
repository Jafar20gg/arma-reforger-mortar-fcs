import React, { useRef } from 'react';
import { MortarInstance } from '../../types/mortar';
import { FiringSolution } from '../../types/ballistics';
import { ScreenCoordinate } from '../../types/map';
import { LanguageCode } from '../../types/settings';
import { CoordinateService } from '../../utils/coordinates';
import { t } from '../../utils/i18n';
import { Lock, Unlock } from 'lucide-react';

interface MortarMarkerProps {
  mortar: MortarInstance;
  solution: FiringSolution;
  screenPos: ScreenCoordinate;
  isActive: boolean;
  language: LanguageCode;
  onSelect: () => void;
  onStartDrag: (e: React.MouseEvent | React.TouchEvent) => void;
  onToggleLock: () => void;
}

export const MortarMarker: React.FC<MortarMarkerProps> = ({
  mortar,
  solution,
  screenPos,
  isActive,
  language,
  onSelect,
  onStartDrag,
  onToggleLock,
}) => {
  const markerRef = useRef<HTMLDivElement>(null);
  const gridCoords = CoordinateService.worldToGrid(mortar.position, 6);
  const color = mortar.color || '#06b6d4'; // Cyan for NATO / friendly mortar

  return (
    <div
      ref={markerRef}
      className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing select-none"
      style={{
        transform: `translate3d(${screenPos.x}px, ${screenPos.y}px, 0)`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => {
        if (!mortar.locked && e.button === 0) {
          onStartDrag(e);
        }
      }}
      onTouchStart={(e) => {
        if (!mortar.locked) {
          onStartDrag(e);
        }
      }}
    >
      {/* Compact Mortar Status Above Marker */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-auto font-mono text-[10px] bg-slate-950/95 border border-cyan-500/50 rounded-lg shadow-xl px-2.5 py-1.5 whitespace-nowrap text-slate-100 backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-1 mb-1">
          <span className="font-bold text-cyan-400 tracking-wide">
            {mortar.name}
          </span>
          <span className="text-slate-400 font-mono">[{gridCoords}]</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
            className="text-slate-400 hover:text-slate-200"
            title={mortar.locked ? t('unlockPosition', language) : t('lockPosition', language)}
          >
            {mortar.locked ? <Lock className="w-3 h-3 text-cyan-400" /> : <Unlock className="w-3 h-3" />}
          </button>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-300">
          <span>
            {t('mortarAlt', language)}: <strong className="text-slate-100 tabular-nums">{mortar.position.z ?? 0}m</strong>
          </span>
          <span>
            {t('charge', language)}: <strong className="text-emerald-400 tabular-nums">R-{solution.charge}</strong>
          </span>
          <span>
            {t('maxRange', language)}: <strong className="text-amber-400 tabular-nums">{CoordinateService.formatMeters(solution.horizontalDistance)}</strong>
          </span>
        </div>
      </div>

      {/* Mortar Tactical Marker Symbol */}
      <div className="relative flex items-center justify-center w-10 h-10">
        {/* Pulsing indicator if active */}
        {isActive && (
          <div
            className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-60"
            style={{ pointerEvents: 'none' }}
          />
        )}

        <svg
          viewBox="0 0 40 40"
          className="w-10 h-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          style={{ overflow: 'visible' }}
        >
          {/* Base Octagon / Circle */}
          <circle
            cx="20"
            cy="20"
            r="14"
            fill="#090d16"
            stroke={color}
            strokeWidth="2"
          />

          {/* Mortar Bipod Base Lines */}
          <line x1="12" y1="28" x2="20" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="28" x2="20" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

          {/* Tube Direction Line pointing towards target bearing */}
          <g transform={`rotate(${solution.bearingDeg}, 20, 20)`}>
            <line x1="20" y1="20" x2="20" y2="4" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="20,1 17,6 23,6" fill="#f59e0b" />
          </g>

          {/* Center Pivot */}
          <circle cx="20" cy="20" r="3.5" fill={color} />
        </svg>

        {/* Baseplate Tag */}
        <div
          className={`absolute top-full mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider whitespace-nowrap border shadow-md ${
            isActive
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
              : 'bg-slate-900/90 text-slate-300 border-slate-700/60'
          }`}
        >
          {mortar.name}
        </div>
      </div>
    </div>
  );
};
