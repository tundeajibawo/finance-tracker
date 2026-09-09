import { request } from './client';
import {
  AccountsResponse,
  ConnectResponse,
  StatusResponse,
  TransactionsQuery,
  TransactionsResponse,
} from './types';

export const CONNECT_REDIRECT_URL = 'https://everynaira.ng/connect/callback';

export function listAccounts() {
  return request<AccountsResponse>('/users/accounts');
}

export function listTransactions(params?: TransactionsQuery) {
  return request<TransactionsResponse>('/accounts/transactions', { params: { per_page: 100, ...params } });
}

export function syncAccounts() {
  return request<StatusResponse>('/sync');
}

const LAST_SYNC_KEY = 'en_last_sync_at';
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

export function shouldSync(): boolean {
  const last = Number(localStorage.getItem(LAST_SYNC_KEY) || 0);
  return Date.now() - last >= SYNC_INTERVAL_MS;
}

export async function syncAccountsThrottled(): Promise<StatusResponse | null> {
  if (!shouldSync()) return null;
  const res = await syncAccounts();
  localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
  return res;
}

export function connectAccount(redirectUrl: string = CONNECT_REDIRECT_URL) {
  return request<ConnectResponse>('/accounts/connect', { method: 'POST', body: { redirect_url: redirectUrl } });
}

export function listInstitutions(country?: string) {
  return request<StatusResponse>('/institutions', { auth: false, params: { country } });
}
