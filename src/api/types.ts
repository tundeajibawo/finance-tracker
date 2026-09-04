export interface LoginData {
  user_id: string;
  email: string;
  name: string;
  access_token: string;
  refresh_token: string;
  email_verified: boolean;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data: LoginData;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  address?: string;
}

export interface StatusResponse {
  status: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface MeResponse {
  status: boolean;
  message: string;
  data: {
    sub?: string;
    email?: string;
    name?: string;
    email_verified?: boolean;
    [key: string]: unknown;
  };
}

export interface ApiAccount {
  account_id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  account_type: string;
  account_balance: number;
  last_synced_at?: string;
  bank_logo?: string;
}

export interface AccountsResponse {
  status: boolean;
  message: string;
  data: { accounts: ApiAccount[] };
}

export interface ApiTransaction {
  transaction_type: 'debit' | 'credit';
  transaction_amount: number;
  transaction_narration: string;
  transaction_balance: number;
  transaction_date: string;
  transaction_currency: string;
  account_id: string;
  metadata?: {
    category?: string;
    channel?: string;
    payee?: string;
    payment_method?: string;
    ref_num?: string;
    payment_processor?: string;
    location?: string;
    reason?: string;
  };
}

export interface TransactionsResponse {
  status: boolean;
  message: string;
  data: ApiTransaction[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
}

export interface ConnectResponse {
  status: boolean;
  message: string;
  data: string;
}

export interface TransactionsQuery {
  account_id?: string;
  start_date?: string;
  end_date?: string;
  type?: 'debit' | 'credit';
  min_amount?: number;
  max_amount?: number;
  per_page?: number;
}
