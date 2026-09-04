import type { LucideIcon } from 'lucide-react';
import {
  Banknote,
  Building2,
  Car,
  Coffee,
  CreditCard,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Tag,
  TrendingUp,
  Utensils,
  Zap,
} from 'lucide-react';
import { AccountItem, BudgetCategoryItem, TransactionItem } from './types';

export const TX_ICONS: Record<TransactionItem['iconType'], LucideIcon> = {
  food: Receipt,
  shopping: ShoppingCart,
  coffee: Coffee,
  dining: Utensils,
  salary: Banknote,
  gas: Car,
  general: ShoppingBag,
};

export const ACCOUNT_BADGE: Record<
  AccountItem['colorTheme'],
  { bg: string; color: string; Icon: LucideIcon }
> = {
  blue: { bg: '#dbeafe', color: '#2563eb', Icon: Building2 },
  green: { bg: '#d1fae5', color: '#059669', Icon: CreditCard },
  purple: { bg: '#f3e8ff', color: '#9333ea', Icon: TrendingUp },
  orange: { bg: '#ffedd5', color: '#ea580c', Icon: Banknote },
};

export const BUDGET_ICONS: Record<BudgetCategoryItem['iconType'], LucideIcon> = {
  groceries: ShoppingCart,
  entertainment: Smile,
  transportation: Car,
  dining: Utensils,
  utilities: Zap,
  other: Tag,
};

export const BUDGET_COLORS: Record<BudgetCategoryItem['color'], string> = {
  green: '#10b981',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  rose: '#f43f5e',
  indigo: '#6366f1',
};
