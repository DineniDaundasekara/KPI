// main.ts
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { App } from './app/app';

// If you have routes, define them here
import { routes } from './app/app.routes'; // You need to create this file

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideRouter(routes) // Add this for routing
  ]
}).catch(err => console.error(err));