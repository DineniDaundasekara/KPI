import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-current-month',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-month.component.html',
  styleUrls: ['./current-month.component.scss']
})
export class CurrentMonthComponent {
  pageTitle = 'Overall KPI — Current Month';
}

