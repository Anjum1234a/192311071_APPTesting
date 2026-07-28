import React from 'react';
export type ToothState = 'healthy' | 'caries' | 'filled' | 'missing' | 'rct';
interface ToothProps {
  number: number;
  state?: ToothState;
  className?: string;
}
export const Tooth: React.FC<ToothProps> = ({
  number,
  state = 'healthy',
  className = ''
}) => {
  const getColors = () => {
    switch (state) {
      case 'filled':
        return {
          fill: '#DBEAFE',
          stroke: '#0A84FF',
          rootStroke: '#94A3B8'
        };
      case 'rct':
        return {
          fill: '#CCFBF1',
          stroke: '#00C2A8',
          rootStroke: '#00C2A8'
        };
      case 'missing':
        return {
          fill: '#F8FAFC',
          stroke: '#CBD5E1',
          rootStroke: '#E2E8F0'
        };
      case 'caries':
        return {
          fill: '#FFFFFF',
          stroke: '#475569',
          rootStroke: '#94A3B8'
        };
      default:
        return {
          fill: '#FFFFFF',
          stroke: '#475569',
          rootStroke: '#94A3B8'
        };
    }
  };
  const { fill, stroke, rootStroke } = getColors();
  const isUpper = number <= 16;
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <span className="text-[10px] font-semibold text-slate-400">{number}</span>
      <div className={`relative w-8 h-12 ${!isUpper ? 'rotate-180' : ''}`}>
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full drop-shadow-sm transition-all duration-200">
          
          {/* Roots */}
          <path
            d="M 35 65 C 30 90, 35 115, 40 115 C 45 115, 45 90, 45 70"
            fill="none"
            stroke={rootStroke}
            strokeWidth="4"
            strokeLinecap="round" />
          
          <path
            d="M 65 65 C 70 90, 65 115, 60 115 C 55 115, 55 90, 55 70"
            fill="none"
            stroke={rootStroke}
            strokeWidth="4"
            strokeLinecap="round" />
          

          {/* Crown */}
          <path
            d="M 20 40 C 20 10, 40 5, 50 5 C 60 5, 80 10, 80 40 C 80 60, 70 70, 50 70 C 30 70, 20 60, 20 40 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="4" />
          

          {/* Caries indicator */}
          {state === 'caries' &&
          <>
              <circle cx="40" cy="30" r="8" fill="#EF4444" />
              <circle cx="60" cy="45" r="6" fill="#F97316" />
            </>
          }

          {/* Missing indicator (X) */}
          {state === 'missing' &&
          <g
            stroke="#94A3B8"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.5">
            
              <line x1="15" y1="15" x2="85" y2="105" />
              <line x1="85" y1="15" x2="15" y2="105" />
            </g>
          }
        </svg>
      </div>
    </div>);

};