import React, { useCallback, useEffect, useState } from 'react';
import { ChevronRight, Link2 } from 'lucide-react';
import { Screen } from '../Screen';
import { ScreenHeader } from '../ScreenHeader';
import { EmptyState } from '../EmptyState';
import { ACCOUNT_BADGE } from '../../icons';
import { AccountItem, ScreenType } from '../../types';
import { listAccounts } from '../../api/accounts';
import { mapApiAccountList } from '../../api/mappers';
import { ApiError } from '../../api/client';
import { useConnectAccount } from '../../hooks/useConnectAccount';
import { ConnectAccountModal } from '../modals/ConnectAccountModal';

interface AccountsScreenProps {
  accounts: AccountItem[];
  onNavigate: (screen: ScreenType) => void;
  onSelectAccount: (account: AccountItem) => void;
  onAccountsLoaded?: (accounts: AccountItem[]) => void;
}

export function AccountsScreen({
  accounts,
  onNavigate,
  onSelectAccount,
  onAccountsLoaded,
}: AccountsScreenProps) {
  const [data, setData] = useState<AccountItem[]>(accounts);
  const [loading, setLoading] = useState(accounts.length === 0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
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

  const { connecting, error: connectError, connect, url: connectUrl, isOpen: isConnectOpen, close: closeConnect } = useConnectAccount(load);

  return (
    <Screen refreshing={loading && data.length > 0} onRefresh={load}>
      <ScreenHeader
        title="Accounts"
        onBack={() => onNavigate('overview')}
        right={
          <button
            id="btn-add-account"
            onClick={connect}
            disabled={connecting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold px-3.5 py-2 rounded-full whitespace-nowrap cursor-pointer transition-colors"
          >
            {connecting ? 'Connecting…' : 'Add Account'}
          </button>
        }
      />

      {error && data.length > 0 && <p className="text-[13px] text-red-500 mb-3">{error}</p>}
      {connectError && <p className="text-[13px] text-red-500 mb-3">{connectError}</p>}

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
          Icon={Link2}
          title="No accounts yet"
          subtitle="Link your bank account to start tracking your balance and transactions."
          actionLabel={connecting ? 'Connecting…' : 'Link Your Bank'}
          onAction={connect}
          disabled={connecting}
        />
      ) : (
        data.map((account) => {
          const badge = ACCOUNT_BADGE[account.colorTheme];
          return (
            <button
              key={account.id}
              id={`account-card-${account.id}`}
              onClick={() => onSelectAccount(account)}
              className="w-full bg-white rounded-2xl border border-[#eef0f2] shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-3.5 mb-2.5 flex items-center text-left cursor-pointer hover:border-blue-100 hover:shadow-md transition-all"
            >
              <span
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                style={{ backgroundColor: badge.bg }}
              >
                {account.logoUrl ? (
                  <img src={account.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <badge.Icon className="w-5 h-5" style={{ color: badge.color }} />
                )}
              </span>
              <div className="flex-1 ml-3 min-w-0">
                <p className="text-[15px] font-semibold text-gray-900 truncate">{account.name}</p>
                <p className="text-[13px] font-medium text-gray-400 mt-0.5 truncate">
                  {account.type} <span className="tracking-widest">{account.accountNumberMasked}</span>
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>
          );
        })
      )}
      <ConnectAccountModal url={connectUrl} isOpen={isConnectOpen} onClose={closeConnect} />
    </Screen>
  );
}
