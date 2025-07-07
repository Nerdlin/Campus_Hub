import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h2 className={`text-xl md:text-2xl font-bold text-white mb-4 tracking-tight ${className}`}>
      {children}
    </h2>
  );
} 