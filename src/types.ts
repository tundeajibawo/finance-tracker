export type ScreenType =
  | 'overview'
  | 'accounts'
  | 'transactions'
  | 'budgets'
  | 'settings'
  | 'profile'
  | 'account-detail';

export interface AccountItem {
  id: string;
  name: string;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Investment';
  accountTypeRaw?: string;
  balance: number;
  accountNumberMasked: string; // e.g. "•••• 1234"
  colorTheme: 'blue' | 'green' | 'purple' | 'orange';
  logoUrl?: string;
  lastSyncedAt?: string;
}

export interface TransactionItem {
  id: string;
  accountId?: string;
  title: string;
  narration?: string;
  category: string;
  merchantOrSender: string;
  amount: number; // negative for expense, positive for income
  date: string; // e.g. "Today", "Yesterday", "2024-08-10"
  dateGroup: 'Today' | 'Yesterday' | 'Earlier';
  iconType: 'food' | 'shopping' | 'coffee' | 'dining' | 'salary' | 'gas' | 'general';
  isPending?: boolean;
}

export interface BudgetCategoryItem {
  id: string;
  name: string;
  spent: number;
  total: number;
  iconType: 'groceries' | 'entertainment' | 'transportation' | 'dining' | 'utilities' | 'other';
  color: 'green' | 'amber' | 'cyan' | 'rose' | 'indigo';
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  transactionAlerts: boolean;
  lowBalanceAlerts: boolean;
}
