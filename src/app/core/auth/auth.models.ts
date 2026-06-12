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
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  role: UserRole;
  authProvider: AuthProvider;
  active: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  password: string;
  role: Exclude<UserRole, 'ADMINISTRADOR'>;
}

export interface AdminUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  password?: string;
  role: UserRole;
  active: boolean;
}
