import React from 'react';
import { LanguageCode } from '../../types/settings';
import { t } from '../../utils/i18n';

interface CompassRoseProps {
  bearingDeg: number;
  bearingMil: number;
  cardinal: string;
  windSpeed?: number;
  windDirectionDeg?: number;
  language: LanguageCode;
}

export const CompassRose: React.FC<CompassRoseProps> = ({
  bearingDeg,
  bearingMil,
  cardinal,
  windSpeed = 0,
  windDirectionDeg = 0,
  language,
}) => {
  return (
    <div className="absolute top-16 left-4 z-20 pointer-events-none select-none">
      <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-2.5 shadow-2xl flex flex-col items-center gap-1.5 w-28 text-slate-100 font-mono">
        {/* Tactical Compass Dial SVG */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer ring */}
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="#020617"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Inner ring */}
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="none"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* Degree tick marks every 30 degrees */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = i * 30;
              const rad = (angle * Math.PI) / 180;
              const x1 = 50 + 42 * Math.sin(rad);
              const y1 = 50 - 42 * Math.cos(rad);
              const x2 = 50 + 46 * Math.sin(rad);
              const y2 = 50 - 46 * Math.cos(rad);
              return (
                <line
                  key={`tick-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#475569"
                  strokeWidth={i % 3 === 0 ? '2' : '1'}
                />
              );
            })}

            {/* Cardinal Letters */}
            <text x="50" y="16" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">N</text>
            <text x="86" y="53" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">E</text>
            <text x="50" y="90" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">S</text>
            <text x="14" y="53" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">W</text>

            {/* Wind Vector (Cyan Arrow) if wind > 0 */}
            {windSpeed > 0 && (
              <g transform={`rotate(${windDirectionDeg}, 50, 50)`} opacity="0.8">
                <line x1="50" y1="50" x2="50" y2="20" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2 2" />
                <polygon points="50,16 46,24 54,24" fill="#06b6d4" />
              </g>
            )}

            {/* Target Bearing Needle (Amber) */}
            <g transform={`rotate(${bearingDeg}, 50, 50)`}>
              {/* Pointer toward target */}
              <polygon points="50,18 45,50 55,50" fill="#f59e0b" />
              {/* Counter-pointer */}
              <polygon points="50,70 46,50 54,50" fill="#64748b" />
              <circle cx="50" cy="50" r="3" fill="#020617" stroke="#f59e0b" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        {/* Numerical Readout */}
        <div className="text-center w-full">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-sm font-bold text-amber-400 tabular-nums">
              {bearingDeg.toFixed(1)}°
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {cardinal}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 tabular-nums">
            {bearingMil} mil
          </div>
          {windSpeed > 0 && (
            <div className="text-[9px] text-cyan-400 mt-0.5 border-t border-slate-800 pt-0.5">
              W: {windSpeed}m/s @ {windDirectionDeg}°
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
