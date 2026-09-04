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

export function connectAccount(redirectUrl: string = CONNECT_REDIRECT_URL) {
  return request<ConnectResponse>('/accounts/connect', { method: 'POST', body: { redirect_url: redirectUrl } });
}

export function listInstitutions(country?: string) {
  return request<StatusResponse>('/institutions', { auth: false, params: { country } });
}
