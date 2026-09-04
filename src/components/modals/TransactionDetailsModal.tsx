import React from 'react';
import { Calendar, FileText, Store, Tag, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TransactionItem } from '../../types';
import { fmtSigned } from '../../format';

interface TransactionDetailsModalProps {
  tx: TransactionItem | null;
  bankName?: string;
  onClose: () => void;
}

export function TransactionDetailsModal({ tx, bankName, onClose }: TransactionDetailsModalProps) {
  if (!tx) return null;

  const rows: { Icon: LucideIcon; label: string; value: string }[] = [
    { Icon: Store, label: 'Bank', value: bankName || 'Unknown' },
    ...(tx.narration ? [{ Icon: FileText, label: 'Narration', value: tx.narration }] : []),
    { Icon: Tag, label: 'Category', value: tx.category },
    { Icon: Calendar, label: 'Date', value: tx.date },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Transaction Details</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center py-4 bg-gray-50 rounded-2xl mb-4">
          <p className={`text-[28px] font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {fmtSigned(tx.amount)}
          </p>
          <p className="text-xs font-semibold text-gray-500 mt-1">{tx.title}</p>
          {tx.isPending && (
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-semibold">
              Pending Authorization
            </span>
          )}
        </div>

        <div className="text-sm">
          {rows.map(({ Icon, label, value }) => (
            <div key={label} className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 shrink-0">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </div>
              <span className="font-semibold text-gray-800 text-right break-words min-w-0">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
