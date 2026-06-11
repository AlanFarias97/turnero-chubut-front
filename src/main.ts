import { bootstrapApplication } from '@angular/platform-browser';

import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules
} from '@angular/router';

import {
  IonicRouteStrategy,
  provideIonicAngular
} from '@ionic/angular/standalone';

import {
  importProvidersFrom
} from '@angular/core';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { AppComponent } from './app/app.component';

import { routes } from './app/app.routes';

import {
  authInterceptor
} from './app/core/auth/auth.interceptor';

import {
  QuillModule
} from 'ngx-quill';

import 'quill-mention';

bootstrapApplication(
  AppComponent,
  {

    providers: [

      {
        provide: RouteReuseStrategy,
        useClass: IonicRouteStrategy
      },

      provideIonicAngular(),

      provideRouter(
        routes,
        withPreloading(
          PreloadAllModules
        )
      ),

      provideHttpClient(
        withInterceptors([
          authInterceptor
        ])
      ),

      importProvidersFrom(
        QuillModule.forRoot()
      )

    ]

  }
);
