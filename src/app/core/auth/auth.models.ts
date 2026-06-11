export type UserRole =
  | 'OPERARIO'
  | 'CAJERO'
  | 'ADMINISTRADOR';

export type AuthProvider =
  | 'EMAIL'
  | 'GOOGLE';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  authProvider: AuthProvider;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}
