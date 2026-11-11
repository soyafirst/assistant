import React from 'react';

interface CircularGaugeProps {
  label: string;
  value: number; // 0 to 100 or metric
  displayValue: string;
  subValue?: string;
  unit?: string;
  isPing?: boolean;
  size?: number;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  label,
  value,
  displayValue,
  subValue,
  isPing = false,
  size = 64,
}) => {
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke dashoffset
  // For ping, normalize max 150ms to 100%
  const normalizedPercent = isPing ? Math.min(100, Math.max(5, (value / 150) * 100)) : Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (normalizedPercent / 100) * circumference;

  // Determine color based on threshold
  let strokeColor = '#10b981'; // Green
  let textColor = 'text-[#10b981]';
  if (isPing) {
    if (value > 100) {
      strokeColor = '#ef4444';
      textColor = 'text-red-400';
    } else if (value > 45) {
      strokeColor = '#f59e0b';
      textColor = 'text-amber-400';
    } else {
      strokeColor = '#10b981';
      textColor = 'text-emerald-400';
    }
  } else {
    if (value >= 85) {
      strokeColor = '#ef4444';
      textColor = 'text-red-400';
    } else if (value >= 65) {
      strokeColor = '#d97706';
      textColor = 'text-amber-500';
    } else {
      strokeColor = '#10b981';
      textColor = 'text-emerald-400';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#242321] border border-[#33312e] hover:border-[#44413c] transition-colors">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2e2d2a"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-[11px] font-semibold tracking-tight font-mono tabular-nums ${textColor}`}>
            {displayValue}
          </span>
        </div>
      </div>

      <span className="text-[11px] font-medium text-[#a8a29e] mt-1.5">{label}</span>
      {subValue && (
        <span className="text-[9px] text-[#78716c] font-mono tabular-nums truncate max-w-[68px]">
          {subValue}
        </span>
      )}
    </div>
  );
};
