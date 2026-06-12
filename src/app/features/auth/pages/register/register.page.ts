import {
  CommonModule
} from '@angular/common';

import {
  Component,
  inject
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import { RouterLink } from '@angular/router';

import {
  IonContent
} from '@ionic/angular/standalone';

import {
  RegisterRequest
} from 'src/app/core/auth/auth.models';

import {
  AuthService
} from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    RouterLink
  ]
})
export class RegisterPage {

  private authService =
    inject(AuthService);

  form: RegisterRequest = {
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    password: '',
    role: 'CAJERO'
  };

  confirmPassword = '';

  isSubmitting = false;

  errorMessage = '';

  ionViewWillEnter(): void {
    if (this.authService.isAuthenticated()) {
      this.navigateToDashboard();
      return;
    }

    this.isSubmitting = false;
    this.errorMessage = '';
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.form.password);
  }

  get hasSpecialCharacter(): boolean {
    return /[^A-Za-z0-9]/.test(this.form.password);
  }

  get hasMinimumLength(): boolean {
    return this.form.password.length >= 6;
  }

  get passwordsMatch(): boolean {
    return !!this.form.password &&
      this.form.password === this.confirmPassword;
  }

  register(event?: Event): void {
    event?.preventDefault();

    this.errorMessage = '';

    if (!this.isFormValid()) {
      this.errorMessage =
        'Completa todos los campos y revisa la contraseña.';
      return;
    }

    this.isSubmitting = true;

    this.authService
      .register({
        ...this.form,
        email:
          this.form.email.trim(),
        firstName:
          this.form.firstName.trim(),
        lastName:
          this.form.lastName.trim(),
        phoneNumber:
          this.form.phoneNumber.trim(),
        address:
          this.form.address.trim()
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.navigateToDashboard();
        },
        error: response => {
          this.errorMessage =
            response?.status === 409
              ? 'Ese email ya esta registrado.'
              : 'No pudimos crear la cuenta. Revisa los datos e intenta de nuevo.';

          this.isSubmitting = false;
        }
      });
  }

  private isFormValid(): boolean {
    return !!this.form.email.trim() &&
      !!this.form.firstName.trim() &&
      !!this.form.lastName.trim() &&
      !!this.form.phoneNumber.trim() &&
      !!this.form.address.trim() &&
      (this.form.role === 'CAJERO' || this.form.role === 'OPERARIO') &&
      this.hasUppercase &&
      this.hasSpecialCharacter &&
      this.hasMinimumLength &&
      this.passwordsMatch;
  }

  private navigateToDashboard(): void {
    window.location.assign('/dashboard');
  }
}
