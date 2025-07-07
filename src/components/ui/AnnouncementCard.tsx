import React from 'react';

interface AnnouncementCardProps {
  title: string;
  date: string;
  status?: string;
  color?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function AnnouncementCard({ title, date, status, color = '#ef4444', onClick, children }: AnnouncementCardProps) {
  return (
    <div
      className="rounded-xl p-4 bg-[#232834] flex flex-col gap-1 shadow cursor-pointer hover:scale-[1.01] transition border-l-4 mb-2"
      style={{ borderColor: color }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-white text-base">{title}</span>
        {status && <span className="text-xs px-2 py-1 rounded-full bg-red-900 text-red-200">{status}</span>}
      </div>
      <div className="text-xs text-gray-400 mb-1">{date}</div>
      {children}
    </div>
  );
} 