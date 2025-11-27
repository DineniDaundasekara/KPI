import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-service.component.html',
  styleUrls: ['./email-service.component.scss']
})
export class EmailServiceComponent {
  pageTitle = 'Admin — E-mail Service';
}

