import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}

export function EmptyState({ Icon, title, subtitle, actionLabel, onAction, disabled }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#eef0f2] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col items-center px-5 py-7">
      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-blue-600" />
      </div>
      <p className="text-base font-bold text-gray-900">{title}</p>
      <p className="text-[13px] text-gray-500 text-center mt-1 leading-[18px]">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          disabled={disabled}
          className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
