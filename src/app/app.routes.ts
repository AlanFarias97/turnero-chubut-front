import { Routes } from '@angular/router';

import {
  authGuard
} from './core/auth/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.page')
        .then(m => m.LoginPage)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register.page')
        .then(m => m.RegisterPage)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard.page')
        .then(m => m.DashboardPage)
  },
  {
    path: 'catalogs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/catalogs/pages/catalogs/catalogs.page')
        .then(m => m.CatalogsPage)
  },
  {
    path: 'notes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notes/pages/notes/notes.page')
        .then(m => m.NotesPage)
  },
  {
    path: 'workshop',
    loadComponent: () => import('./features/workshop/pages/workshop/workshop.page').then( m => m.WorkshopPage)
  }

];
