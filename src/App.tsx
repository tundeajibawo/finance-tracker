import React, { useState, useEffect, useRef } from 'react';
import { ScreenType, AccountItem, TransactionItem, BudgetCategoryItem, UserProfile } from './types';
import { INITIAL_PROFILE, INITIAL_BUDGET_CATEGORIES } from './data/initialData';
import { BottomNavBar } from './components/BottomNavBar';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { AccountsScreen } from './components/screens/AccountsScreen';
import { AccountDetailScreen } from './components/screens/AccountDetailScreen';
import { TransactionsScreen } from './components/screens/TransactionsScreen';
import { BudgetsScreen } from './components/screens/BudgetsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { RegisterScreen } from './components/screens/RegisterScreen';
import { AddBudgetModal } from './components/modals/AddBudgetModal';
import { TransactionDetailsModal } from './components/modals/TransactionDetailsModal';
import { SettingsModals } from './components/modals/SettingsModals';

import { login as apiLogin, register as apiRegister, me } from './api/auth';
import { listAccounts, listTransactions, syncAccounts } from './api/accounts';
import { ApiError, onSessionExpired } from './api/client';
import { clearTokens, getTokens, setTokens } from './api/token';
import { mapApiAccountList, mapApiTransactionList } from './api/mappers';

type Session = 'loading' | 'guest' | 'authed';

const noData = (e: unknown) =>
  e instanceof ApiError && (e.status === 400 || e.status === 404) ? null : Promise.reject(e);

export default function App() {
  const [session, setSession] = useState<Session>('loading');
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('overview');

  // Local-persisted state (budgets + profile prefs)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('finance_app_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategoryItem[]>(() => {
    const saved = localStorage.getItem('finance_app_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGET_CATEGORIES;
  });

  // Server data
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  // Modals / selection
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountItem | null>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [activeSettingsModal, setActiveSettingsModal] = useState<'password' | 'email' | 'delete' | null>(null);

  // Overview -> Transactions deep links
  const [txCategoryFilter, setTxCategoryFilter] = useState<string | null>(null);
  const [txFilter, setTxFilter] = useState<'income' | 'expenses' | null>(null);

  useEffect(() => {
    localStorage.setItem('finance_app_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('finance_app_budgets', JSON.stringify(budgetCategories));
  }, [budgetCategories]);

  const refreshData = async () => {
    const [accRes, txRes] = await Promise.all([
      listAccounts().catch(noData),
      listTransactions().catch(noData),
    ]);
    if (accRes) setAccounts(mapApiAccountList(accRes.data.accounts));
    if (txRes) setTransactions(mapApiTransactionList(txRes.data));
  };

  // Bootstrap: restore session from stored tokens
  useEffect(() => {
    (async () => {
      const tokens = getTokens();
      if (!tokens.accessToken) {
        setSession('guest');
        return;
      }
      try {
        const res = await me();
        setProfile((p) => ({
          ...p,
          name: res.data.name || p.name || '',
          email: res.data.email || p.email || '',
        }));
        await refreshData();
        setSession('authed');
      } catch {
        clearTokens();
        setSession('guest');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () =>
      onSessionExpired(() => {
        setAccounts([]);
        setTransactions([]);
        setAuthScreen('login');
        setSession('guest');
      }),
    []
  );

  const handleLogin = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setTokens(res.data.access_token, res.data.refresh_token);
    setProfile((p) => ({
      ...p,
      name: res.data.name || p.name,
      email: res.data.email || p.email,
    }));
    await refreshData();
    setSession('authed');
  };

  const handleRegister = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    await apiRegister(data);
    await handleLogin(data.email, data.password);
  };

  const handleLogout = () => {
    clearTokens();
    setAccounts([]);
    setTransactions([]);
    setCurrentScreen('overview');
    setAuthScreen('login');
    setSession('guest');
  };

  const handleSync = async (): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await syncAccounts();
      await refreshData();
      return { ok: true, message: res.message || 'Synced successfully' };
    } catch (e) {
      return { ok: false, message: e instanceof ApiError ? e.message : 'Sync failed — try again' };
    }
  };

  const handleAddBudget = (newCat: Omit<BudgetCategoryItem, 'id'>) => {
    setBudgetCategories((prev) => [...prev, { ...newCat, id: `bg-${Date.now()}` }]);
  };

  const handleResetAllData = () => {
    setProfile(INITIAL_PROFILE);
    setBudgetCategories(INITIAL_BUDGET_CATEGORIES);
  };

  const selectAccountAndNavigate = (account: AccountItem) => {
    setSelectedAccount(account);
    setCurrentScreen('account-detail');
  };

  // Auto-logout after 5 min inactivity (same as mobile)
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (session !== 'authed') return;
    const bump = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true, capture: true }));
    const check = setInterval(() => {
      if (Date.now() - lastActivityRef.current > 5 * 60 * 1000) handleLogout();
    }, 30_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump, { capture: true }));
      clearInterval(check);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (session === 'loading') {
    return (
      <div className="h-dvh w-full bg-[#fafbfc] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (session === 'guest') {
    return authScreen === 'login' ? (
      <LoginScreen onLogin={handleLogin} onSwitchToRegister={() => setAuthScreen('register')} />
    ) : (
      <RegisterScreen onRegister={handleRegister} onSwitchToLogin={() => setAuthScreen('login')} />
    );
  }

  // Profile is a full-bleed screen without the tab bar (same as mobile)
  if (currentScreen === 'profile') {
    return (
      <div className="h-dvh w-full flex flex-col bg-[#fafbfc] text-gray-900">
        <div className="flex-1 flex flex-col overflow-hidden max-w-md w-full mx-auto border-x border-gray-100 shadow-[0_0_30px_rgba(0,0,0,0.05)]">
          <ProfileScreen profile={profile} onBack={() => setCurrentScreen('overview')} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full flex flex-col bg-[#fafbfc] text-gray-900 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden max-w-md w-full mx-auto border-x border-gray-100 shadow-[0_0_30px_rgba(0,0,0,0.05)]">
        {currentScreen === 'overview' && (
          <OverviewScreen
            accounts={accounts}
            transactions={transactions}
            profile={profile}
            onNavigate={setCurrentScreen}
            onSelectAccount={selectAccountAndNavigate}
            onSelectTransaction={setSelectedTx}
            onSelectCategory={(category) => {
              setTxCategoryFilter(category);
              setTxFilter(null);
              setCurrentScreen('transactions');
            }}
            onSelectStat={(stat) => {
              setTxFilter(stat);
              setTxCategoryFilter(null);
              setCurrentScreen('transactions');
            }}
            onAccountsLoaded={setAccounts}
            onSync={handleSync}
          />
        )}

        {currentScreen === 'accounts' && (
          <AccountsScreen
            accounts={accounts}
            onNavigate={setCurrentScreen}
            onSelectAccount={selectAccountAndNavigate}
            onAccountsLoaded={setAccounts}
          />
        )}

        {currentScreen === 'account-detail' && selectedAccount && (
          <AccountDetailScreen
            key={selectedAccount.id}
            account={selectedAccount}
            transactions={transactions}
            onNavigate={setCurrentScreen}
            onSelectTransaction={setSelectedTx}
          />
        )}

        {currentScreen === 'transactions' && (
          <TransactionsScreen
            key={`${txCategoryFilter ?? ''}|${txFilter ?? ''}`}
            transactions={transactions}
            onNavigate={setCurrentScreen}
            onSelectTransaction={setSelectedTx}
            onTransactionsLoaded={setTransactions}
            initialSearch={txCategoryFilter || undefined}
            initialFilter={txFilter || undefined}
          />
        )}

        {currentScreen === 'budgets' && (
          <BudgetsScreen
            categories={budgetCategories}
            onNavigate={setCurrentScreen}
            onOpenAddModal={() => setIsAddBudgetOpen(true)}
            onSelectCategory={() => {}}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            profile={profile}
            onUpdateProfile={(updated) => setProfile((p) => ({ ...p, ...updated }))}
            onNavigate={setCurrentScreen}
            onChangePassword={() => setActiveSettingsModal('password')}
            onChangeEmail={() => setActiveSettingsModal('email')}
            onDeleteAccount={() => setActiveSettingsModal('delete')}
            onLogout={handleLogout}
            onSync={handleSync}
          />
        )}
      </div>

      <BottomNavBar currentScreen={currentScreen} onNavigate={setCurrentScreen} />

      <AddBudgetModal
        isOpen={isAddBudgetOpen}
        onClose={() => setIsAddBudgetOpen(false)}
        onAdd={handleAddBudget}
      />

      <TransactionDetailsModal
        tx={selectedTx}
        bankName={accounts.find((a) => a.id === selectedTx?.accountId)?.name}
        onClose={() => setSelectedTx(null)}
      />

      <SettingsModals
        activeModal={activeSettingsModal}
        profile={profile}
        onClose={() => setActiveSettingsModal(null)}
        onUpdateProfile={(updated) => setProfile((p) => ({ ...p, ...updated }))}
        onResetAllData={handleResetAllData}
      />
    </div>
  );
}
