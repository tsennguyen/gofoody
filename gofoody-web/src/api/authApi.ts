import httpClient from './httpClient';
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  CurrentUserDto,
} from './types';

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await httpClient.post<AuthResponse>('/api/auth/register', payload);
  return response.data;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await httpClient.post<AuthResponse>('/api/auth/login', payload);
  return response.data;
}

export async function getCurrentUser(): Promise<CurrentUserDto> {
  const response = await httpClient.get<CurrentUserDto>('/api/account/me');
  return response.data;
}
