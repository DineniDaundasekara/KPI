import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-registration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-registration.component.html',
  styleUrls: ['./admin-registration.component.scss']
})
export class AdminRegistrationComponent {
  pageTitle = 'Admin — Admin Registration';
}

