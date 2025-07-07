import React from 'react';

interface FilterBarProps {
  filters: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FilterBar({ filters, value, onChange, className = '' }: FilterBarProps) {
  return (
    <div className={`flex flex-wrap gap-2 mb-4 ${className}`}>
      {filters.map(f => (
        <button
          key={f.value}
          className={`px-4 py-2 rounded-full text-sm font-medium transition border-2 ${
            value === f.value
              ? 'bg-blue-600 text-white border-blue-600 shadow'
              : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-blue-900 hover:text-white'
          }`}
          onClick={() => onChange(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
} 