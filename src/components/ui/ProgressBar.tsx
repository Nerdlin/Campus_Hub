import React from 'react';

interface ProgressBarProps {
  percent: number;
  color?: string;
  height?: number;
  label?: string;
}

export default function ProgressBar({ percent, color = '#2563eb', height = 8, label }: ProgressBarProps) {
  const safePercent = Math.max(0, Math.min(percent, 100));
  return (
    <div className="w-full flex items-center gap-2 min-w-0">
      <div className="flex-1 bg-gray-700 rounded-full min-w-0" style={{ height }}>
        <div
          className="rounded-full transition-all duration-500"
          style={{ width: `${safePercent}%`, background: color, height, maxWidth: '100%' }}
        ></div>
      </div>
      {label && <span className="text-xs text-white ml-2 truncate max-w-[40px]">{label}</span>}
      <span className="text-xs text-white font-bold truncate max-w-[40px]" style={{ color }}>{safePercent}%</span>
    </div>
  );
} 