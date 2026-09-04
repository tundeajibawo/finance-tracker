import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <button
        onClick={onBack}
        title="Back"
        className="w-8 shrink-0 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-5.5 h-5.5" />
      </button>
      <h1 className="text-xl font-bold text-gray-900 tracking-tight truncate px-2">{title}</h1>
      <div className="shrink-0 flex justify-end min-w-8">{right}</div>
    </div>
  );
}
