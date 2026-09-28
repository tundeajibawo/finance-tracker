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

export function resetPassword(email: string) {
  return request<StatusResponse>('/auth/resetPassword', { method: 'POST', auth: false, body: { email } });
}

export function confirmPasswordReset(code: string, password: string) {
  return request<StatusResponse>('/auth/passwordReset', { method: 'POST', auth: false, body: { code, password } });
}
