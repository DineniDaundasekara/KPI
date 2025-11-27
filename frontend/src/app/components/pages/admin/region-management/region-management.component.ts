import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-region-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './region-management.component.html',
  styleUrls: ['./region-management.component.scss']
})
export class RegionManagementComponent {
  pageTitle = 'Admin — Region Management';
}

