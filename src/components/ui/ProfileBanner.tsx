import React from 'react';

interface ProfileBannerProps {
  avatar: string;
  name: string;
  status?: string;
  banner?: string;
  onEdit?: () => void;
}

export default function ProfileBanner({ avatar, name, status, banner, onEdit }: ProfileBannerProps) {
  return (
    <div className="relative h-48 rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-blue-700 to-blue-400">
      {banner && <img src={banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-70" />}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div className="absolute left-8 bottom-4 flex items-center gap-4">
        <img src={avatar} alt={name} className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover" />
        <div>
          <div className="text-2xl font-bold text-white drop-shadow">{name}</div>
          {status && <div className="text-blue-100 text-sm">{status}</div>}
        </div>
      </div>
      {onEdit && (
        <button
          className="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-40 transition"
          onClick={onEdit}
        >
          <span className="material-icons">edit</span>
        </button>
      )}
    </div>
  );
} 