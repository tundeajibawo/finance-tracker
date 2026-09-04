import { request } from './client';
import { LoginResponse, MeResponse, RegisterRequest, StatusResponse } from './types';

export function login(email: string, password: string) {
  return request<LoginResponse>('/auth/login', { method: 'POST', auth: false, body: { email, password } });
}

export function register(payload: RegisterRequest) {
  return request<StatusResponse>('/auth/register', { method: 'POST', auth: false, body: payload });
}

export function me() {
  return request<MeResponse>('/auth/me');
}
