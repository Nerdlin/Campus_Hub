import React from 'react';

interface ScheduleCardProps {
  time: string;
  title: string;
  type: string;
  location: string;
  teacher?: string;
  status?: string;
  color?: string;
  onClick?: () => void;
}

const typeColors: Record<string, string> = {
  'лекция': '#2563eb',
  'семинар': '#22c55e',
  'лаб': '#eab308',
  'проект': '#7c3aed',
  'экзамен': '#ef4444',
  '': '#64748b',
};

export default function ScheduleCard({ time, title, type, location, teacher, status, color, onClick }: ScheduleCardProps) {
  const bg = color || typeColors[type.toLowerCase()] || '#64748b';
  return (
    <div
      className="rounded-xl p-4 bg-[#232834] flex flex-col gap-1 shadow cursor-pointer hover:scale-[1.01] transition border-l-4"
      style={{ borderColor: bg }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-white text-base">{title}</span>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: bg + '22', color: bg }}>{type}</span>
      </div>
      <div className="text-xs text-gray-400 mb-1">{location}{teacher && ` · ${teacher}`}</div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">{time}</span>
        {status && <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-900 text-yellow-300">{status}</span>}
      </div>
    </div>
  );
} 