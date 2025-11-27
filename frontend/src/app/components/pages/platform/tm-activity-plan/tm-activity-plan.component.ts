import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tm-activity-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tm-activity-plan.component.html',
  styleUrls: ['./tm-activity-plan.component.scss']
})
export class TmActivityPlanComponent {
  pageTitle = 'Platform KPI — TM Activity Plan';
}

