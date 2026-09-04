import { AccountItem, TransactionItem } from '../types';
import { ApiAccount, ApiTransaction } from './types';
import { API_BASE_URL } from './client';

const THEMES = ['blue', 'green', 'purple', 'orange'] as const;

function hash(s: string) {
  return s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
}

function mapType(t: string | null | undefined): AccountItem['type'] {
  const s = (t || '').toLowerCase();
  if (s.includes('savings')) return 'Savings';
  if (s.includes('credit')) return 'Credit Card';
  if (s.includes('invest')) return 'Investment';
  return 'Checking';
}

export function mapApiAccount(a: ApiAccount): AccountItem {
  const logo = a.bank_logo;
  return {
    id: a.account_id,
    name: a.bank_name || a.account_name,
    type: mapType(a.account_type),
    accountTypeRaw: a.account_type,
    balance: Number(a.account_balance) || 0,
    accountNumberMasked: `•••• ${String(a.account_number).slice(-4)}`,
    colorTheme: THEMES[hash(a.account_id) % THEMES.length],
    logoUrl: logo ? (logo.startsWith('http') ? logo : `${API_BASE_URL}${logo}`) : undefined,
    lastSyncedAt: a.last_synced_at,
  };
}

export function mapApiAccountList(accounts: ApiAccount[]): AccountItem[] {
  return accounts
    .filter((a) => a.account_number)
    .map(mapApiAccount);
}

function dateGroup(dateStr: string): TransactionItem['dateGroup'] {
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return 'Earlier';
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86_400_000;
  if (t >= startToday) return 'Today';
  if (t >= startYesterday) return 'Yesterday';
  return 'Earlier';
}

const CATEGORY_KEYWORDS: Array<[TransactionItem['iconType'], string, string[]]> = [
  ['salary', 'Salary', ['salary', 'wages', 'payroll', 'payslip']],
  ['gas', 'Transport', ['fuel', 'diesel', 'petrol', 'uber', 'bolt', 'taxi', 'transport', 'train', 'bus']],
  ['dining', 'Dining', ['restaurant', 'eatery', 'kfc', 'chicken', 'fast food', 'dominos', 'mcdonald']],
  ['coffee', 'Coffee', ['coffee', 'starbucks', 'cafe', 'espresso']],
  ['food', 'Food', ['food', 'provision', 'grocery', 'groceries', 'chop', 'suya', 'shawarma', 'shoprite', 'supermarket']],
  ['shopping', 'Shopping', ['shop', 'store', 'market', 'mall', 'amazon', 'jumia', 'konga', 'online']],
];

const METADATA_CATEGORIES: Record<string, { category: string; iconType: TransactionItem['iconType'] }> = {
  salary: { category: 'Salary', iconType: 'salary' },
  food: { category: 'Food', iconType: 'food' },
  retail_payment: { category: 'Retail', iconType: 'shopping' },
  transfer: { category: 'Transfer', iconType: 'general' },
  phone_internet: { category: 'Internet & Phone', iconType: 'general' },
  bank_charge: { category: 'Bank Charges', iconType: 'general' },
};

export function classify(narration: string): { category: string; iconType: TransactionItem['iconType'] } {
  const n = narration.toLowerCase();
  for (const [iconType, category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => n.includes(k))) return { category, iconType };
  }
  return { category: 'General', iconType: 'general' };
}

export function mapApiTransaction(tx: ApiTransaction): TransactionItem {
  const narration = tx.transaction_narration || (tx.transaction_type === 'debit' ? 'Debit' : 'Credit');
  const amount = Math.abs(Number(tx.transaction_amount) || 0);
  const { category, iconType } =
    (tx.metadata?.category && METADATA_CATEGORIES[tx.metadata.category]) || classify(narration);
  return {
    id: `${tx.account_id}-${tx.transaction_date}-${tx.transaction_amount}`,
    accountId: tx.account_id,
    title: narration.length > 40 ? narration.slice(0, 40) + '…' : narration,
    narration,
    category,
    merchantOrSender: tx.transaction_currency || 'Bank',
    amount: tx.transaction_type === 'debit' ? -amount : amount,
    date: tx.transaction_date,
    dateGroup: dateGroup(tx.transaction_date),
    iconType: tx.transaction_type === 'credit' && iconType === 'general' ? 'salary' : iconType,
    isPending: false,
  };
}

export function mapApiTransactionList(txs: ApiTransaction[]): TransactionItem[] {
  // ponytail: API can return true duplicates (same account/date/amount/narration) — dedup on content, not just key suffix
  const seen = new Set<string>();
  const out: TransactionItem[] = [];
  for (const tx of txs) {
    const dedupKey = `${tx.account_id}|${tx.transaction_date}|${tx.transaction_amount}|${tx.transaction_narration}|${tx.transaction_type}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);
    const item = mapApiTransaction(tx);
    // keep id unique for React keys if two distinct narrations collide on date/amount/account
    let id = item.id;
    let n = 1;
    while (out.some((o) => o.id === id)) id = `${item.id}#${n++}`;
    out.push({ ...item, id });
  }
  return out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
