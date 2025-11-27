import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-tm-activity-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tm-activity-plan.component.html',
  styleUrls: ['./tm-activity-plan.component.scss']
})
export class AdminTmActivityPlanComponent {
  pageTitle = 'Admin — TM Activity Plan';
}

