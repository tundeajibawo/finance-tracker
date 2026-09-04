import React, { useMemo } from 'react';
import { Receipt } from 'lucide-react';
import { Screen } from '../Screen';
import { ScreenHeader } from '../ScreenHeader';
import { EmptyState } from '../EmptyState';
import { ACCOUNT_BADGE, TX_ICONS } from '../../icons';
import { AccountItem, TransactionItem, ScreenType } from '../../types';
import { fmt, fmtSigned } from '../../format';

interface AccountDetailScreenProps {
  account: AccountItem;
  transactions: TransactionItem[];
  onNavigate: (screen: ScreenType) => void;
  onSelectTransaction: (tx: TransactionItem) => void;
}

const formatDateLabel = (dateStr: string): string => {
  const t = new Date(dateStr);
  if (Number.isNaN(t.getTime())) return 'Earlier';
  return t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function formatSynced(iso?: string): string {
  if (!iso) return 'Not synced yet';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AccountDetailScreen({
  account,
  transactions,
  onNavigate,
  onSelectTransaction,
}: AccountDetailScreenProps) {
  const badge = ACCOUNT_BADGE[account.colorTheme];

  const groups = useMemo(() => {
    const accountTxs = transactions.filter((tx) => tx.accountId === account.id);
    const earlierByDate = new Map<string, TransactionItem[]>();
    for (const tx of accountTxs.filter((t) => t.dateGroup === 'Earlier')) {
      const label = formatDateLabel(tx.date);
      const arr = earlierByDate.get(label) || [];
      arr.push(tx);
      earlierByDate.set(label, arr);
    }
    return [
      { label: 'Today', items: accountTxs.filter((tx) => tx.dateGroup === 'Today') },
      { label: 'Yesterday', items: accountTxs.filter((tx) => tx.dateGroup === 'Yesterday') },
      ...Array.from(earlierByDate.entries()).map(([label, items]) => ({ label, items })),
    ].filter((g) => g.items.length > 0);
  }, [transactions, account.id]);

  const rows = [
    { label: 'Balance', value: fmt(account.balance) },
    { label: 'Account Type', value: account.accountTypeRaw || account.type },
    { label: 'Last Synced', value: formatSynced(account.lastSyncedAt) },
  ];

  return (
    <Screen>
      <ScreenHeader title={account.name} onBack={() => onNavigate('overview')} />

      <div className="bg-white rounded-2xl border border-[#eef0f2] shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden mb-5">
        <div className="flex items-center p-4">
          <span
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{ backgroundColor: badge.bg }}
          >
            {account.logoUrl ? (
              <img src={account.logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <badge.Icon className="w-5.5 h-5.5" style={{ color: badge.color }} />
            )}
          </span>
          <div className="ml-3 min-w-0">
            <p className="text-base font-bold text-gray-900 truncate">{account.name}</p>
            <p className="text-[13px] font-medium text-gray-400 tracking-widest">{account.accountNumberMasked}</p>
          </div>
        </div>

        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3.5 border-t border-gray-100">
            <span className="text-[13px] font-medium text-gray-500">{row.label}</span>
            <span className="text-[15px] font-semibold text-gray-900 text-right">{row.value}</span>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-3">Transactions</h2>

      {groups.length > 0 ? (
        groups.map((group) => (
          <div key={group.label} className="mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-2.5">{group.label}</h3>
            {group.items.map((tx) => {
              const Icon = TX_ICONS[tx.iconType];
              return (
                <button
                  key={tx.id}
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
        ))
      ) : (
        <EmptyState
          Icon={Receipt}
          title="No transactions yet"
          subtitle="Transactions for this account will appear here."
        />
      )}
    </Screen>
  );
}
