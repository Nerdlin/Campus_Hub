import React from 'react';

interface SubjectCardProps {
  title: string;
  credits: number;
  teacher: string;
  percent: number;
  grade: string;
  color?: string;
  status?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function SubjectCard({
  title,
  credits,
  teacher,
  percent,
  grade,
  color = '#2563eb',
  status,
  onClick,
  children,
}: SubjectCardProps) {
  return (
    <div
      className="rounded-2xl p-6 bg-[#232834] shadow-lg flex flex-col gap-2 cursor-pointer hover:scale-[1.02] transition-transform border border-transparent hover:border-blue-500"
      style={{ borderLeft: `6px solid ${color}` }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-bold text-white">{title}</div>
        <div className="flex items-center gap-2">
          <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">{credits} кредитов</span>
          <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">{grade}</span>
        </div>
      </div>
      <div className="text-sm text-gray-400 mb-2">{teacher}</div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full"
            style={{ width: `${percent}%`, background: color }}
          ></div>
        </div>
        <span className="text-white text-sm font-semibold" style={{ color }}>{percent}%</span>
      </div>
      {status && (
        <div className="text-xs font-semibold px-2 py-1 rounded bg-yellow-900 text-yellow-300 w-max">{status}</div>
      )}
      {children}
    </div>
  );
} 