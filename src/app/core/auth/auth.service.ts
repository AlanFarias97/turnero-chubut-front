import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  tap
} from 'rxjs';

import {
  environment
} from 'src/environments/environment';

import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest
} from './auth.models';

const TOKEN_KEY =
  'turnero_auth_token';

const USER_KEY =
  'turnero_auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http =
    inject(HttpClient);

  private userSignal =
    signal<AuthUser | null>(
      this.readStoredUser()
    );

  readonly user =
    this.userSignal.asReadonly();

  readonly userEmail =
    computed(() =>
      this.userSignal()?.email ?? ''
    );

  readonly isAdmin =
    computed(() =>
      this.userSignal()?.role === 'ADMINISTRADOR'
    );

  readonly isAuthenticated =
    computed(() =>
      !!this.getToken() &&
      !!this.userSignal()
    );

  login(
    request: LoginRequest
  ) {
    return this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/auth/login`,
        request
      )
      .pipe(
        tap(response =>
          this.storeSession(response)
        )
      );
  }

  register(
    request: RegisterRequest
  ) {
    return this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/auth/register`,
        request
      )
      .pipe(
        tap(response =>
          this.storeSession(response)
        )
      );
  }

  refreshCurrentUser() {
    return this.http
      .get<AuthUser>(
        `${environment.apiUrl}/auth/me`
      )
      .pipe(
        tap(user =>
          this.storeUser(user)
        )
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private storeSession(
    response: AuthResponse
  ): void {
    localStorage.setItem(
      TOKEN_KEY,
      response.token
    );

    this.storeUser(response.user);
  }

  private storeUser(
    user: AuthUser
  ): void {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );

    this.userSignal.set(user);
  }

  private readStoredUser(): AuthUser | null {
    const rawUser =
      localStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
}
