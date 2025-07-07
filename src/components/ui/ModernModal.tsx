import React from 'react';

interface ModernModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ModernModal({ open, onClose, title, children, className = '' }: ModernModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className={`bg-[#232834] rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in ${className}`}>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
        >
          ×
        </button>
        {title && <h3 className="text-xl font-bold text-white mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
} 