import {
  CommonModule
} from '@angular/common';

import {
  Component,
  inject,
  NgZone
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  IonContent
} from '@ionic/angular/standalone';

import {
  AuthService
} from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent
  ]
})
export class LoginPage {

  private authService =
    inject(AuthService);

  private router =
    inject(Router);

  private route =
    inject(ActivatedRoute);

  private zone =
    inject(NgZone);

  email = '';

  password = '';

  isSubmitting = false;

  errorMessage = '';

  ionViewWillEnter(): void {
    if (this.authService.isAuthenticated()) {
      this.navigateAfterLogin();
      return;
    }

    this.isSubmitting = false;
    this.errorMessage = '';
  }

  login(event?: Event): void {
    event?.preventDefault();

    if (
      !this.email.trim() ||
      !this.password
    ) {
      this.errorMessage =
        'Ingresa email y contrasena.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService
      .login({
        email:
          this.email.trim(),
        password:
          this.password
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.navigateAfterLogin();
        },
        error: () => {
          this.errorMessage =
            'Email o contrasena incorrectos.';
          this.isSubmitting = false;
        }
      });
  }

  private navigateAfterLogin(): void {
    const returnUrl =
      this.route.snapshot
        .queryParamMap
        .get('returnUrl') ||
      '/dashboard';

    this.zone.run(() => {
      this.router
        .navigateByUrl(returnUrl)
        .then(navigated => {
          if (!navigated) {
            window.location.assign(returnUrl);
          }
        });
    });
  }
}
