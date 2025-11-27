import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-service-fulfilment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-fulfilment.component.html',
  styleUrls: ['./service-fulfilment.component.scss']
})
export class AdminServiceFulfilmentComponent {
  pageTitle = 'Admin — Service Fulfilment';
}

