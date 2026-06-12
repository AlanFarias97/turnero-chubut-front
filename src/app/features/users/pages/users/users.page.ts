import {
  CommonModule
} from '@angular/common';

import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  IonContent
} from '@ionic/angular/standalone';

import {
  AdminUserRequest,
  AuthUser,
  UserRole
} from 'src/app/core/auth/auth.models';

import {
  AdminUserService
} from 'src/app/core/auth/admin-user.service';

import {
  AuthService
} from 'src/app/core/auth/auth.service';

type UserForm = AdminUserRequest & {
  password: string;
};

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    RouterLink
  ]
})
export class UsersPage implements OnInit {

  private adminUserService =
    inject(AdminUserService);

  private authService =
    inject(AuthService);

  private router =
    inject(Router);

  userEmail =
    this.authService.userEmail;

  isAdmin =
    this.authService.isAdmin;

  currentUser =
    this.authService.user;

  users: AuthUser[] = [];

  searchTerm = '';

  isLoading = false;

  showForm = false;

  isEditing = false;

  selectedUserId: string | null = null;

  errorMessage = '';

  form: UserForm =
    this.createEmptyForm();

  ngOnInit(): void {
    this.loadUsers();
  }

  get filteredUsers(): AuthUser[] {
    const term =
      this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.users;
    }

    return this.users.filter(user =>
      user.email.toLowerCase().includes(term) ||
      user.displayName.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }

  openCreateForm(): void {
    this.isEditing = false;
    this.selectedUserId = null;
    this.form = this.createEmptyForm();
    this.errorMessage = '';
    this.showForm = true;
  }

  openEditForm(user: AuthUser): void {
    this.isEditing = true;
    this.selectedUserId = user.id;
    this.form = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      password: '',
      role: user.role,
      active: user.active
    };
    this.errorMessage = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.errorMessage = '';
  }

  saveUser(event?: Event): void {
    event?.preventDefault();
    this.errorMessage = '';

    if (!this.isFormValid()) {
      this.errorMessage =
        'Completa los campos obligatorios y revisa la contraseña.';
      return;
    }

    const request =
      this.buildRequest();

    const action =
      this.isEditing && this.selectedUserId
        ? this.adminUserService.updateUser(this.selectedUserId, request)
        : this.adminUserService.createUser({
            ...request,
            password:
              this.form.password
          });

    action.subscribe({
      next: () => {
        this.closeForm();
        this.loadUsers();
      },
      error: response => {
        this.errorMessage =
          response?.status === 409
            ? 'Ese email ya esta registrado.'
            : 'No pudimos guardar el usuario.';
      }
    });
  }

  toggleActive(user: AuthUser): void {
    this.adminUserService
      .setUserActive(user.id, !user.active)
      .subscribe({
        next: updatedUser => {
          this.users = this.users.map(item =>
            item.id === updatedUser.id
              ? updatedUser
              : item
          );
        },
        error: () => {
          this.errorMessage =
            'No pudimos cambiar el estado del usuario.';
        }
      });
  }

  isCurrentUser(user: AuthUser): boolean {
    return this.currentUser()?.id === user.id;
  }

  deleteUser(user: AuthUser): void {
    const confirmed =
      window.confirm(`Borrar usuario ${user.email}?`);

    if (!confirmed) {
      return;
    }

    this.adminUserService
      .deleteUser(user.id)
      .subscribe({
        next: () => {
          this.users =
            this.users.filter(item =>
              item.id !== user.id
            );
        },
        error: () => {
          this.errorMessage =
            'No pudimos borrar el usuario.';
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  private loadUsers(): void {
    this.isLoading = true;

    this.adminUserService
      .listUsers()
      .subscribe({
        next: users => {
          this.users = users;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage =
            'No pudimos cargar los usuarios.';
          this.isLoading = false;
        }
      });
  }

  private createEmptyForm(): UserForm {
    return {
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      password: '',
      role: 'CAJERO',
      active: true
    };
  }

  private isFormValid(): boolean {
    const needsPassword =
      !this.isEditing;

    return !!this.form.email.trim() &&
      !!this.form.firstName.trim() &&
      !!this.form.lastName.trim() &&
      !!this.form.phoneNumber.trim() &&
      !!this.form.address.trim() &&
      this.isValidRole(this.form.role) &&
      (
        !needsPassword ||
        this.isValidPassword(this.form.password)
      ) &&
      (
        !this.form.password ||
        this.isValidPassword(this.form.password)
      );
  }

  private isValidPassword(password: string): boolean {
    return password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);
  }

  private isValidRole(role: UserRole): boolean {
    return role === 'ADMINISTRADOR' ||
      role === 'CAJERO' ||
      role === 'OPERARIO';
  }

  private buildRequest(): AdminUserRequest {
    return {
      email:
        this.form.email.trim(),
      firstName:
        this.form.firstName.trim(),
      lastName:
        this.form.lastName.trim(),
      phoneNumber:
        this.form.phoneNumber.trim(),
      address:
        this.form.address.trim(),
      password:
        this.form.password,
      role:
        this.form.role,
      active:
        this.form.active
    };
  }
}
