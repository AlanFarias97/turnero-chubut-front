import {
  inject,
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  environment
} from 'src/environments/environment';

import {
  AdminUserRequest,
  AuthUser
} from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  private http =
    inject(HttpClient);

  listUsers() {
    return this.http.get<AuthUser[]>(
      `${environment.apiUrl}/users`
    );
  }

  createUser(request: AdminUserRequest & { password: string }) {
    return this.http.post<AuthUser>(
      `${environment.apiUrl}/users`,
      request
    );
  }

  updateUser(id: string, request: AdminUserRequest) {
    return this.http.put<AuthUser>(
      `${environment.apiUrl}/users/${id}`,
      request
    );
  }

  setUserActive(id: string, active: boolean) {
    return this.http.patch<AuthUser>(
      `${environment.apiUrl}/users/${id}/active`,
      { active }
    );
  }

  deleteUser(id: string) {
    return this.http.delete<void>(
      `${environment.apiUrl}/users/${id}`
    );
  }
}
