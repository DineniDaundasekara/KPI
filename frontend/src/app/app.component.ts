// src/app/app.component.ts
import { Component } from '@angular/core';
import { UserRegistrationComponent } from './components/pages/admin/user-registration/user-registration.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UserRegistrationComponent],
  template: `
    <app-user-registration></app-user-registration>
  `,
  styles: []
})
export class AppComponent {
  title = 'KPI Dashboard';
}