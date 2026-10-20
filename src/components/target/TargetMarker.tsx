import React, { useRef } from 'react';
import { TargetInstance } from '../../types/target';
import { FiringSolution } from '../../types/ballistics';
import { ScreenCoordinate } from '../../types/map';
import { LanguageCode } from '../../types/settings';
import { TargetInfoOverlay } from './TargetInfoOverlay';

interface TargetMarkerProps {
  target: TargetInstance;
  solution: FiringSolution;
  screenPos: ScreenCoordinate;
  isActive: boolean;
  language: LanguageCode;
  onSelect: () => void;
  onStartDrag: (e: React.MouseEvent | React.TouchEvent) => void;
  onToggleExpand: () => void;
  onToggleLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const TargetMarker: React.FC<TargetMarkerProps> = ({
  target,
  solution,
  screenPos,
  isActive,
  language,
  onSelect,
  onStartDrag,
  onToggleExpand,
  onToggleLock,
  onDuplicate,
  onDelete,
}) => {
  const markerRef = useRef<HTMLDivElement>(null);
  const color = target.color || '#f59e0b';

  return (
    <div
      ref={markerRef}
      className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing group select-none"
      style={{
        transform: `translate3d(${screenPos.x}px, ${screenPos.y}px, 0)`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => {
        if (!target.locked && e.button === 0) {
          onStartDrag(e);
        }
      }}
      onTouchStart={(e) => {
        if (!target.locked) {
          onStartDrag(e);
        }
      }}
    >
      {/* Attached Floating Target HUD Overlay */}
      {target.showOverlay && (
        <TargetInfoOverlay
          target={target}
          solution={solution}
          language={language}
          onToggleExpand={onToggleExpand}
          onToggleLock={onToggleLock}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      )}

      {/* Target Tactical Reticle */}
      <div className="relative flex items-center justify-center w-9 h-9">
        {/* Pulsing ring if active */}
        {isActive && (
          <div
            className="absolute inset-0 rounded-full border border-amber-400/40 animate-ping opacity-60"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Reticle SVG */}
        <svg
          viewBox="0 0 36 36"
          className="w-9 h-9 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          style={{ overflow: 'visible' }}
        >
          {/* Outer circle */}
          <circle
            cx="18"
            cy="18"
            r="12"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray={isActive ? 'none' : '3 2'}
          />

          {/* Inner point */}
          <circle cx="18" cy="18" r="3" fill={color} />

          {/* Crosshairs */}
          <line x1="18" y1="2" x2="18" y2="10" stroke={color} strokeWidth="1.75" />
          <line x1="18" y1="26" x2="18" y2="34" stroke={color} strokeWidth="1.75" />
          <line x1="2" y1="18" x2="10" y2="18" stroke={color} strokeWidth="1.75" />
          <line x1="26" y1="18" x2="34" y2="18" stroke={color} strokeWidth="1.75" />

          {/* Corner tick marks */}
          <path
            d="M 10 10 L 8 8 M 26 10 L 28 8 M 10 26 L 8 28 M 26 26 L 28 28"
            stroke={color}
            strokeWidth="1.25"
          />
        </svg>

        {/* Label Tag below target marker */}
        <div
          className={`absolute top-full mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider whitespace-nowrap border shadow-md ${
            isActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
              : 'bg-slate-900/90 text-slate-300 border-slate-700/60'
          }`}
        >
          {target.name}
        </div>
      </div>
    </div>
  );
};
