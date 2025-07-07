import React from 'react';

interface FileCardProps {
  icon?: React.ReactNode;
  name: string;
  date: string;
  size?: string;
  status?: string;
  color?: string;
  onClick?: () => void;
}

export default function FileCard({ icon, name, date, size, status, color = '#2563eb', onClick }: FileCardProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl bg-[#232834] shadow mb-2 cursor-pointer hover:scale-[1.01] transition border-l-4"
      style={{ borderColor: color }}
      onClick={onClick}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-xl text-white">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white text-sm truncate">{name}</span>
          <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{date}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {size && <span>{size}</span>}
          {status && <span className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full">{status}</span>}
        </div>
      </div>
    </div>
  );
} 