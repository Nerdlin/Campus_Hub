import React from 'react';

interface MessageCardProps {
  avatar: string;
  name: string;
  text: string;
  time: string;
  unread?: boolean;
  onClick?: () => void;
}

export default function MessageCard({ avatar, name, text, time, unread, onClick }: MessageCardProps) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl bg-[#232834] shadow mb-2 cursor-pointer hover:scale-[1.01] transition border-l-4 ${unread ? 'border-blue-500' : 'border-transparent'}`}
      onClick={onClick}
    >
      <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white text-sm truncate">{name}</span>
          <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{time}</span>
        </div>
        <div className={`text-xs truncate ${unread ? 'text-blue-300 font-bold' : 'text-gray-400'}`}>{text}</div>
      </div>
      {unread && <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>}
    </div>
  );
} 