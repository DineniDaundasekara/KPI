import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { MsalService, MsalGuard, MsalInterceptor, MsalBroadcastService, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InteractionType } from '@azure/msal-browser';
import { createMsalInstance, loginRequest } from './auth-config';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()), // Required for interceptors
    provideAnimations(),
    provideRouter(routes),
    provideToastr(),
    { provide: MSAL_INSTANCE, useFactory: createMsalInstance },
    MsalService,
    MsalBroadcastService,
    MsalGuard,
    {
      provide: MSAL_GUARD_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        authRequest: loginRequest
      }
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG, useValue: {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          // Add API scopes here if needed
          // ['https://graph.microsoft.com/v1.0/me', ['user.read']]
        ])
      }
    },
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true }
  ]
};