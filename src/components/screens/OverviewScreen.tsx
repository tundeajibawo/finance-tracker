import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Link2, Plus, Receipt, RefreshCw } from 'lucide-react';
import { Screen } from '../Screen';
import { EmptyState } from '../EmptyState';
import { ACCOUNT_BADGE } from '../../icons';
import { AccountItem, TransactionItem, UserProfile, ScreenType } from '../../types';
import { fmt } from '../../format';
import { listAccounts } from '../../api/accounts';
import { mapApiAccountList } from '../../api/mappers';
import { ApiError } from '../../api/client';
import { useConnectAccount } from '../../hooks/useConnectAccount';
import { ConnectAccountModal } from '../modals/ConnectAccountModal';

interface OverviewScreenProps {
  accounts: AccountItem[];
  transactions: TransactionItem[];
  profile: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onSelectAccount: (account: AccountItem) => void;
  onSelectTransaction: (tx: TransactionItem) => void;
  onSelectCategory?: (category: string) => void;
  onSelectStat?: (stat: 'income' | 'expenses') => void;
  onAccountsLoaded?: (accounts: AccountItem[]) => void;
  onSync?: () => Promise<{ ok: boolean; message: string }>;
}

const EXPENSE_CARD_COLORS = [
  { bg: '#fff7ed', circle: '#fdba74', text: '#c2410c' },
  { bg: '#f0fdfa', circle: '#5eead4', text: '#0f766e' },
  { bg: '#eff6ff', circle: '#93c5fd', text: '#1d4ed8' },
  { bg: '#faf5ff', circle: '#d8b4fe', text: '#7e22ce' },
  { bg: '#fef2f2', circle: '#fca5a5', text: '#b91c1c' },
];

export function OverviewScreen({
  accounts,
  transactions,
  profile,
  onNavigate,
  onSelectAccount,
  onSelectTransaction,
  onSelectCategory,
  onSelectStat,
  onAccountsLoaded,
  onSync,
}: OverviewScreenProps) {
  const [data, setData] = useState<AccountItem[]>(accounts);
  const [loading, setLoading] = useState(accounts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showBalance, setShowBalance] = useState(() => localStorage.getItem('finance_show_balance') !== 'false');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; message: string } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await listAccounts();
      const mapped = mapApiAccountList(res.data.accounts);
      setData(mapped);
      onAccountsLoaded?.(mapped);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load accounts');
    } finally {
      setLoading(false);
    }
  }, [onAccountsLoaded]);

  useEffect(() => {
    load();
  }, [load]);

  const { connecting, connect, url: connectUrl, isOpen: isConnectOpen, close: closeConnect } = useConnectAccount(load);

  const doSync = async () => {
    if (!onSync || syncing) return;
    setSyncing(true);
    setSyncMsg(null);
    const res = await onSync();
    setSyncMsg(res);
    if (res.ok) await load();
    setSyncing(false);
  };

  const totalBalance = useMemo(() => data.reduce((sum, a) => sum + (a.balance || 0), 0), [data]);

  const lastSyncDate = useMemo(() => {
    const iso = data
      .map((a) => a.lastSyncedAt)
      .filter(Boolean)
      .sort()
      .pop();
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [data]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    const time = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    const first = (profile.name || '').split(' ')[0] || 'there';
    return { time: `Good ${time}`, name: first };
  }, [profile.name]);

  const { income, expenses } = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    let inc = 0;
    let exp = 0;
    for (const tx of transactions) {
      const t = new Date(tx.date).getTime();
      if (Number.isNaN(t) || t < monthStart || t >= monthEnd) continue;
      if (tx.amount > 0) inc += tx.amount;
      else exp += Math.abs(tx.amount);
    }
    return { income: inc, expenses: exp };
  }, [transactions]);

  const topExpenses = useMemo(() => {
    const now = new Date();
    const day = now.getDay() || 7;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1).getTime();
    const weekEnd = weekStart + 7 * 86_400_000;
    const byCat = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.amount >= 0) continue;
      const t = new Date(tx.date).getTime();
      if (Number.isNaN(t) || t < weekStart || t >= weekEnd) continue;
      const cat = tx.category || 'General';
      byCat.set(cat, (byCat.get(cat) || 0) + Math.abs(tx.amount));
    }
    return Array.from(byCat.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  return (
    <Screen refreshing={syncing || (loading && data.length > 0)} onRefresh={doSync}>
      {/* Greeting */}
      <div className="flex items-center mb-5">
        <button
          id="btn-profile-avatar"
          onClick={() => onNavigate('profile')}
          title="Open profile"
          className="w-12 h-12 rounded-full border-2 border-blue-100 overflow-hidden shrink-0 cursor-pointer hover:border-blue-300 transition-colors"
        >
          <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
        </button>
        <div className="ml-3 min-w-0">
          <p className="text-xl font-bold text-gray-900 leading-tight">{greeting.time}</p>
          <p className="text-sm font-medium text-gray-500 mt-0.5 truncate">{greeting.name}</p>
        </div>
      </div>

      {loading && data.length === 0 ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
        </div>
      ) : error && data.length === 0 ? (
        <div className="flex flex-col items-center py-10">
          <p className="text-[13px] text-gray-400">{error}</p>
          <button
            onClick={connect}
            disabled={connecting}
            className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-[13px] px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            {connecting ? 'Connecting…' : 'Add Account'}
          </button>
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          Icon={Link2}
          title="No accounts connected yet"
          subtitle="Link your bank account to start tracking your balance and transactions."
          actionLabel={connecting ? 'Connecting…' : 'Connect Account'}
          onAction={connect}
          disabled={connecting}
        />
      ) : (
        <>
          {/* Total balance */}
          <div className="relative overflow-hidden rounded-[20px] bg-[#1e3a8a] p-5 mb-3.5">
            <div className="absolute rounded-full w-35 h-35 -top-12.5 -right-7.5 bg-[#3b82f6] opacity-55" />
            <div className="absolute rounded-full w-17.5 h-17.5 top-2 right-15 bg-[#f59e0b] opacity-50" />
            <div className="absolute rounded-full w-22.5 h-22.5 -bottom-10 -left-5 bg-[#14b8a6] opacity-50" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/75">Total Balance</p>
                <div className="flex items-center gap-1.5">
                  {onSync && (
                    <button
                      id="btn-sync-balance"
                      onClick={doSync}
                      disabled={syncing}
                      aria-label="Sync accounts"
                      className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-60 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-white ${syncing ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  <button
                    id="btn-toggle-balance"
                    onClick={() => {
                      const next = !showBalance;
                      setShowBalance(next);
                      localStorage.setItem('finance_show_balance', String(next));
                    }}
                    aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    {showBalance ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mt-1">{showBalance ? fmt(totalBalance) : '₦ ••••••'}</p>
              {lastSyncDate && <p className="text-[11px] font-medium text-white/65 mt-1">as at {lastSyncDate}</p>}
              {syncMsg && (
                <p className={`text-[11px] font-semibold mt-1 ${syncMsg.ok ? 'text-emerald-200' : 'text-red-200'}`}>
                  {syncMsg.message}
                </p>
              )}
              <button
                id="btn-my-balances"
                onClick={() => setShowAccounts((s) => !s)}
                className="flex items-center mt-4 cursor-pointer"
              >
                <span className="text-xs font-semibold text-white/85 mr-2">My Balances</span>
                <span className="w-5.5 h-5.5 rounded-full bg-white/25 flex items-center justify-center">
                  {showAccounts ? (
                    <ArrowUp className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5 text-white" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Account carousel */}
          {showAccounts && (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 mb-3.5">
              <button
                onClick={connect}
                disabled={connecting}
                title="Connect an account"
                className="shrink-0 w-17 h-23 rounded-[14px] bg-blue-600 hover:bg-blue-700 disabled:opacity-60 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                {connecting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 text-white" />
                )}
              </button>
              {data.map((account) => {
                const badge = ACCOUNT_BADGE[account.colorTheme];
                return (
                  <button
                    key={account.id}
                    id={`overview-account-${account.id}`}
                    onClick={() => onSelectAccount(account)}
                    className="shrink-0 w-35 h-23 rounded-[14px] border border-gray-200 bg-white p-2.5 flex flex-col justify-between text-left cursor-pointer hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      {account.logoUrl ? (
                        <img src={account.logoUrl} alt="" className="w-4.5 h-4.5 rounded-[5px] object-cover" />
                      ) : (
                        <span
                          className="w-4.5 h-4.5 rounded-[5px] flex items-center justify-center shrink-0"
                          style={{ backgroundColor: badge.bg }}
                        >
                          <badge.Icon className="w-3 h-3" style={{ color: badge.color }} />
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-gray-900 truncate">{account.name}</span>
                    </div>
                    <p className="text-[10px] font-medium text-gray-500 truncate">
                      {account.accountTypeRaw || account.type}
                    </p>
                    <p className="text-[11px] font-semibold text-gray-700 tracking-wide">
                      {account.accountNumberMasked}
                    </p>
                    <p className="text-xs font-bold text-gray-900">{showBalance ? fmt(account.balance) : '•••• ••'}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Income / expenses */}
          <div className="flex gap-2.5 mb-5">
            <button
              id="btn-stat-income"
              onClick={() => onSelectStat?.('income')}
              className="flex-1 rounded-2xl border border-[#eef0f2] bg-white p-3.5 text-left cursor-pointer hover:border-blue-100 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-2.5">
                <ArrowDown className="w-4 h-4 text-emerald-600" />
              </span>
              <p className="text-xs font-semibold text-gray-500">Income</p>
              <p className="text-[17px] font-bold text-gray-900 mt-0.5">{fmt(income)}</p>
            </button>
            <button
              id="btn-stat-expenses"
              onClick={() => onSelectStat?.('expenses')}
              className="flex-1 rounded-2xl border border-[#eef0f2] bg-white p-3.5 text-left cursor-pointer hover:border-blue-100 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-2.5">
                <ArrowUp className="w-4 h-4 text-red-500" />
              </span>
              <p className="text-xs font-semibold text-gray-500">Expenses</p>
              <p className="text-[17px] font-bold text-gray-900 mt-0.5">{fmt(expenses)}</p>
            </button>
          </div>

          {/* Top 5 expenses */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Top 5 Expenses</h2>
            <span className="rounded-full bg-[#ccfbf1] text-[#0f766e] text-[11px] font-bold px-3 py-1">This week</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 mb-6">
            {topExpenses.length > 0 ? (
              topExpenses.map((exp, i) => {
                const colors = EXPENSE_CARD_COLORS[i % EXPENSE_CARD_COLORS.length];
                return (
                  <button
                    key={exp.category}
                    onClick={() => onSelectCategory?.(exp.category)}
                    style={{ backgroundColor: colors.bg }}
                    className="shrink-0 w-30 rounded-2xl p-3 text-left cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center mb-2.5"
                      style={{ backgroundColor: colors.circle }}
                    >
                      <span className="text-[15px] font-bold" style={{ color: colors.text }}>
                        {i + 1}
                      </span>
                    </span>
                    <p className="text-[13px] font-bold truncate mb-1" style={{ color: colors.text }}>
                      {exp.category}
                    </p>
                    <p className="text-[11px] font-bold" style={{ color: colors.text }}>
                      {fmt(exp.amount)}
                    </p>
                  </button>
                );
              })
            ) : (
              <p className="text-[13px] text-gray-400 py-2.5">No expenses recorded yet.</p>
            )}
          </div>
        </>
      )}

      {/* Recent transactions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <button
            id="btn-view-all-transactions"
            onClick={() => onNavigate('transactions')}
            className="text-[13px] font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            Icon={Receipt}
            title="No transactions yet"
            subtitle="Your recent activity will show up here once your bank is connected."
          />
        ) : (
          transactions.slice(0, 5).map((tx) => (
            <button
              key={tx.id}
              id={`overview-tx-${tx.id}`}
              onClick={() => onSelectTransaction(tx)}
              className="w-full bg-white rounded-2xl border border-[#eef0f2] shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-3.5 mb-2.5 flex items-center text-left cursor-pointer hover:border-gray-200 hover:shadow-md transition-all"
            >
              <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                {tx.amount < 0 ? (
                  <ArrowUp className="w-4.5 h-4.5 text-red-500" />
                ) : (
                  <ArrowDown className="w-4.5 h-4.5 text-emerald-600" />
                )}
              </span>
              <div className="flex-1 ml-3 min-w-0">
                <p className="text-[15px] font-semibold text-gray-900 truncate">{tx.category || tx.title}</p>
                <p className="text-xs font-medium text-gray-400 mt-0.5 truncate">{tx.merchantOrSender}</p>
              </div>
              <div className="text-right shrink-0 pl-2">
                <p className={`text-[15px] font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {tx.amount < 0 ? `-${fmt(Math.abs(tx.amount))}` : `+${fmt(tx.amount)}`}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{tx.date.slice(0, 10)}</p>
              </div>
            </button>
          ))
        )}
      </div>
      <ConnectAccountModal url={connectUrl} isOpen={isConnectOpen} onClose={closeConnect} />
    </Screen>
  );
}
