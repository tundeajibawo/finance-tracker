import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Receipt, Search, X } from 'lucide-react';
import { Screen } from '../Screen';
import { ScreenHeader } from '../ScreenHeader';
import { EmptyState } from '../EmptyState';
import { TX_ICONS } from '../../icons';
import { TransactionItem, ScreenType } from '../../types';
import { fmtSigned } from '../../format';
import { listTransactions } from '../../api/accounts';
import { mapApiTransactionList } from '../../api/mappers';
import { ApiError } from '../../api/client';

export type Filter = 'all' | 'income' | 'expenses' | 'pending';

interface TransactionsScreenProps {
  transactions: TransactionItem[];
  onNavigate: (screen: ScreenType) => void;
  onSelectTransaction: (tx: TransactionItem) => void;
  onTransactionsLoaded?: (txs: TransactionItem[]) => void;
  initialSearch?: string;
  initialFilter?: Filter;
}

const FILTERS: { id: Filter; label: string; activeClass: string }[] = [
  { id: 'all', label: 'All', activeClass: 'bg-blue-600' },
  { id: 'income', label: 'Income', activeClass: 'bg-emerald-600' },
  { id: 'expenses', label: 'Expenses', activeClass: 'bg-red-500' },
  { id: 'pending', label: 'Pending', activeClass: 'bg-amber-500' },
];

const formatDateLabel = (dateStr: string): string => {
  const t = new Date(dateStr);
  if (Number.isNaN(t.getTime())) return 'Earlier';
  return t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function TransactionsScreen({
  transactions,
  onNavigate,
  onSelectTransaction,
  onTransactionsLoaded,
  initialSearch,
  initialFilter,
}: TransactionsScreenProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [activeFilter, setActiveFilter] = useState<Filter>(initialFilter || 'all');
  const [data, setData] = useState<TransactionItem[]>(transactions);
  const [loading, setLoading] = useState(transactions.length === 0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await listTransactions();
      const mapped = mapApiTransactionList(res.data);
      setData(mapped);
      onTransactionsLoaded?.(mapped);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load transactions');
    } finally {
      setLoading(false);
    }
  }, [onTransactionsLoaded]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return data.filter((tx) => {
      const matchesSearch =
        !q ||
        tx.title.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.merchantOrSender.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (activeFilter === 'income') return tx.amount > 0;
      if (activeFilter === 'expenses') return tx.amount < 0;
      if (activeFilter === 'pending') return tx.isPending === true;
      return true;
    });
  }, [data, searchQuery, activeFilter]);

  const groups = useMemo(() => {
    const earlierByDate = new Map<string, TransactionItem[]>();
    for (const tx of filtered.filter((t) => t.dateGroup === 'Earlier')) {
      const label = formatDateLabel(tx.date);
      const arr = earlierByDate.get(label) || [];
      arr.push(tx);
      earlierByDate.set(label, arr);
    }
    return [
      { label: 'Today', items: filtered.filter((tx) => tx.dateGroup === 'Today') },
      { label: 'Yesterday', items: filtered.filter((tx) => tx.dateGroup === 'Yesterday') },
      ...Array.from(earlierByDate.entries()).map(([label, items]) => ({ label, items })),
    ].filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <Screen refreshing={loading && data.length > 0} onRefresh={load}>
      <ScreenHeader title="Transactions" onBack={() => onNavigate('overview')} />

      {/* Search */}
      <div className="relative mb-3.5">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          id="input-search-transactions"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transactions"
          className="w-full bg-white rounded-xl py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => {
          const active = activeFilter === f.id;
          return (
            <button
              key={f.id}
              id={`filter-${f.id}`}
              onClick={() => setActiveFilter(active ? 'all' : f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                active ? `${f.activeClass} text-white` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {groups.map((group) => (
        <div key={group.label} className="mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-2.5">{group.label}</h2>
          {group.items.map((tx) => {
            const Icon = TX_ICONS[tx.iconType];
            return (
              <button
                key={tx.id}
                id={`tx-row-${tx.id}`}
                onClick={() => onSelectTransaction(tx)}
                className="w-full bg-white rounded-2xl border border-[#eef0f2] shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-3.5 mb-2.5 flex items-center text-left cursor-pointer hover:border-gray-200 hover:shadow-md transition-all"
              >
                <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gray-700" />
                </span>
                <div className="flex-1 ml-3 min-w-0">
                  <p className="text-[15px] font-semibold text-gray-900 truncate">{tx.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-medium text-gray-400 truncate">{tx.merchantOrSender}</span>
                    {tx.isPending && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5 shrink-0">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[15px] font-bold shrink-0 pl-2 ${
                    tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {fmtSigned(tx.amount)}
                </span>
              </button>
            );
          })}
        </div>
      ))}

      {loading && data.length === 0 ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
        </div>
      ) : error && data.length === 0 ? (
        <div className="flex flex-col items-center py-10">
          <p className="text-[13px] text-gray-400">{error}</p>
          <button
            onClick={load}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] px-6 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          Icon={Receipt}
          title="No transactions yet"
          subtitle="Your income and expenses will show up here once we connect your bank."
        />
      ) : (
        filtered.length === 0 && (
          <div className="flex justify-center py-10">
            <p className="text-[13px] text-gray-400">No transactions match your search or filter.</p>
          </div>
        )
      )}
    </Screen>
  );
}
