import React from 'react';

interface SectionTitleProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function SectionTitle({ children, title, subtitle, icon, className = '' }: SectionTitleProps) {
  if (title) {
    return (
      <div className={`mb-4 ${className}`}>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="text-sm text-gray-300 mt-1">{subtitle}</p>}
      </div>
    );
  }

  return (
    <h2 className={`text-xl md:text-2xl font-bold text-white mb-4 tracking-tight ${className}`}>
      {children}
    </h2>
  );
} 
