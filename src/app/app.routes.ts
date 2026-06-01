import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard.page')
        .then(m => m.DashboardPage)
  },
  {
    path: 'catalogs',
    loadComponent: () =>
      import('./features/catalogs/pages/catalogs/catalogs.page')
        .then(m => m.CatalogsPage)
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./features/notes/pages/notes/notes.page')
        .then(m => m.NotesPage)
  },
  {
    path: 'workshop',
    loadComponent: () => import('./features/workshop/pages/workshop/workshop.page').then( m => m.WorkshopPage)
  }

];
