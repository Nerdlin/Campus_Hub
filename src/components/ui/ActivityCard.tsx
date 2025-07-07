import React from 'react';

interface ActivityCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  time: string;
  color?: string;
}

export default function ActivityCard({ icon, title, description, time, color = '#2563eb' }: ActivityCardProps) {
  return (
    <div className="flex items-center gap-4 bg-[#232834] rounded-xl p-4 mb-2 shadow">
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full" style={{ background: color + '22' }}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-white font-medium text-sm">{title}</div>
        {description && <div className="text-gray-400 text-xs">{description}</div>}
      </div>
      <div className="text-gray-500 text-xs whitespace-nowrap">{time}</div>
    </div>
  );
} 